"use strict";
let gscookbtns = document.getElementsByClassName('gspb-buttonbox');
for (let i = 0; i < gscookbtns.length; i++) {
    let currentNode = gscookbtns[i];
    let cookname = currentNode.dataset.cookname;
    let cookdays = currentNode.dataset.cookdays || 30;
    let cookclass = currentNode.dataset.cookclass;
    let cookclassdelete = currentNode.dataset.cookclassdelete;
    let cooktoggle = currentNode.dataset.cooktoggle;
    let cookvalue = currentNode.dataset.cookvalue || 1;
    if(cookname){
        let currentcook = GSCookService.getCookie(cookname);
        if(currentcook && cookclass){
            document.body.classList.add(cookclass);
            currentNode.classList.add('cookactive');
        }
        currentNode.addEventListener('click', function (ev) {
            ev.preventDefault();
            if(cooktoggle){
                if(cookclass){
                    currentNode.classList.toggle('cookactive');
                    document.body.classList.toggle(cookclass);
                }
                if(cookclassdelete){
                    let currentclasses = cookclassdelete.split(',');
                    currentclasses.forEach(element => {
                        document.body.classList.toggle(element);
                    });
                }
                if(currentcook){
                    GSCookService.removeCookie(cookname);
                }else{
                    GSCookService.setCookie(cookname, cookvalue, cookdays);
                }
            }else{
                GSCookService.setCookie(cookname, cookvalue, cookdays);
                if(cookclass){
                    document.body.classList.add(cookclass);
                    currentNode.classList.add('cookactive');
                }
                if(cookclassdelete){
                    let currentclasses = cookclassdelete.split(',');
                    currentclasses.forEach(element => {
                        document.body.classList.remove(element);
                    });
                }
            }
        }, false);
    }

}