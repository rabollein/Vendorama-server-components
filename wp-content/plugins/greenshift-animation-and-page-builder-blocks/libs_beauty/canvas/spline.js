const initSplineAnimation = (documentobj = document) => {
    const splineInit = async (documentsearch = documentobj) => {
        let splineObjects = documentsearch.querySelectorAll("canvas[data-canvas-type='spline']");
        const { Application } = await import("https://unpkg.com/@splinetool/runtime@latest/build/runtime.js");
        splineObjects.forEach(splineObject => {
            let src = splineObject.getAttribute("data-canvas-src");
            let id = splineObject.getAttribute("data-canvas-id");
            let customCanvasControllers = splineObject.getAttribute("data-canvas-controllers");
            const app = new Application(splineObject);
            app.load(src).then(() => {
                window[id] = app;
                splineObject.classList.add("loaded");
                if(customCanvasControllers && customCanvasControllers.length > 0){
                    let customControllers = [];
                    try {
                        customControllers = JSON.parse(customCanvasControllers || '[]');
                        if (customControllers && customControllers.length > 0) {
                            customControllers.forEach((item) => {
                                app.setVariable(item.name, item.value);
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing data-canvas-controllers. It should be a valid JSON array string.', {
                            error: e,
                            value: customCanvasControllers
                        });
                    }
                }
            });
        });
    }
    const loadSplineScript = async () => {
        let existingScript = document.getElementById("spline-js");
        if (!existingScript) {
            await splineInit();
        } else {
            await splineInit();
        }
    };
    let splineObjects = documentobj.querySelectorAll("canvas[data-canvas-type='spline']");
    if (splineObjects && splineObjects.length > 0) {
        let lazy = false;
        splineObjects.forEach(splineObject => {
            let smartLazyLoad = splineObject.getAttribute("data-canvas-smart-lazy-load");
            if (smartLazyLoad) {
                lazy = true;
            }
        });
        if (lazy) {
            document.body.addEventListener("mouseover", loadSplineScript, { once: true });
            document.body.addEventListener("touchmove", loadSplineScript, { once: true });
            window.addEventListener("scroll", loadSplineScript, { once: true });
            document.body.addEventListener("keydown", loadSplineScript, { once: true });
        } else {
            loadSplineScript();
        }
    }
};
initSplineAnimation(); 