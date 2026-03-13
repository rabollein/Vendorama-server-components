"use strict";
function gscounteranimate(obj, initVal, lastVal, duration, postfix, prefix) {

    let startTime = null;
    let currentTime = Date.now();

    const step = (currentTime) => {
        if (!startTime) {
            startTime = currentTime;
        }
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        let postfixhtml = postfix || '';
        let prefixhtml = prefix || '';
        const formatter = new Intl.NumberFormat();
        obj.innerHTML = prefixhtml + formatter.format(Math.floor(progress * (lastVal - initVal) + initVal)) + postfixhtml;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
        else {
            window.cancelAnimationFrame(window.requestAnimationFrame(step));
            obj.classList.add("countfinished");
        }
    };
    window.requestAnimationFrame(step);
}

const gspbInviewCounters = document.getElementsByClassName('gs-counter');
let gspbinviewcounterobserve = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            let counterobj = entry.target;
            if(!counterobj.classList.contains('countfinished')){
                let start = parseInt(counterobj.dataset.start);
                let end = parseInt(counterobj.dataset.end);
                let postfix = counterobj.dataset.postfix;
                let prefix = counterobj.dataset.prefix;
                let duration = parseFloat(counterobj.dataset.duration);
                gscounteranimate(counterobj, start, end, duration, postfix, prefix);
            }

            //gspbinviewcounterobserve.disconnect();
        }
    });
}, {threshold: 0.3});

for (let itemobserve of gspbInviewCounters) {
    gspbinviewcounterobserve.observe(itemobserve);
}