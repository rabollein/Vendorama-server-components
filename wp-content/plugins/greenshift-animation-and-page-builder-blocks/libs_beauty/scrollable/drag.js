var greenshiftcarousel = document.getElementsByClassName('gspb_smartscroll');
for (let i = 0; i < greenshiftcarousel.length; i++) {
    let carouselEl = greenshiftcarousel[i];

    let customwrap = carouselEl.getAttribute("data-carouselWrapper");
    if(!customwrap){
        let btns = carouselEl.querySelector('.gspb_smartscroll_btns');
        if(btns){
            customwrap = btns.getAttribute("data-carouselWrapper");
        }
    }
    let dragEnable = carouselEl.getAttribute("data-dragenable");
    if(dragEnable){
        let scrollContainer = (customwrap) ? carouselEl.querySelector('.' + customwrap) : carouselEl;
    
        // Slider dragging
        let isDown = false;
        let startX;
        let scrollLeft;
    
        scrollContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            scrollContainer.classList.add('activedrag');
            startX = e.pageX - scrollContainer.offsetLeft;
            scrollLeft = scrollContainer.scrollLeft;
            cancelMomentumTracking();
        });
    
        scrollContainer.addEventListener('mouseleave', () => {
            isDown = false;
            scrollContainer.classList.remove('activedrag');
        });
    
        scrollContainer.addEventListener('mouseup', () => {
            isDown = false;
            scrollContainer.classList.remove('activedrag');
            beginMomentumTracking();
        });
    
        scrollContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            e.stopPropagation();
            const x = e.pageX - scrollContainer.offsetLeft;
            const walk = (x - startX); //scroll-fast
            var prevScrollLeft = scrollContainer.scrollLeft;
            scrollContainer.scrollLeft = scrollLeft - walk;
            velX = scrollContainer.scrollLeft - prevScrollLeft;
        });
    
        // Momentum 
        var velX = 0;
        var momentumID;
    
        scrollContainer.addEventListener('wheel', (e) => {
            cancelMomentumTracking();
        });
    
        function beginMomentumTracking() {
            cancelMomentumTracking();
            momentumID = requestAnimationFrame(momentumLoop);
        }
    
        function cancelMomentumTracking() {
            cancelAnimationFrame(momentumID);
        }
    
        function momentumLoop() {
            scrollContainer.scrollLeft += velX * 0.5;
            velX *= 0.98;
            if (Math.abs(velX) > 0.1) {
                momentumID = requestAnimationFrame(momentumLoop);
            }
        }
    
        scrollContainer.addEventListener("wheel", (evt) => {
            evt.preventDefault();
    
            window.requestAnimationFrame(() => {
                scrollContainer.scrollTo({ top: 0, left: scrollContainer.scrollLeft + evt.deltaY + evt.deltaX });
            });
        });
    }
}