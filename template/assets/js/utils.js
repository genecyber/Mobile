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