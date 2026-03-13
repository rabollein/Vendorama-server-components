"use strict";

function GSPB_Toggler_Init(documentobj = document){
    let contenttoggler = documentobj.getElementsByClassName('gs-tgl-trigger');
    for (let i = 0; i < contenttoggler.length; i++) {
        let togglerobj= contenttoggler[i];
        togglerobj.addEventListener('click', function (ev) {
            const scrollY = window.scrollY || window.pageYOffset;
            togglerobj.parentNode.classList.toggle('gs-toggler-open');
            window.scrollTo(0, scrollY);
        });
        let togglebtns = togglerobj.querySelectorAll('[role="button"]');
        togglebtns.forEach(function (btn) {
            btn.addEventListener('keydown', function (e) {
                const keyDown = e.key !== undefined ? e.key : e.keyCode;
                if ((keyDown === 'Enter' || keyDown === 13) ||
                    (['Spacebar', ' '].indexOf(keyDown) >= 0 || keyDown === 32)) {
                    e.preventDefault();
                    togglerobj.parentNode.classList.toggle('gs-toggler-open');
        
                    let sibling = this.nextElementSibling !== null ? this.nextElementSibling : this.previousElementSibling;
                    sibling.focus();
                }
            });
        });
    }
}
GSPB_Toggler_Init();