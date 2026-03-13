"use strict";

// Base selectors
let baseClipSelectors = '[data-aos="clip-down"], [data-aos="clip-up"], [data-aos="clip-left"], [data-aos="clip-right"], [data-aos="display-in"], [data-aos="display-in-slide"], [data-aos="display-in-zoom"], [data-aos="custom"], [data-aos="slide-left"], [data-aos="slide-right"], [data-aos="slide-top"], [data-aos="slide-bottom"]';

// Add additional classes from global clipClasses variable if it exists
if (typeof clipClasses !== 'undefined' && clipClasses.length > 0) {
    const additionalSelectors = clipClasses.map(className => `.${className}`).join(', ');
    baseClipSelectors += ', ' + additionalSelectors;
}

const gspbaosElementsGSClip = document.querySelectorAll(baseClipSelectors);


function isElementInViewportGSClip(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return (rect.top <= windowHeight && rect.bottom >= 0);
}

function throttleGSClip(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function handleScrollGSClip() {
    gspbaosElementsGSClip.forEach((item) => {
        const once = item.getAttribute('data-aos-once');
        
        if (isElementInViewportGSClip(item)) {
            setTimeout(() => {
                item.classList.add('aos-animate');
            }, 10);
        } else {
            if (!once && item.classList.contains('aos-animate') && !item.classList.contains('aos-init')) {
                item.classList.remove('aos-animate');
            }
        }
    });
}

const throttledHandleScrollGSClip = throttleGSClip(handleScrollGSClip, 100);

handleScrollGSClip();

// Add throttled scroll event listener
window.addEventListener('scroll', throttledHandleScrollGSClip);

// Optional: Add throttled resize event listener
window.addEventListener('resize', throttledHandleScrollGSClip);