"use strict";
let YTAPI = false;
let ytPlyaerInterval;
function GS_Videos_Init(documentobj = document){
    let videos = documentobj.getElementsByClassName('gs-video-element');
    for (let video of videos) {
        var type = video.dataset.provider,
            isOverlay= video.dataset.overlay,
            isLightbox = video.dataset.lightbox,
            overlay = video.nextSibling,
            player;
           
        if( isOverlay === "false"){
            switch(type){
                case 'video':
                    let body = document.body;
                    if(video.getAttribute('src')){
                        getGSHostedVideo( video );
                    }else{
                        body.addEventListener("mouseover", getGSHostedVideo( video ), {once:true});
                        body.addEventListener("touchmove", getGSHostedVideo( video ), {once:true});
                        body.addEventListener("scroll", getGSHostedVideo( video ), {once:true});
                        body.addEventListener("keydown", getGSHostedVideo( video ), { once:true});
                    }
                    break;
                case 'youtube':
                    getGSYoutubeVideo( video );
                    break;
                case 'vimeo':
                    getGSVimeoVideo( video );
                    break;
            }
        } else {
         
            overlay.onclick = function(){
                let video = this.previousSibling,
                    type = this.dataset.type,
                    isLightbox = this.dataset.lightbox,
                    overlay = this;
                    
                if( isLightbox !== "true" ){
                  
                    switch(type){
                        case 'video':
                        
                            getGSHostedVideo( video );
                            break;
                        case 'youtube':
                            getGSYoutubeVideo( video );
                            break;
                        case 'vimeo':
                            getGSVimeoVideo( video );
                            break;
                    }
                    this.remove();
                } else {
                    let parentblock = video.closest( '.gs-video');
                    let parentId = parentblock.getAttribute('id');
                    const videolightbox = SimpleLightbox.open({
                        content: video,
                        elementClass: 'gs-video-popup'+' '+parentId,
                        beforeClose: function(e){
                         
                        lightboxCloseHanlder( type, video, videolightbox, player);
                        overlay.parentNode.insertBefore(video, overlay);
                        }
                    });
                    switch(type){
                        case 'video':
                            let el = getGSHostedVideo( video, parentblock, videolightbox);
                            break;
                        case 'youtube':
                           getGSYoutubeVideo( video, videolightbox );  
                            break;
                        case 'vimeo':
                            getGSVimeoVideo( video, videolightbox);
                            break;
                    }
                }
            }
        }
    }
}
GS_Videos_Init();

function getGSHostedVideo( video, parentblock='', videolightbox) {
    let idel = (parentblock) ? parentblock : video.closest('.gs-video');

    if(idel){
        let id = 'vidload'+idel.getAttribute('id');
       
        if(!document.getElementById(id)){
            
            var el = document.createElement("video");
            el.setAttribute('class', 'gs-video-element');
            el.setAttribute('src', video.dataset.src);
            el.setAttribute('id', id);
            el.setAttribute('poster', video.dataset.poster);
            el.autoplay = video.dataset.autoplay === "true" ? true : false;
            el.playsInline = video.dataset.playsinline === "true" ? true : false;
            el.controls = video.dataset.controls === "true" ? true : false;
            el.loop = video.dataset.loop === "true" ? true : false;
            el.muted = video.dataset.mute === "true" ? true : false;
            video.replaceWith(el);
            
            if(video.dataset.autoplay === "true"){
                playHtml5Video(el, video, videolightbox);
            }
           
        }
    }
    return;
}

function getGSVideoIDFromURL(url, regex) {
    var videoIDParts = url.match(regex);
    return videoIDParts && videoIDParts[1];
}


function getGSYoutubeRegex() {
    return /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?vi?=|(?:embed|v|vi|user)\/|shorts\/|live\/))([^?&"'>]+)/;
}


function getGSYoutubeVideo( video, videolightbox) {
 
    var src = video.dataset.src;
    if(!src){
        src = video.getAttribute('data-data-src');
    }
    let videoID = getGSVideoIDFromURL(src, getGSYoutubeRegex());
    var url = 'https://www.youtube.com/embed/'
        + videoID
        + "?autoplay=" + (video.dataset.autoplay === "true" ? "1" : "0")
        + '&loop=' + (video.dataset.loop === "true" ? "1" : "0")
        + '&playsinline=' + (video.dataset.playsinline === "true" ? "1" : "0")
        + '&controls=' + (video.dataset.controls === "true" ? "1" : "0")
        + '&modestbranding=' + (video.dataset.modestbranding === "true" ? "1" : "0")
        + '&rel=' + (video.dataset.rel === "true" ? "1" : "0")
        + '&mute=' + (video.dataset.mute === "true" ? "1" : "0")
        + (video.dataset.start && video.dataset.loop === "false" ? "&start=" + video.dataset.start : "")
        + (video.dataset.end && video.dataset.loop === "false" ? "&end=" + video.dataset.end : "")
        + '&enablejsapi=1'
        + (video.dataset.loop === "true" ? "&playlist="+videoID : "");
        video.setAttribute("allow", "autoplay");
        video.setAttribute('src', url);  
        
        if(video.dataset.lightbox == "true"){
            initYTapi(video, videolightbox); 
        }    
}

function getGSVimeoRegex() {
    return /^(?:https?:\/\/)?(?:www|player\.)?(?:vimeo\.com\/)?(?:video\/|external\/)?(\d+)([^.?&#"'>]?)/;
}

function getGSVimeoVideo( video, videolightbox) {
    var src = video.dataset.src,
        videoID = getGSVideoIDFromURL(src, getGSVimeoRegex());
    var options = {
        id: videoID,
        autoplay: video.dataset.autoplay === "true" ? 1 : 0,
        loop: video.dataset.loop === "true" ? 1 : 0,
        playsinline: video.dataset.playsinline === "true" ? 1 : 0,
        muted: video.dataset.mute === "true" ? 1 : 0,
        controls: video.dataset.controls === "true" ? 1 : 0,
        title: video.dataset.title === "true" ? 1 : 0,
        portrait: video.dataset.portrait === "true" ? 1 : 0,
        byline: video.dataset.byline === "true" ? 1 : 0,
    };
    let player = new Vimeo.Player(video, options);
    ! isNaN(video.dataset.start) && player.setCurrentTime( parseInt(video.dataset.start));
    let duration, currentTime = 0
    if( video.dataset.lightbox == "true" ){
        player.on('timeupdate', (data) => {
             duration = data.duration;
             currentTime = data.seconds;
            videolightbox.elaspedTime = parseInt(currentTime) < parseInt(duration - 5) ? currentTime : 0;
        });
    }

}

function playHtml5Video(el, video, videolightbox) {
    try {
        if (el) {
            el.currentTime = video?.dataset?.start ? video.dataset.start : 0;    
            const promise = el.play();
            if (promise !== undefined) {
                promise
                .then(() => { 
                })
                .catch((error) => {
                    // Autoplay was prevented.
                    el.muted = true;
                    el.play();
                });
            } 
            if( video.dataset.lightbox == "true" ){
                let currentTime, duration = 0;
                el.ontimeupdate = (event) => {
                    duration = event.target.duration;
                    currentTime = event?.target?.currentTime ? parseInt(event.target.currentTime) : 0;
                    videolightbox.elaspedTime =  currentTime < parseInt(duration - 5) ? currentTime : 0;
                };
            }
        }
      } catch (err) {}
}

function initYTapi(video, videolightbox, player){
    if(!YTAPI)  {
        var tag = document.createElement('script');
        tag.src = "//www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); 
    }
    new Promise((resolve) => {
        if(YTAPI){
            resolve();
        } else{
            window.onYouTubeIframeAPIReady = function() {
                resolve();  
                YTAPI = true;
            }   
        }
    }).then(function(){
        
        player = new YT.Player(video, {});

        player.addEventListener('onStateChange', event => {
            if (event.data === YT.PlayerState.PLAYING) {
                let duration = player?.playerInfo?.duration;
                let currentTime = 0;
                ytPlyaerInterval = window.setInterval(() => {
                    currentTime = player?.playerInfo?.currentTime ? player.playerInfo.currentTime : 0;
                    videolightbox.elaspedTime = parseInt(currentTime) < parseInt(duration - 5) ? currentTime : 0;
                }, 900, event.target)
            } else {
                window.clearInterval(ytPlyaerInterval)
            }
        })
    });
}

function lightboxCloseHanlder( type, video, videolightbox, player){
    let nextTime  = videolightbox?.elaspedTime ? videolightbox.elaspedTime : 0;
    video.setAttribute("data-start", parseInt(nextTime)); 
    switch(type){
        case 'video':
            break;
        case 'youtube':
            window.clearInterval(ytPlyaerInterval);
            video.removeAttribute("src"); 
            break;
        case 'vimeo':
            let player = new Vimeo.Player(video);
            player.destroy().then(function() {
              }).catch(err => console.log(err));
        break;
    } 
}