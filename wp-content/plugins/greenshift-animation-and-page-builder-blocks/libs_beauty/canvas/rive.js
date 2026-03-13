const initRiveAnimation = (documentobj = document) => {
    const riveInit = (documentsearch = documentobj) => {
        let riveObjects = documentsearch.querySelectorAll("canvas[data-canvas-type='rive']");
        riveObjects.forEach(riveObject => {
            let src = riveObject.getAttribute("data-canvas-src");
            let stateMachine = riveObject.getAttribute("data-canvas-alt");
            let customCanvasControllers = riveObject.getAttribute("data-canvas-controllers");
            let id = riveObject.getAttribute("data-canvas-id");
            const r = new rive.Rive({
                src: src,
                canvas: riveObject,
                autoplay: true,
                stateMachines: stateMachine,
                onLoad: (_) => {
                    r.resizeDrawingSurfaceToCanvas();
                    window[id] = r;
                    riveObject.classList.add("loaded");
                    if (stateMachine) {
                        const inputs = r.stateMachineInputs(stateMachine);
                        if (inputs && inputs.length > 0) {
                            inputs.forEach((input) => {
                                let customControllers = [];
                                try {
                                    customControllers = JSON.parse(customCanvasControllers || '[]');
                                    if (customControllers && customControllers.length > 0) {
                                        customControllers.forEach((item) => {
                                            if (item.name == input.name) {
                                                input.value = item.value;
                                            }
                                        });
                                    }
                                } catch (e) {
                                    console.error('Error parsing data-canvas-controllers. It should be a valid JSON array string.', {
                                        error: e,
                                        value: customCanvasControllers
                                    });
                                }
                            });
                        }
                    }
                }
            });
        });
    }
    const loadRiveScript = () => {
        let existingScript = document.getElementById("rive-js");
        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/@rive-app/canvas/rive.js";
            script.id = "rive-js";
            document.body.appendChild(script);
            script.onload = () => {
                riveInit();
            };
        } else {
            existingScript.onload = () => {
                riveInit();
            };
        }
    };
    let riveObjects = documentobj.querySelectorAll("canvas[data-canvas-type='rive']");
    if (riveObjects && riveObjects.length > 0) {
        let lazy = false;
        riveObjects.forEach(riveObject => {
            let smartLazyLoad = riveObject.getAttribute("data-canvas-smart-lazy-load");
            if (smartLazyLoad) {
                lazy = true;
            }
        });
        if (lazy) {
            document.body.addEventListener("mouseover", loadRiveScript, { once: true });
            document.body.addEventListener("touchmove", loadRiveScript, { once: true });
            window.addEventListener("scroll", loadRiveScript, { once: true });
            document.body.addEventListener("keydown", loadRiveScript, { once: true });
        } else {
            loadRiveScript();
        }
    }
};
initRiveAnimation(); 