const Web3 = require('web3')
const Tx = require('ethereumjs-tx')
var wallet = require('ethereumjs-wallet')


// connect to Infura node
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/b1c27a6711ec4772aa042f0cf9ee2d22'))

let minABI = [
    // transfer
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "type": "function"
    },
 // balanceOf
 {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    },
    // decimals
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
    }
];

var contractAddres="0xadd9617d081c3d9755f09abd876a0d43b987da0a"    
var contract = new web3.eth.Contract(minABI, contractAddres)

function signTx(txData, cb) {
    const privateKey = new Buffer(config.privKey, 'hex')
    const transaction = new Tx(txData)
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return cb(serializedTx)    
}

function transfer(serializedTx, cb){
    web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
    /* contract.methods.transfer("your account", "amount of erc20 tokens you want transfer").send({
        from: "your account"
    }) */
}

if (window.keys.length > 0 && window.keys[0].ethereum.privKey) {
    wallet = wallet.fromPrivateKey(new Buffer(window.keys[0].ethereum.privKey, 'hex'))
}

window.getEthBalance = function(account, cb){
    web3.eth.getBalance(account).then(balanceWei=>{
        balance = web3.eth.utils.fromWei(balanceWei, 'ether')
        console.log("balance", balanceWei, balance)
        return cb(balance)
    })
}

window.getFuelVoucherBalance = function(cb){
    let tokenAddress = contractAddres;
    let walletAddress = window.keys[0].ethereum.address;
    
    // The minimum ABI to get ERC20 Token balance
     
    // Get ERC20 Token contract instance
    const contract = new web3.eth.Contract(minABI, tokenAddress, {
        from: walletAddress,
        gasLimit: 3000000,
      })

      var contractData = ('0x70a08231000000000000000000000000' + walletAddress)
    web3.eth.call({
        to: tokenAddress, // Contract address, used call the token balance of the address in question
        data: contractData // Combination of contractData and tknAddress, required to call the balance of an address 
        }, function(err, result) {
        if (result) { 
            var tokens = web3.utils.toBN(result).toString(); // Convert the result to a usable number string
            console.log('Tokens Owned: ',tokens) // Change the string to be in Ether not Wei, and show it in the console
            return cb(tokens)
        }
        else {
            console.log(err); // Dump errors here
        }
    })
}

module.exports = { 
    web3: web3,
    contract: contract,
    signTx: signTx,
    transfer: transfer,
    wallet: wallet
}