const initUnicornAnimation = (documentobj = document) => {
    const unicornInit = (documentsearch = documentobj) => {
        let unicornObjects = documentsearch.querySelectorAll("[data-canvas-type='unicorn']");
        unicornObjects.forEach(unicornObject => {
            let src = unicornObject.getAttribute("data-canvas-src");
            let projectId = unicornObject.getAttribute("data-canvas-project-id");
            let args = {
                elementId: unicornObject.id,
            };
            if(src){
                args.filePath = src;
            }
            else if(projectId){
                args.projectId = projectId;
            }
            UnicornStudio.addScene(args).then(scene => {
                unicornObject.classList.add("loaded");
            });
        });
    }
    const loadUnicornScript = () => {
        let existingScript = document.getElementById("unicorn-js");
        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@latest/dist/unicornStudio.umd.js";
            script.id = "unicorn-js";
            document.body.appendChild(script);
            script.onload = () => {
                unicornInit();
            };
        } else {
            existingScript.onload = () => {
                unicornInit();
            };
        }
    };
    let unicornObjects = documentobj.querySelectorAll("[data-canvas-type='unicorn']");
    if (unicornObjects && unicornObjects.length > 0) {
        let lazy = false;
        unicornObjects.forEach(unicornObject => {
            let smartLazyLoad = unicornObject.getAttribute("data-canvas-smart-lazy-load");
            if (smartLazyLoad) {
                lazy = true;
            }
        });
        if (lazy) {
            document.body.addEventListener("mouseover", loadUnicornScript, { once: true });
            document.body.addEventListener("touchmove", loadUnicornScript, { once: true });
            window.addEventListener("scroll", loadUnicornScript, { once: true });
            document.body.addEventListener("keydown", loadUnicornScript, { once: true });
        } else {
            loadUnicornScript();
        }
    }
};
initUnicornAnimation(); 