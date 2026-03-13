"use strict";
const GSscrollHorizontal = (container, direction = "right", step = 500, scrollMax = 2500, containerWidth = 1200) => {
    if (document.dir == 'rtl') {
        if (direction == 'right') {
            if (container.scrollLeft >= 0) {
                container.scrollTo({
                    top: 0,
                    left: -scrollMax,
                    behavior: 'smooth'
                });
            } else {
                container.scrollTo({
                    top: 0,
                    left: container.scrollLeft + step,
                    behavior: 'smooth'
                });
            }
        } else {
            if (Math.abs(container.scrollLeft) >= scrollMax - containerWidth - 1) {
                container.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
                container.scrollTo({
                    top: 0,
                    left: container.scrollLeft - step,
                    behavior: 'smooth'
                });
            }
        }
    } else {
        if (direction == 'right') {
            if (container.scrollLeft >= scrollMax - containerWidth - 1) {
                container.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
                container.scrollTo({
                    top: 0,
                    left: container.scrollLeft + step,
                    behavior: 'smooth'
                });
            }
        } else {
            if (container.scrollLeft <= 0) {
                container.scrollTo({
                    top: 0,
                    left: scrollMax,
                    behavior: 'smooth'
                });
            } else {
                container.scrollTo({
                    top: 0,
                    left: container.scrollLeft - step,
                    behavior: 'smooth'
                });
            }
        }
    }
}

var gsscrollcarousel = document.getElementsByClassName('gspb_smartscroll_btns');
for (let i = 0; i < gsscrollcarousel.length; i++) {
    let carouselBtns = gsscrollcarousel[i];
    let carouselEl = '';
    if (carouselBtns.previousSibling && carouselBtns.previousSibling.classList && carouselBtns.previousSibling.classList.contains('gspb_scrollcarousel')) {
        carouselEl = carouselBtns.previousSibling;
    } else {
        let controllerValue = carouselBtns.getAttribute('class').match(/gs-control-(.*)/);
        if (controllerValue != null && controllerValue.length) {
            let val = controllerValue[1].split(' ');
            carouselEl = document.querySelector('.'+val[0]);
        }else{
            carouselEl = carouselBtns.closest('.gspb_scrollcarousel');
        }
        
    }

    let customwrap = carouselBtns.getAttribute("data-carouselWrapper");
    let scrollContainer = (customwrap) ? carouselEl.querySelector('.' + customwrap) : carouselEl;
    let groupCells = JSON.parse(carouselBtns.getAttribute("data-groupCells"));
    let autoPlayValue = '';
    let autoPlay = JSON.parse(carouselBtns.getAttribute("data-autoPlay"));
    let autoPlaySpeed = parseInt(carouselBtns.getAttribute("data-autoPlaySpeed"));

    if (autoPlay && autoPlay != 'false') {
        if (autoPlaySpeed) {
            autoPlayValue = autoPlaySpeed;
        } else {
            autoPlayValue = 4500;
        }
    }

    let disableButtons = JSON.parse(carouselBtns.getAttribute("data-disableButtons"));

    if (scrollContainer) {
        let scrollMax = scrollContainer.scrollWidth;
        let item = scrollContainer.firstChild;
        if(item.tagName && item.tagName.toLowerCase() === 'style') {
            item = item.nextElementSibling;
        }
        let containerWidth = carouselEl.offsetWidth;
        let step = groupCells ? containerWidth : item.offsetWidth;

        if (!disableButtons) {
            carouselBtns.querySelector('.next').onclick = function () {
                GSscrollHorizontal(scrollContainer, 'right', step, scrollMax, containerWidth);
            };
            carouselBtns.querySelector('.previous').onclick = function () {
                GSscrollHorizontal(scrollContainer, 'left', step, scrollMax, containerWidth);
            };
        }

        if (autoPlayValue) {
            let timerId = setInterval(() => GSscrollHorizontal(scrollContainer, 'right', step, scrollMax, containerWidth), autoPlayValue);

            scrollContainer.addEventListener("mouseenter", function (event) {
                clearInterval(timerId);
            }, false);
            scrollContainer.addEventListener("mouseleave", function (event) {
                timerId = setInterval(() => GSscrollHorizontal(scrollContainer, 'right', step, scrollMax, containerWidth), autoPlayValue);
            }, false);
        }

        let customwrapper = scrollContainer.closest('.gs-scrollbtn-wrapper');
        if (customwrapper) {
            let prevBtn = customwrapper.querySelector('.gs-previous-btn');
            let nextBtn = customwrapper.querySelector('.gs-next-btn');
            if (prevBtn) {
                prevBtn.onclick = function () {
                    GSscrollHorizontal(scrollContainer, 'left', step, scrollMax, containerWidth);
                };
            }
            if(nextBtn){
                nextBtn.onclick = function () {
                    GSscrollHorizontal(scrollContainer, 'right', step, scrollMax, containerWidth);
                };
            }
        }

    } else {
        carouselBtns.remove();
    }
}