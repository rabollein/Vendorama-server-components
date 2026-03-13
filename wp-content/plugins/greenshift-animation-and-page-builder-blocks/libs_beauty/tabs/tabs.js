"use strict";
function gsInitTabs(elem, documentobj = document) {
    //addEventListener on mouse click

    var tabsobj = documentobj.getElementsByClassName('gspb-tabs');
    for (let i = 0; i < tabsobj.length; i++) {
        let tabsobjnode = tabsobj[i];
        if (tabsobjnode.classList.contains('tabswiper')) {
            tabsobjnode.classList.add('gsswiper-container-' + i);
            let autoplayenable = tabsobjnode.getAttribute("data-autoplay");
            let autoplaytime = parseInt(tabsobjnode.getAttribute("data-autoplaytime")) * 1000;
            let autoplayobj = (autoplayenable === 'true') ? { delay: autoplaytime, disableOnInteraction: true } : false;
            window['swiper' + i] = new Swiper('.gsswiper-container-' + i + ' .gswipertabs', {
                slidesPerView: 1,
                spaceBetween: 0,
                grabCursor: true,
                speed: 700,
                on: {
                    slideChange: function (swiper) {
                        let btns = tabsobjnode.querySelectorAll('.t-btn');
                        findActivetabElementAndRemoveIt(btns);
                        btns[swiper.activeIndex].classList.add('active');
                    }
                },
                autoplay: autoplayobj,
            });
        }
    }

    var tabsbuttons = documentobj.getElementsByClassName('t-btn');
    for (let i = 0; i < tabsbuttons.length; i++) {
        tabsbuttons[i].addEventListener('click', function (e) {
            let targetnode = e.currentTarget;
            if (!targetnode.classList.contains('active')) {
                let tabnode = targetnode.closest(elem);
                let btns = tabnode.querySelector('.t-btn-container').querySelectorAll('.t-btn');
                let panels = tabnode.querySelector('.swiper-wrapper').querySelectorAll(':scope > .t-panel');
                findActivetabElementAndRemoveIt(btns);
                findActivetabElementAndRemoveIt(panels);

                targetnode.classList.add('active');
                targetnode.setAttribute('aria-selected', 'true');
                targetnode.setAttribute('tabindex', 0);
                var nodes = Array.prototype.slice.call(targetnode.parentNode.children);
                let index = nodes.indexOf(targetnode);
                var panel = panels[index];
                if (tabnode.classList.contains('tabswiper')) {
                    tabnode.querySelector('.gswipertabs').swiper.slideTo(index, 500, false);
                } else {
                    panel.classList.add('active');
                    panel.setAttribute('tabindex', 0);
                    if (panel.getAttribute('hidden') === 'true') {
                        panel.removeAttribute('hidden');
                    }
                }

            }
        });
        tabsbuttons[i].addEventListener('keydown', function (e) {
            const keyDown = e.key !== undefined ? e.key : e.keyCode;
            if ((keyDown === 'Enter' || keyDown === 13) ||
                (['Spacebar', ' '].indexOf(keyDown) >= 0 || keyDown === 32)) {
                e.preventDefault();
                this.click();
            } else if (keyDown === 'ArrowLeft' || keyDown === 37 || keyDown === 'ArrowRight' || keyDown === 39) {
                e.preventDefault();
                const tabnode = this.closest(elem);
                const btns = tabnode.querySelector('.t-btn-container').querySelectorAll('.t-btn');
                const currentIndex = Array.from(btns).indexOf(this);
                let newIndex;

                if (keyDown === 'ArrowLeft' || keyDown === 37) {
                    newIndex = (currentIndex - 1 + btns.length) % btns.length;
                } else {
                    newIndex = (currentIndex + 1) % btns.length;
                }

                btns[newIndex].focus();
                btns[newIndex].click();
            }
        });
    }

}

//if option true remove active class from added element
function findActivetabElementAndRemoveIt(nodeList) {
    "use strict";
    Array.prototype.forEach.call(nodeList, function (e) {
        e.classList.remove('active');
        if (e.classList.contains('t-panel')) {
            if (!e.getAttribute('hidden')) {
                e.setAttribute('hidden', 'true');
            }
        }else{
            e.setAttribute('tabindex', "-1");
            if (e.getAttribute('aria-selected') === 'true') {
                e.setAttribute('aria-selected', 'false');
            }
        }
    });
}

gsInitTabs('.gspb-tabs');