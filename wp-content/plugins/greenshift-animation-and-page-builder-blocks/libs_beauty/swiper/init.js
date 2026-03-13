"use strict";
function GSPB_render_Swiper(swiperobj, documentobj = document) {
    let slidesPerView = swiperobj.dataset.slidesperview == 'auto' ? 'auto' : parseFloat(swiperobj.dataset.slidesperview);
    let slidesPerViewMD = swiperobj.dataset.slidesperviewmd == 'auto' ? 'auto' : parseFloat(swiperobj.dataset.slidesperviewmd);
    let slidesPerViewSM = swiperobj.dataset.slidesperviewsm == 'auto' ? 'auto' : parseFloat(swiperobj.dataset.slidesperviewsm);
    let slidesPerViewXS = swiperobj.dataset.slidesperviewxs == 'auto' ? 'auto' : parseFloat(swiperobj.dataset.slidesperviewxs);
    let slidesPerGroup = parseFloat(swiperobj.dataset.slidespergroup) || 1;
    let slidesPerGroupMD = parseFloat(swiperobj.dataset.slidespergroupmd);
    let slidesPerGroupSM = parseFloat(swiperobj.dataset.slidespergroupsm);
    let slidesPerGroupXS = parseFloat(swiperobj.dataset.slidespergroupxs);
    let spaceBetween = parseInt(swiperobj.dataset.spacebetween);
    let spaceBetweenMD = parseInt(swiperobj.dataset.spacebetweenmd);
    let spaceBetweenSM = parseInt(swiperobj.dataset.spacebetweensm);
    let spaceBetweenXS = parseInt(swiperobj.dataset.spacebetweenxs);
    let speed = parseInt(swiperobj.dataset.speed);
    let loop = JSON.parse(swiperobj.dataset.loop);
    let autoheight = JSON.parse(swiperobj.dataset.autoheight);
    let grabCursor = JSON.parse(swiperobj.dataset.grabcursor);
    let freemode = JSON.parse(swiperobj.dataset.freemode);
    let keyboard = swiperobj.dataset.keyboard;
    let onlyinviewport = swiperobj.dataset.onlyinviewport;
    let mousewheel = swiperobj.dataset.mousewheel;
    let forcetoaxis = swiperobj.dataset.forcetoaxis;
    let releaseonedges = swiperobj.dataset.releaseonedges;
    let freemodesticky = swiperobj.dataset.freemodesticky;
    let vertical = JSON.parse(swiperobj.dataset.vertical);
    let centered = JSON.parse(swiperobj.dataset.centered);
    let autoplay = JSON.parse(swiperobj.dataset.autoplay);
    let autoplayRestore = swiperobj.dataset.autoplayrestore;
    let disablePause = swiperobj.dataset.disablepause;
    let stopOnLastSlide = swiperobj.dataset.stoponlastslide;
    let reverseDirection = swiperobj.dataset.reversedirection;
    let watchOverflow = swiperobj.dataset.watchoverflow;
    let loopAdditionalSlides = swiperobj.dataset.loopadditionalslides || 0;
    let clickableBullets = swiperobj.dataset.clickablebullets;
    let clicktoslide = swiperobj.dataset.clicktoslide;
    let disableA11y = swiperobj.dataset.disablea11y;
    let disablefinger = swiperobj.dataset.disablefinger;
    let disablemove = swiperobj.dataset.disablemove;
    let parallax_enable = swiperobj.dataset.parallax;
    let autodelay = parseInt(swiperobj.dataset.autodelay);
    let indexElement = swiperobj.dataset.pagecurrentindex;
    if (autodelay == 1) {
        autodelay = 0;
    }
    let effect = swiperobj.dataset.effect;
    let coverflowrotate = parseInt(swiperobj.dataset.coverflowrotate);
    let coverflowdepth = parseInt(swiperobj.dataset.coverflowdepth);
    let coverflowscale = parseFloat(swiperobj.dataset.coverflowscale);
    let coverflowstretch = parseInt(swiperobj.dataset.coverflowstretch);
    let coverflowshadow = JSON.parse(swiperobj.dataset.coverflowshadow);
    let customparams = (swiperobj.dataset.customparams) ? JSON.parse(swiperobj.dataset.customparams) : '';
    let btnright = '';
    let btnleft = '';
    let currentparentSwiper = swiperobj.closest('.gs-slider-root');
    if (!currentparentSwiper) {
        currentparentSwiper = swiperobj.closest('.gspb_row');
    }
    if (currentparentSwiper) {
        btnright = currentparentSwiper.querySelector('.gs-slider-custom-btn-right');
        btnleft = currentparentSwiper.querySelector('.gs-slider-custom-btn-left');
    }
    let syncedContainer = swiperobj.dataset.syncedcontainer;

    let swiper_desktop_breakpoint = 992;
    let swiper_tablet_breakpoint = 768;
    let swiper_mobile_breakpoint = 576;

    if (typeof gs_swiper !== 'undefined') {
        swiper_desktop_breakpoint = parseInt(gs_swiper.breakpoints.desktop) || 992;
        swiper_tablet_breakpoint = parseInt(gs_swiper.breakpoints.tablet) || 768;
        swiper_mobile_breakpoint = parseInt(gs_swiper.breakpoints.mobile) || 576;
    }
    else if (typeof gs_swiper_params !== 'undefined') {
        swiper_desktop_breakpoint = parseInt(gs_swiper_params.breakpoints.desktop) || 992;
        swiper_tablet_breakpoint = parseInt(gs_swiper_params.breakpoints.tablet) || 768;
        swiper_mobile_breakpoint = parseInt(gs_swiper_params.breakpoints.mobile) || 576;
    }

    let objswiper = {
        preloadImages: false,
        spaceBetween: spaceBetween,
        slidesPerView: slidesPerView,
        slidesPerGroup: slidesPerGroup,
        speed: speed,
        loop: loop,
        autoHeight: autoheight,
        direction: (vertical) ? "vertical" : "horizontal",
        grabCursor: grabCursor,
        freeMode: freemode ? {
            sticky: freemodesticky || false,
            enabled: true,
        } : false,
        keyboard: keyboard ? {
            onlyInViewport: onlyinviewport || false
        } : false,
        mousewheel: mousewheel ? {
            forceToAxis: forcetoaxis || false
        } : false,
        threshold: releaseonedges ? 0 : 5,
        centeredSlides: centered,
        slideToClickedSlide: clicktoslide,
        watchOverflow: watchOverflow ? true : false,
        loopAdditionalSlides: loopAdditionalSlides || 0,
        autoplay: autoplay ? {
            delay: autodelay,
            pauseOnMouseEnter: disablePause ? false : true,
            disableOnInteraction: autoplayRestore ? false : true,
            stopOnLastSlide: stopOnLastSlide ? true : false,
            reverseDirection: reverseDirection ? true : false,
        } : false,
        effect: (effect == 'coverflow' || effect == 'creative' || effect == 'cards') ? effect : null,
        coverflowEffect: (effect == 'coverflow') ? {
            rotate: coverflowrotate,
            slideShadows: coverflowshadow,
            depth: coverflowdepth,
            scale: coverflowscale ? coverflowscale : 1,
            stretch: coverflowstretch ? coverflowstretch : 0,
        } : null,
        creativeEffect: (effect == 'creative') ? {
            limitProgress: customparams.limitProgress || 1,
            prev: {
                translate: [customparams.prev.translateX, customparams.prev.translateY, customparams.prev.translateZ],
                rotate: [customparams.prev.rotateX, customparams.prev.rotateY, customparams.prev.rotateZ],
                opacity: customparams.prev.opacity,
                scale: customparams.prev.scale,
                shadow: customparams.prev.shadow,
                origin: customparams.prev.origin,
            },
            next: {
                translate: [customparams.next.translateX, customparams.next.translateY, customparams.next.translateZ],
                rotate: [customparams.next.rotateX, customparams.next.rotateY, customparams.next.rotateZ],
                opacity: customparams.next.opacity,
                scale: customparams.next.scale,
                shadow: customparams.next.shadow,
                origin: customparams.next.origin,
            },
            perspective: true
        } : null,
        breakpoints: {},
        on: {
            slideChange: function (swipercurrent) {
                if(releaseonedges && mousewheel){
                    setTimeout(function () {
                        swipercurrent.params.mousewheel.releaseOnEdges = false;
                        swipercurrent.params.touchReleaseOnEdges = false;
                    }, 500);
                }
                let swiperel = swipercurrent.el;
                let currentparent = swiperel.closest('.gs-slider-root');
                if (!currentparent) {
                    currentparent = swiperel.closest('.gspb_row');
                }
                if (currentparent) {
                    let btns = currentparent.querySelectorAll('.gs-slider-control-btn');
                    Array.prototype.forEach.call(btns, function (e) {
                        e.classList.remove('active');
                    });
                    let sliderindex = swipercurrent.activeIndex + 1;
                    let btnsactive = currentparent.querySelectorAll('.gs-slideto-' + sliderindex);
                    Array.prototype.forEach.call(btnsactive, function (btn) {
                        btn.classList.add('active');
                    });
                }
                if (indexElement) {
                    let indexElementObj = documentobj.querySelector(indexElement);
                    if (indexElementObj != null) {
                        indexElementObj.innerHTML = swipercurrent.realIndex + 1;
                    }
                }
                if (syncedContainer && syncedContainer != '.' && syncedContainer != '#') {
                    let syncedContainerElement = documentobj.querySelectorAll(syncedContainer);
                    if (syncedContainerElement.length > 0) {
                        Array.prototype.forEach.call(syncedContainerElement, function (e) {
                            let childrens = e.children;
                            if (childrens.length > 0) {
                                Array.prototype.forEach.call(childrens, function (child) {
                                    child.classList.remove('active');
                                });
                                childrens = Array.from(childrens).filter(child => child.tagName !== 'STYLE');
                                let sliderindex = swipercurrent.realIndex;
                                let activechild = childrens[sliderindex];
                                if (activechild) {
                                    activechild.classList.add('active');
                                    if (activechild.classList.contains('gs-accordion-item') && !activechild.classList.contains('gsopen') && typeof GSPB_Accordion_Toggle === 'function') {
                                        let target = activechild.querySelector('.gs-accordion-item__title');
                                        GSPB_Accordion_Toggle(target);
                                    }
                                }
                            }
                        });
                    }
                }
            },
            reachEnd: function (swiper) {
                if(releaseonedges && mousewheel){
                    setTimeout(function () {
                        swiper.params.mousewheel.releaseOnEdges = true;
                        swiper.params.touchReleaseOnEdges = true;
                    }, 1000);
                }
            }
        },
        pagination: {
            el: swiperobj.querySelector('.swiper-pagination'),
            type: 'bullets',
            clickable: clickableBullets,
        },
        a11y: {
            slideRole: 'link',
            enabled: disableA11y ? false : true,
        },

        navigation: { nextEl: btnright || swiperobj.querySelector(':scope > .swiper-button-next'), prevEl: btnleft || swiperobj.querySelector(':scope > .swiper-button-prev') },

        scrollbar: {
            el: swiperobj.querySelector('.swiper-scrollbar'),
            draggable: true,
        },
    }

    if (disablefinger) {
        objswiper.followFinger = false;
    }
    if (disablemove) {
        objswiper.allowTouchMove = false;
    }

    if (parallax_enable) {
        objswiper.parallax = true;
    }

    let swiperhash = swiperobj.querySelector('.swiper-slide[data-hash]');
    if (swiperhash) {
        objswiper.hashNavigation = {
            watchState: true,
        };
    }

    objswiper.breakpoints[236] = {
        slidesPerView: slidesPerViewXS ? slidesPerViewXS : slidesPerView,
        spaceBetween: spaceBetweenXS ? spaceBetweenXS : spaceBetween,
        slidesPerGroup: slidesPerGroupXS ? slidesPerGroupXS : slidesPerGroup
    };

    objswiper.breakpoints[swiper_mobile_breakpoint] = {
        slidesPerView: slidesPerViewSM ? slidesPerViewSM : slidesPerView,
        spaceBetween: spaceBetweenSM ? spaceBetweenSM : spaceBetween,
        slidesPerGroup: slidesPerGroupSM ? slidesPerGroupSM : slidesPerGroup
    };

    objswiper.breakpoints[swiper_tablet_breakpoint] = {
        slidesPerView: slidesPerViewMD ? slidesPerViewMD : slidesPerView,
        spaceBetween: spaceBetweenMD ? spaceBetweenMD : spaceBetween,
        slidesPerGroup: slidesPerGroupMD ? slidesPerGroupMD : slidesPerGroup
    };

    objswiper.breakpoints[swiper_desktop_breakpoint] = {
        spaceBetween,
        slidesPerView,
        slidesPerGroup
    };

    new Swiper(
        swiperobj.querySelector('.swiper:not(.swiper-initialized)'),
        objswiper
    );

}

function GSPB_Swiper_Init(documentobj = document){
    var gcswiperinits = documentobj.getElementsByClassName('gs-swiper-init');
    for (let i = 0; i < gcswiperinits.length; i++) {
        let swiperobj = gcswiperinits[i];
        GSPB_render_Swiper(swiperobj, documentobj);
    }
    for (let i = 0; i < gcswiperinits.length; i++) {
        let swiperobj = gcswiperinits[i];
        let syncedSlider = swiperobj.dataset.syncedslider;
        let syncedSliderBoth = swiperobj.dataset.syncedsliderboth;
        if (syncedSlider) {
            let objswiper = swiperobj.querySelector('.swiper').swiper;
            let sync = documentobj.querySelector(syncedSlider);
            if (sync !== null) {
                let looporiginal = JSON.parse(swiperobj.dataset.loop);
                let loopsync = JSON.parse(sync.querySelector('.gs-swiper-init').dataset.loop);
    
                let syncslide = sync.querySelector('.swiper');
                if (syncslide !== null) {
                    let syncslideobj = syncslide.swiper;
                    if (syncslideobj !== undefined) {
                        objswiper.on('slideChange', function () {
                            if (!looporiginal && loopsync) {
                                syncslideobj.slideToLoop(objswiper.activeIndex, 500, false);
                            } else if (looporiginal && !loopsync) {
                                syncslideobj.slideTo(objswiper.realIndex, 500, false);
                            } else if (looporiginal && loopsync) {
                                syncslideobj.slideToLoop(objswiper.realIndex, 500, false);
                            } else {
                                syncslideobj.slideTo(objswiper.activeIndex, 500, false);
                            }
                        });
                        //objswiper.controller.control = syncslideobj;
                        if (syncedSliderBoth) {
                            //syncslideobj.controller.control = objswiper;
                            syncslideobj.on('slideChange', function () {
                                if (!looporiginal && loopsync) {
                                    objswiper.slideTo(syncslideobj.realIndex, 500, false);
                                } else if (looporiginal && !loopsync) {
                                    objswiper.slideToLoop(syncslideobj.activeIndex, 500, false);
                                } else if (looporiginal && loopsync) {
                                    objswiper.slideToLoop(syncslideobj.realIndex, 500, false);
                                } else {
                                    objswiper.slideTo(syncslideobj.activeIndex, 500, false);
                                }
    
                            });
                        }
                    }
                }
            }
        }
        let syncedContainer = swiperobj.dataset.syncedcontainer;
        if (syncedContainer && syncedContainer != '.' && syncedContainer != '#') {
            let syncedContainerElement = documentobj.querySelectorAll(syncedContainer);
            if (syncedContainerElement.length > 0) {
                let objswiper = swiperobj.querySelector('.swiper').swiper;
                let looporiginal = JSON.parse(swiperobj.dataset.loop);
                Array.prototype.forEach.call(syncedContainerElement, function (e) {
                    let childrens = e.children;
                    if (childrens.length > 0) {
                        childrens = Array.from(childrens).filter(child => child.tagName !== 'STYLE');
                        Array.prototype.forEach.call(childrens, function (child) {
                            child.addEventListener('click', function (ev) {
                                if (e.classList.contains('gs-accordion') && ev.target.tagName != 'A') {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                }
                                let index = Array.prototype.indexOf.call(childrens, child);
                                if (!looporiginal) {
                                    objswiper.slideTo(parseInt(index));
                                } else {
                                    objswiper.slideToLoop(parseInt(index));
                                }
                            });
                        });
                    }
                });
            }
        }
    }
    
    let gspbslidercustom = documentobj.getElementsByClassName('gs-slider-control-btn');
    for (let i = 0; i < gspbslidercustom.length; i++) {
        let currentobj = gspbslidercustom[i];
        let currentparent = currentobj.closest('.gs-slider-root');
        if (!currentparent) {
            currentparent = currentobj.closest('.gspb_row');
        }
        if (currentparent) {
            let currentslider = currentparent.querySelector('.swiper');
            if (currentslider) {
                let slider = currentslider.swiper;
                let scrollindex = currentobj.getAttribute('class').match(/gs-slideto-([0-9]+)/)[1];
                currentobj.addEventListener('click', function (ev) {
                    slider.slideTo(parseInt(scrollindex) - 1);
                });
            }
        }
    }
}
GSPB_Swiper_Init();