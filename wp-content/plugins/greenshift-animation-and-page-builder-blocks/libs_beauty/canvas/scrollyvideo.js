const initScrollyVideoAnimation = (documentobj = document) => {
    const scrollyVideoInit = (documentsearch = documentobj) => {
        let scrollyVideoObjects = documentsearch.querySelectorAll("[data-canvas-type='scrollyvideo']");
        scrollyVideoObjects.forEach(scrollyVideoObject => {
            let src = scrollyVideoObject.getAttribute("data-canvas-src");
            let projectId = scrollyVideoObject.getAttribute("data-canvas-project-id");
            let extraFilters = scrollyVideoObject.getAttribute("data-canvas-extra-filters");
            
            // Parse extra filters if they exist
            let filters = {};
            if (extraFilters) {
                try {
                    filters = JSON.parse(extraFilters);
                } catch (e) {
                    console.warn('Invalid extra filters JSON:', extraFilters);
                }
            }
            
            // Clean up existing video/canvas elements
            if (scrollyVideoObject.querySelector('video') !== null) {
                scrollyVideoObject.querySelector('video').remove();
            }
            if (scrollyVideoObject.querySelector('canvas') !== null) {
                scrollyVideoObject.querySelector('canvas').remove();
            }
            scrollyVideoObject.style = '';
            
            // Create new ScrollyVideo instance with configuration
            const scrollyVideo = new ScrollyVideo({
                scrollyVideoContainer: scrollyVideoObject,
                src: src,
                cover: filters?.cover || false,
                useWebCodecs: filters?.useWebCodecs || false,
                transitionSpeed: parseFloat(filters?.transitionSpeed) || 8,
                frameThreshold: parseFloat(filters?.frameThreshold) || 0.1,
                sticky: filters?.sticky || false,
                full: filters?.full || false,
                trackScroll: filters?.trackScroll || true,
                lockScroll: filters?.lockScroll || true,
            });
            
            scrollyVideoObject.classList.add("loaded");
            // Store reference for potential cleanup
            scrollyVideoObject._scrollyVideoInstance = scrollyVideo;
        });
    }
    
    const loadScrollyVideoScript = () => {
        let existingScript = document.getElementById("scrollyvideo-js");
        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/scrolly-video@latest/dist/scrolly-video.js";
            script.id = "scrollyvideo-js";
            document.body.appendChild(script);
            script.onload = () => {
                scrollyVideoInit();
            };
        } else {
            existingScript.onload = () => {
                scrollyVideoInit();
            };
        }
    };
    
    let scrollyVideoObjects = documentobj.querySelectorAll("[data-canvas-type='scrollyvideo']");
    if (scrollyVideoObjects && scrollyVideoObjects.length > 0) {
        let lazy = false;
        scrollyVideoObjects.forEach(scrollyVideoObject => {
            let smartLazyLoad = scrollyVideoObject.getAttribute("data-canvas-smart-lazy-load");
            if (smartLazyLoad) {
                lazy = true;
            }
        });
        if (lazy) {
            document.body.addEventListener("mouseover", loadScrollyVideoScript, { once: true });
            document.body.addEventListener("touchmove", loadScrollyVideoScript, { once: true });
            window.addEventListener("scroll", loadScrollyVideoScript, { once: true });
            document.body.addEventListener("keydown", loadScrollyVideoScript, { once: true });
        } else {
            loadScrollyVideoScript();
        }
    }
};
initScrollyVideoAnimation(); 