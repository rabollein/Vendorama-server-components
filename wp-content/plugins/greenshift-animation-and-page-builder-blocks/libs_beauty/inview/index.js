"use strict";
const gspbInviewObserves = document.getElementsByClassName('gspb-inview');
const gspbInviewMotionObserves = document.getElementsByClassName('gs-motion-inview');
const gspbInviewMotionChildObserves = document.querySelectorAll('.gs-motion-inview-child > *');

// Throttle function
function GSgreenThrottle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// New implementation for clip-path compatibility
function GSgreenIsElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0 &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right >= 0
    );
  }

function GSgreenHandleScroll() {
    const allElements = [...gspbInviewObserves, ...gspbInviewMotionObserves, ...gspbInviewMotionChildObserves];
    
    allElements.forEach(el => {
      if (GSgreenIsElementInViewport(el) && !el.classList.contains("gspb-inview-active")) {
        setTimeout(() => {
          el.classList.add("gspb-inview-active");
        }, 10);
      }
    });
}

// Throttled scroll handler
const GSgreenThrottledHandleScroll = GSgreenThrottle(GSgreenHandleScroll, 100);

// Initial check
GSgreenHandleScroll();

// Add scroll event listener with throttling
window.addEventListener('scroll', GSgreenThrottledHandleScroll);
window.addEventListener('resize', GSgreenThrottledHandleScroll);