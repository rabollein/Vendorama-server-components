"use strict";

// Base selectors - exclude the clip and custom animations
let baseAnimationSelectors = '[data-aos]:not([data-aos="clip-down"]):not([data-aos="clip-up"]):not([data-aos="clip-left"]):not([data-aos="clip-right"]):not([data-aos="display-in"]):not([data-aos="display-in-slide"]):not([data-aos="display-in-zoom"]):not([data-aos="custom"]):not([data-aos="slide-left"]):not([data-aos="slide-right"]):not([data-aos="slide-top"]):not([data-aos="slide-bottom"])';

// Add additional exclusions from global animationClasses variable if it exists
if (typeof animationClasses !== 'undefined' && animationClasses.length > 0) {
    const additionalExclusions = animationClasses.map(className => `.${className}`).join(',');
    baseAnimationSelectors += ', '+additionalExclusions;
}

const gspbaosElements = document.querySelectorAll(baseAnimationSelectors);

let gspbaosobserve = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        let item = entry.target;
        let once = item.getAttribute('data-aos-once');
        if (entry.isIntersecting) {
            setTimeout(() => {
                item.classList.add('aos-animate');
            }, 10);
            if (once) gspbaosobserve.unobserve(item);
        } else {
            if (!once && item.classList.contains('aos-animate') && !item.classList.contains('aos-init')) {
                item.classList.remove('aos-animate');
            }
        }
    });
}, { threshold: 0, rootMargin: '0px 0px -5% 0px' });

gspbaosElements.forEach((item) => {
    gspbaosobserve.observe(item);
});