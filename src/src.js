var Buffer = require('buffer/').Buffer 
var CovalLib = require('coval.js')
var Coval =  new CovalLib.Coval()
var hdkey = new Coval.Secure.HDKey()
var user = new Coval.User.Server()
const encryption = require('crypto')
var QRCode = require('qrcode')
var signer = require('sweep')
window.QRCode = QRCode

var storageLocation = 'EmblemFileVault-storage'
User = user
Coval = Coval
hdkey = hdkey
window.keys = []

try {
    $ = jQuery = require('../bower_components/jquery/dist/jquery')
} catch (e) { }
getWallet = function() {
    if (!localStorage.getItem(storageLocation)) {
        checkForAuth(getWallet)                  
    } else {
        if (!JSON.parse(localStorage.getItem(storageLocation))[0].address) {
            var token = JSON.parse(localStorage.getItem(storageLocation))[0].accessToken
            checkForAuth(function(){
                var eth = require('../util/ethereum')
                window.ethereum = eth
                var ethereumWallet = ethereum.wallet.generate()
                var ethereumKey = ethereumWallet.privKey.toString('hex')
                var ethereumAddress = ethereumWallet.getAddress().toString('hex')
                hdkey.StandardHDKey('0', function(address, key){
                    keys[0] = {address: address, key:key, ethereum: {privKey: ethereumKey, address: ethereumAddress }, accessToken: token}
                    localStorage.setItem(storageLocation, JSON.stringify(keys))
                    getBalance(balances=>{
                        console.log(balances)
                    })
                    getWallet()
                })                            
            })                        
        } else {
            checkForAuth(function(){
                keys = JSON.parse(localStorage.getItem(storageLocation))
                var eth = require('../util/ethereum')
                window.ethereum = eth
                /* var address = keys[0].address
                var id = keys[0].accessToken.unloq_id
                var key = keys[0].accessToken.unloq_key

                $(".my-address").text(keys[0].address)
                $(".my-eth-address").text("0x" + keys[0].ethereum.address)
                getBalance((balances)=>{
                    console.log("balances", balances)
                }) */
                
            })
        }
    }                
}
getBalance = function(cb) {
    console.log("in getBalance")
    var balances = {emblems: []}
    getEmblemBalance(keys[0].address, (balance)=>{
        
        /*  
        getEthBalance(keys[0].ethereum.address, (ethBalance)=>{
            balances.eth = ethBalance
            //return checkComplete()
        })

        getFuelVoucherBalance((fuelBalance)=>{
            balances.voucher = fuelBalance
            //return checkComplete()
        })

        getFuelBalance(keys[0].address, (fuelBalance)=>{
            balances.fuel = fuelBalance
            //checkComplete()
        }) */

        var identityBalance = balance.filter(emblem=>{return emblem.name.includes("identity-")})
        var emblemBalance = balance.filter(emblem=>{return emblem.name.includes("EMBLEM")})
        
        emblemBalance.forEach(emblem=>{
            getEmblemName(emblem.name, (name)=>{
                emblem.styledName = name
                balances.emblems.push(emblem)
                return checkComplete()
           })            
        })

        /* identityBalance.forEach(emblem=>{
            emblem.styledName = emblem.name
            balances.emblems.push(emblem)
            return checkComplete()           
        }) */

        function checkComplete(){
            if (balances.emblems.length === emblemBalance.length /* + identityBalance.length */ /* && balances.voucher && balances.eth && balances.fuel */) {
                if (cb) {
                    return cb(balances)
                } 
            }
        }
    })
    /* getEthBalance(keys[0].ethereum.address, (ethBalance)=>{
        //$(".ethBalance").text(ethBalance)
        balances.eth = ethBalance
    })
    getFuelVoucherBalance((fuelBalance)=>{
        balances.voucher = fuelBalance
        //$(".fuelVoucherBalance").text(fuelBalance)
    })
    getFuelBalance(keys[0].address, (fuelBalance)=>{
        balances.fuel = fuelBalance
        //$(".fuelBalance").text(fuelBalance.balance)
    }) */
}
getEmblemBalance = function(address, cb){
    var queryURL = "//35.225.9.182/balance?address=" + address + "&nocache=" + rnd()
    
    $.ajax({
        url: queryURL,
        context: document.body
    }).done(function(val) {
        return cb(val)
    })
}
getFuelBalance = function(address, cb) {
    var queryURL = "http://35.225.9.95/emblem/"+ address +"/balance?asset=fuel" + "&nocache=" + rnd()
    
    $.ajax({
        url: queryURL,
        context: document.body
    }).done(function(val) {
        return cb(val)
    })
}
getEmblemDetails = function(name, cb) {
    var queryURL = "http://sandboxbeta.myemblemwallet.com/" + "retrieve?type=contents&name=" + name + "&stream=emblems"
    $.ajax({
        url: queryURL,
        context: document.body
    }).done(function(val) {
        $(".emblemcontents").html("")
        var contents = JSON.parse(val.decoded)
        Object.keys(contents).forEach(key=>{
            if (key === "bitcoin") {
                getFuelBalance(contents[key].address, (fuelBalance)=>{
                    $(".emblem").append("<div></div><div>  Fuel Balance "+fuelBalance.balance+"</div>")
                })
                $(".emblemcontents").append("<div class=\"emblem\">Emblem : "+contents[key].address+"</div>")
            }
            $(".emblemcontents").append("<div class=\""+key+"\">"+key +" ("+contents[key].unit+") : "+contents[key].address+"</div>")
            console.log(contents[key])
        })        
    })
}
getEmblemName = function(name, cb) {
    var queryURL = "//35.225.9.182/" + "retrieve?type=name&name=" + name + "&stream=emblems"
    $.ajax({
        url: queryURL,
        context: document.body
    }).done(function(val) {
        if (val.decoded !== "null") {
            name = decodeURI(val.decoded)/*  + " (" + name + ")" */
        }
        return cb(name)
    })
}

rnd = function(){
    return Math.floor(Math.random() * (1000000 - 1) + 1)
}
checkForAuth = function (callback) {
    var storage = JSON.parse(localStorage.getItem(storageLocation))
    if (!storage || !storage[0].accessToken) {
        if (location.hash.split('?')[0] === "#register") {
            console.log("Register!!")
        } else if (location.hash.split('?')[0] === "#confirm") {
            console.log("Confirm")
        } else {
            generateEncryptionKey()
        }
    } else {
        return callback()
    }
}

generateEncryptionKey = function() {
    getNucypherPubkey(key=>{
        var id = Math.floor(Math.random() * (1000000 - 1) + 1)
        var accessToken = mockUnloq(id, key.key.privkey.hex, key)
        handleLoginSuccess(accessToken)
    })
}
mockUnloq = function(id, key, pk){
    var mock = { 
        "method": "MOCK", 
        "email": "", 
        "unloq_id": id.toString(),
        "unloq_key": key,
        "token": "", 
        "url": "",
        "pk": pk
    }
    return mock
}
 reset = function(reload) {
    localStorage.clear()
    if (reload) {
        location.reload()
    }
}

handleLoginSuccess = function(accessToken) {
    var storage
    if (!localStorage.getItem(storageLocation)) {
        storage = [{accessToken: null}]
    } else {
        storage = JSON.parse(localStorage.getItem(storageLocation))
    }
    storage[0].accessToken = accessToken
    localStorage.setItem(storageLocation, JSON.stringify(storage))
    //$('.ui.login.modal').modal('hide')
    getWallet()
}
$( document ).ready(function() {
    getWallet()
    //$(".createEmblem").click(createEmblem)
})
getNucypherPubkey = function(cb) {
    var queryURL = "//35.194.8.86/nucypher-key"
    $.ajax({
        url: queryURL,
        context: document.body
    }).done(function(payload) {
        console.log("made nucypher key", payload)
        return cb(payload)
    })    
}

function encrypt(password) {
    try {
        var cipher = encryption.createCipher('aes-256-cbc', password);
        var encrypted = Buffer.concat([cipher.update(new Buffer(JSON.stringify(keys), "utf8")), cipher.final()]).toString('hex')
        //FileSystem.writeFileSync(this.filePath, encrypted);
        return {encrypted: encrypted, message: "Encrypted!" }
    } catch (exception) {
        throw new Error(exception.message);
    }
}

function decrypt(data, password) {
    if (typeof data === 'object') {
        if (data.constructor !== Buffer){
            if (data.encrypted) {
                if (data.encrypted.constructor !== Buffer){
                    //data = new Buffer(data.encrypted, 'hex')
                    return decrypt(new Buffer(data.encrypted, 'hex'), password)
                } else {

                }
            } else {
                //data = new Buffer(data, 'hex')
                return decrypt(new Buffer(data, 'hex'), password)
            }
        }
    } else {
        //data = new Buffer(data, 'hex')
        return decrypt(new Buffer(data, 'hex'), password)
    }
    try {
        var decipher = encryption.createDecipher("aes-256-cbc", password);
        var decrypted = Buffer.concat([decipher.update(new Buffer(data, "utf8")), decipher.final()]);
        return JSON.parse(decrypted.toString());
    } catch (exception) {
        $("#fileinput").val("")
        alert("Incorrect password or invalid backup file")
        throw new Error(exception.message);
    }
}

window.storageLocation = storageLocation
window.hdkey = hdkey
window.encrypt = encrypt
window.decrypt = decrypt
window.signer = signer
window.getBalance = getBalance