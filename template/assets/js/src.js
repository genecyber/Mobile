$( document ).ready(()=>{
    setTimeout(()=>{loadPage()}, 150)
    renderHandlebarsTemplate('partials/footer.html', 'footer', {})
    renderHandlebarsTemplate('partials/nav.html', 'navigation', {title_demo: "With Data"})
    $(window).on('popstate', function (e) {
        var state = e.originalEvent.state
        if (state !== null) {
            loadPage(state.url, state.target)
        } else {
            loadPage()
        }
    })
    
    $(document).on('click', 'a', function (e) {
        if (window.ignore_click_override) return
        e.preventDefault()
        $(".w-nav-overlay").hide()
        var $this = $(this)
        var url = $this.attr("href")
        setUrl(url, 'content')
        renderHandlebarsTemplate('pages/'+url+'.html', 'content', {})
    })
})

 function loadScript(src, onLoad) {
    var script_tag = document.createElement('script')
    script_tag.setAttribute("type", "text/javascript")
    if (window.location.href && !src.substring(0, 8).includes('//') && !src.substring(0, 2) === "./") {
        src = getAbsolutePath() + src
    }
    script_tag.setAttribute("src", src)

    if (script_tag.readyState) {
        script_tag.onreadystatechange = function () {
            if (this.readyState == 'complete' || this.readyState == 'loaded') {
                onLoad();
            }
        };
    } else {
        script_tag.onload = onLoad;
    }
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
}

function loadPage(url, target) {
    if (!url && window.document.location.hash) {
        url = window.document.location.hash
        if (!target) {
            target = "content"
        }
    } else {
        if (!url) {
            url = "#index"
        }
        target = "content"
    }
    setUrl(url.replace('#', ''), target)
    renderHandlebarsTemplate('pages/'+url.replace('#', '')+'.html', target, {})
    
}

function getTemplateAjax(path, callback) {
    var source, template;
    $.ajax({
        url: path,
        success: function (data) {
            source = data;
            template = Handlebars.compile(source)
            if (callback) callback(template)
        }
    })
}

function renderHandlebarsTemplate(withTemplate, inElement, withData){
    if (withTemplate === undefined || withTemplate.includes("undefined")) return
    getTemplateAjax(withTemplate, function(template) {
        $(inElement).html(template(withData))
    })
}

function setUrl(path, template) {
    if (!path) return 
    var url = path,
    target = template

    history.pushState({
        url: url,
        target: target
    }, target, "#"+url)
    console.log("history state pushed", path, template)
}

function backup() {
    $("body").trigger('tap')
    setCloseModalEvent($(".modal"))
    renderHandlebarsTemplate('partials/backup.html', 'modalcontent', {context: {backup: true, restore: false}})
}

function restore() {
    $("body").trigger('tap')
    setCloseModalEvent($(".modal"))
    renderHandlebarsTemplate('partials/backup.html', 'modalcontent', {context: {backup: false, restore: true}})
}

function chat() {
    $("body").trigger('tap')
    //renderHandlebarsTemplate('chat/chat.html', "content", {})
    loadPage('../chat/chat', "content")
}

function auth() {
    $("body").trigger('tap')
    renderHandlebarsTemplate('pages/auth.html', 'content', {})
}

function setCloseModalEvent(target){
    $("body").one( "tap", function(e) {
        if (target.find($(e.target)).length < 1 && target[0] !== $(e.target)[0]) {
            hideModal()
            target.hide()
        } else {
            e.stopImmediatePropagation()
            setCloseModalEvent(target)
        }
    })
}
function showModal(){
    $(".modal-wrapper").css('display', "flex")
    $(".modal").show()
    $(".modal-wrapper").css('z-index', 1)
}

function hideModal(){
    $(".modal-wrapper").css('display', "none")
    $(".modal").hide()
    $(".modal-wrapper").css('z-index', 0)
}

function issueIdToken(user, service) {
    user.address = keys[0].address
    user.service = service
    var settings = {
        "url": "https://hooks.zapier.com/hooks/catch/1319262/763l2e/",
        "method": "POST",
        "processData": false,
        "data": JSON.stringify(user)
      }
      
      $.ajax(settings).done(function (response) {
        console.log(response)
      })
      
}

