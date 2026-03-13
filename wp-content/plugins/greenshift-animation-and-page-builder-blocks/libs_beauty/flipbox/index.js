"use strict";
let gsflipboxpanel = document.getElementsByClassName('gs-flipbox3d');
for (let i = 0; i < gsflipboxpanel.length; i++) {
    let currentNode = gsflipboxpanel[i];
    currentNode.addEventListener('mouseenter', function (ev) {
        currentNode.classList.add('gs-flipbox3d-active');
    }, false);
    currentNode.addEventListener('mouseleave', function (ev) {
        currentNode.classList.remove('gs-flipbox3d-active');
    }, false);
}