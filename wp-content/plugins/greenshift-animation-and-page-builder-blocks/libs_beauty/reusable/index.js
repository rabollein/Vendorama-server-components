'use strict';

function GSEL_ajax_load(ev, id=null, currentObj=null) {
    let current = ev.currentTarget;
    if (!current) current = ev.target;
    if (currentObj) current = currentObj;
    if (typeof current.classList != 'undefined' && current.classList.contains('loaded')) return;
    let post_id = '';
    if(id){
        post_id = id;
    }else{
        post_id = current.getAttribute('class').match(/load-block-([0-9]+)/)[1];
        post_id = parseInt(post_id);
    }
    if (post_id == '') return;
    var blockforload = document.getElementsByClassName("gs-ajax-load-block-" + post_id);
    for (let i = 0; i < blockforload.length; i++) {
        let el = blockforload[i];
        el.classList.add("gspreloader");
    }

    const request = new XMLHttpRequest();
    request.open('POST', gsreusablevars.ajax_url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.responseType = 'json';
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            let responseobj = this.response.data;
            if (typeof current.classList != 'undefined'){
                current.classList.add("loaded");
            }
            for (let i = 0; i < blockforload.length; i++) {
                let el = blockforload[i];
                el.classList.remove("gspreloader");
                if (el.classList.contains('loaded')) continue;
                el.insertAdjacentHTML('beforeend', responseobj);
                el.classList.add("loaded");
                let gs_wrappers = el.getElementsByClassName('gs-gsap-wrap');
                if (gs_wrappers.length > 0) {
                    for (let i = 0; i < gs_wrappers.length; i++) {
                        let current = gs_wrappers[i];
                        GSinit(current);
                    };
                }
                let gs_wrappersdata = el.querySelectorAll('[data-gsapinit]');
                if (gs_wrappersdata.length > 0 && typeof GSinit !== 'undefined') {
                    for (let i = 0; i < gs_wrappersdata.length; i++) {
                        let current = gs_wrappersdata[i];
                        GSinit(current);
                    };
                }
                let gs_mouse_wrapper = el.getElementsByClassName('gs-prlx-mouse');
                if (gs_mouse_wrapper.length > 0 && typeof GSmousemoveinit !== 'undefined') {
                    for (let i = 0; i < gs_mouse_wrapper.length; i++) {
                        let curmouse = gs_mouse_wrapper[i];
                        GSmousemoveinit(curmouse);
                    };
                }
                let gs_wrappersflip = el.getElementsByClassName('gs-flip-wrap');
                if (gs_wrappersflip.length > 0 && typeof GSFlipinit !== 'undefined') {
                    for (let i = 0; i < gs_wrappersflip.length; i++) {
                        let current = gs_wrappersflip[i];
                        GSFlipinit(current);
                    };
                }
                let gs_wrappersseq = el.getElementsByClassName('gs-sequencer-wrap');
                if (gs_wrappersseq.length > 0 && typeof GSSeqinit !== 'undefined') {
                    for (let i = 0; i < gs_wrappersseq.length; i++) {
                        let current = gs_wrappersseq[i];
                        let images = JSON.parse(current.getAttribute('data-images'));
                        if (images.length > 0) {
                            images.forEach((item) => {
                                GSpreloadImage(item);
                            });
                            GSSeqinit(current);
                        }
                    };
                }
                let gs_reveal_wrapper = el.getElementsByClassName('gs-reveal-wrap');
                if (gs_reveal_wrapper.length > 0 && typeof GSrevealinit !== 'undefined') {
                    for (let i = 0; i < gs_reveal_wrapper.length; i++) {
                        let revealwrap = gs_reveal_wrapper[i];
                        GSrevealinit(revealwrap);
                    };
                }
                let gsfilter_wrappers = el.getElementsByClassName('gspb-flipfilters');
                if (gsfilter_wrappers.length > 0) {
                    for (let i = 0; i < gsfilter_wrappers.length; i++) {
                        let current = gsfilter_wrappers[i];

                        const allCheckbox = current.querySelector('.gspb-checkbox-filter-all'),
                            filters = gsap.utils.toArray(current.querySelectorAll('.gspb-checkbox-filter-item')),
                            items = gsap.utils.toArray(current.querySelectorAll('.gs-flipfilter'));

                        filters.forEach(btn => btn.addEventListener('click', function (ev) {
                            GSFlipFilters(items, filters, allCheckbox);
                        }
                        ));
                        allCheckbox.addEventListener('click', function (ev) {
                            filters.forEach(checkbox => checkbox.checked = allCheckbox.checked);
                            GSFlipFilters(items, filters, allCheckbox);
                        });
                    };
                }
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
                if(typeof GSPBSlidingPanelInit == 'function'){
                    GSPBSlidingPanelInit(el);
                }
                if(typeof gsInitTabs == 'function'){
                    gsInitTabs('.gspb-tabs', el);
                }
                if(typeof GSPB_Swiper_Init == 'function'){
                    GSPB_Swiper_Init(el);
                }
                if(typeof GS_Videos_Init == 'function'){
                    GS_Videos_Init(el);
                }
                if(typeof GSPB_Toggler_Init == 'function'){
                    GSPB_Toggler_Init(el);
                }
                if(typeof GSPB_quantityInput == 'function'){
                    GSPB_quantityInput(el);
                }
            }

        } else {
            // Response error
        }
    };
    request.onerror = function () {
        // Connection error
    };
    request.send('action=gspb_el_reusable_load&security=' + gsreusablevars.reusablenonce + '&post_id=' + post_id);
}

window.onload = function () {
    let gsreusablemouse = document.getElementsByClassName('gs-el-onhover');
    for (let i = 0; i < gsreusablemouse.length; i++) {
        let Node = gsreusablemouse[i];
        let width = document.documentElement.clientWidth;
        if (width > 1024) {
            Node.addEventListener('mouseenter', function (ev) {
                GSEL_ajax_load(ev);
            });
        } else {
            Node.addEventListener('click', function (ev) {
                if(Node.classList.contains('loaded') && Node.classList.contains('wp-block-navigation-item')){
                    Node.classList.toggle('megamenuloaded');
                    let post_id = Node.getAttribute('class').match(/load-block-([0-9]+)/)[1];
                    post_id = parseInt(post_id);
                    let blockforload = document.getElementsByClassName("gs-ajax-load-block-" + post_id);
                    for (let i = 0; i < blockforload.length; i++) {
                        let el = blockforload[i];
                        el.classList.toggle('megamenuloaded');
                    }
                }else{
                    GSEL_ajax_load(ev);
                }
            });
        }
    };
    let gsreusableclick = document.getElementsByClassName('gs-el-onclick');
    for (let i = 0; i < gsreusableclick.length; i++) {
        let Node = gsreusableclick[i];
        Node.addEventListener('click', function (ev) {
            GSEL_ajax_load(ev);
        });
    };
};

const gsELLoadonviewObserves = document.getElementsByClassName('gs-el-onview');

let gselobserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            let ev = entry;
            GSEL_ajax_load(ev);
            //gselobserver.disconnect();
        }
    });
});

for (let itemobserve of gsELLoadonviewObserves) {
    gselobserver.observe(itemobserve);
}