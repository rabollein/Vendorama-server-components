"use strict";
var loadedspline = false;

const onGSSplineInteraction = () => {
    if (loadedspline === true) {
        return;
    }
    loadedspline = true;

    const SplineScript = document.createElement("script");
    SplineScript.src = "https://unpkg.com/@splinetool/viewer/build/spline-viewer.js";
    SplineScript.type = "module";
    document.body.appendChild(SplineScript);

    SplineScript.onload = () => {
        let gspbspline = document.getElementsByClassName('gs-splineloader');
        if(gspbspline.length > 0){
            Array.from(gspbspline).forEach((currentNode) => {
                currentNode.classList.add('gs-splineloaded');
                setTimeout(() => {
                    currentNode.querySelector('spline-viewer').shadowRoot.querySelector("#logo").style.display = 'none';
                }, 1000);
            });
        }
    }
};

document.body.addEventListener("mouseover", onGSSplineInteraction, { once: true });
document.body.addEventListener("touchmove", onGSSplineInteraction, { once: true });
window.addEventListener("scroll", onGSSplineInteraction, { once: true });
document.body.addEventListener("keydown", onGSSplineInteraction, { once: true });
var requestIdleCallback = window.requestIdleCallback || function (cb) {
    const start = Date.now();
    return setTimeout(function () {
        cb({
            didTimeout: false,
            timeRemaining: function () {
                return Math.max(0, 50 - (Date.now() - start));
            },
        });
    }, 1);
};

let gspbspline = document.getElementsByClassName('gs-splineloader');
for (let i = 0; i < gspbspline.length; i++) {
    let currentNode = gspbspline[i];
    (() => {
        if (!currentNode.classList.contains('gs-loadnow')) {
        } else {
            requestIdleCallback(function () {
                onGSSplineInteraction();
            }, {
                timeout: 300
            });
        }

    })();
}