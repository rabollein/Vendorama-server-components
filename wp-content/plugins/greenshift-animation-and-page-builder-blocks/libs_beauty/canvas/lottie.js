const initLottieAnimation = (documentobj = document) => {
    const lottieInit = async (documentsearch = documentobj) => {
        let lottieObjects = documentsearch.querySelectorAll("canvas[data-canvas-type='lottie']");
        const { DotLottie } = await import("https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm");
        lottieObjects.forEach(lottieObject => {
            let src = lottieObject.getAttribute("data-canvas-src");
            let id = lottieObject.getAttribute("data-canvas-id");
            const animation = new DotLottie({
                canvas: lottieObject,
                src: src,
                autoplay: true,
                loop: true,
            });
            window[id] = animation;
        });
    }
    const loadLottieScript = async () => {
        let existingScript = document.getElementById("lottie-js");
        if (!existingScript) {
            await lottieInit();
        } else {
            await lottieInit();
        }
    };
    let lottieObjects = documentobj.querySelectorAll("canvas[data-canvas-type='lottie']");
    if (lottieObjects && lottieObjects.length > 0) {
        let lazy = false;
        lottieObjects.forEach(lottieObject => {
            let smartLazyLoad = lottieObject.getAttribute("data-canvas-smart-lazy-load");
            if (smartLazyLoad) {
                lazy = true;
            }
        });
        if (lazy) {
            document.body.addEventListener("mouseover", loadLottieScript, { once: true });
            document.body.addEventListener("touchmove", loadLottieScript, { once: true });
            window.addEventListener("scroll", loadLottieScript, { once: true });
            document.body.addEventListener("keydown", loadLottieScript, { once: true });
        } else {
            loadLottieScript();
        }
    }
};
initLottieAnimation(); 