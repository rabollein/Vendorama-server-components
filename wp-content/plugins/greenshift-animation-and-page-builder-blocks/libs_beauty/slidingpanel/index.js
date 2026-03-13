"use strict";
function GSPBtoggleBgScroll(paneltype){
    if(paneltype!='block' && paneltype != 'modal'){
        document.body.classList.toggle('scrollhidden');
    }
}
function GSPBtogglemodaldialog(panel, paneltype, type='toggle'){
    if(paneltype=='modal'){
        if((panel.open && type=='toggle') || type=='close'){
            panel.close();
        }else{
            panel.showModal();
        }
    }
    return;
}
function GSPBSlidingPanelInit(documentobj = document){
    let gsslidingpanel = documentobj.getElementsByClassName('gspb_button_wrapper');
    for (let i = 0; i < gsslidingpanel.length; i++) {
        let clickWrapNode = gsslidingpanel[i];
        let paneltype = clickWrapNode.dataset.paneltype;
        if(typeof paneltype == 'undefined') continue;
        let panelid = clickWrapNode.getAttribute('id');
        let currentNode = clickWrapNode.querySelector('.gspb_slidingPanel');
        
        let hovertrigger = currentNode.dataset.hover;
        let width = document.documentElement.clientWidth;
        let auto = currentNode.dataset.autotrigger;
        let closeintent = currentNode.dataset.closeintent;
        let closeintentonce = currentNode.dataset.closeintentonce;
        let autotime = currentNode.dataset.autotriggertime;
        let placebody = currentNode.dataset.placebody;
        let clickselector = currentNode.dataset.clickselector;
        let closeselector = currentNode.dataset.closeselector;
        let dynamicContentBefore = currentNode.dataset.dynamicbefore;
        let dynamicContentAfter = currentNode.dataset.dynamicafter;
        let panel = clickWrapNode.querySelector('[data-panelid="'+panelid+'"]');
        if(!panel) panel = documentobj.querySelector('[data-panelid="'+panelid+'"]');
    
        let closeNode = clickWrapNode.querySelector('.gspb_slidingPanel-close');
        let closeNodeCustom = clickWrapNode.querySelectorAll('.gspb-custom-close');
        if(closeselector){
            closeNodeCustom = documentobj.querySelectorAll(closeselector);
        }
    
        if(dynamicContentBefore || dynamicContentAfter){
            let contentinside = panel.querySelector('.gspb_slidingPanel-inner');
            if(dynamicContentBefore){
                let contentBeforeContent = documentobj.querySelector(dynamicContentBefore);
                if(contentBeforeContent){
                    let contentbefore = document.createElement('div');
                    contentbefore.classList.add('gspb-dynamic-content-before');
                    contentbefore.innerHTML = contentBeforeContent.innerHTML;
                    if(contentinside.firstChild){
                        contentinside.insertBefore(contentbefore, contentinside.firstChild);
                    }else{
                        contentinside.appendChild(contentbefore);
                    }
                }
            }
            if(dynamicContentAfter){
                let contentAfterContent = documentobj.querySelector(dynamicContentAfter);
                if(contentAfterContent){
                    let contentafter = document.createElement('div');
                    contentafter.classList.add('gspb-dynamic-content-after');
                    contentafter.innerHTML = contentAfterContent.innerHTML;
                    contentinside.appendChild(contentafter);
                }
            }
        }
    
        if((paneltype!='block' && paneltype != 'modal') && placebody){
            let div = document.createElement('div');
            div.classList.add(panelid);
            div.setAttribute('data-paneltype', paneltype);
            div.appendChild(panel);
            document.body.appendChild(div);
        }
        
        if(clickWrapNode){
            let clickNode = clickWrapNode.querySelector('.gspb-buttonbox');
            if(hovertrigger == 'true' && width > 1024){
                clickWrapNode.addEventListener('mouseenter', function (ev) {
                    panel.classList.add('active');
                    GSPBtogglemodaldialog(panel, paneltype, 'open');
                    if(paneltype!='block' && paneltype != 'modal'){
                        document.body.classList.add('scrollhidden');
                    }
                }, false);
                clickWrapNode.addEventListener('mouseleave', function (ev) {
                    panel.classList.remove('active');
                    GSPBtogglemodaldialog(panel, paneltype, 'close');
                    document.body.classList.remove('scrollhidden');
                }, false);
            }else{
                clickNode.addEventListener('click', function (ev) {
                    ev.preventDefault();
                    panel.classList.toggle('active');
                    GSPBtogglemodaldialog(panel, paneltype);
                    clickWrapNode.classList.toggle('panelactive');
                    GSPBtoggleBgScroll(paneltype);
                }, false);
            }
            clickNode.addEventListener('keydown', function (e) {
                const keyDown = e.key !== undefined ? e.key : e.keyCode;
                if ((keyDown === 'Enter' || keyDown === 13) ||
                    (['Spacebar', ' '].indexOf(keyDown) >= 0 || keyDown === 32)) {
                    e.preventDefault();
                    this.click();
                }
            });
            if(clickselector){
                let clickselectorNode = clickWrapNode.closest(clickselector);
                if(!clickselectorNode){
                    clickselectorNode = documentobj.querySelectorAll(clickselector);
                }else{
                    clickselectorNode = [clickselectorNode];
                }
                if(clickselectorNode.length){
                    clickselectorNode.forEach((button) => {
                        button.addEventListener('click', (ev) => {
                            ev.preventDefault();
                            panel.classList.toggle('active');
                            GSPBtogglemodaldialog(panel, paneltype);
                            clickWrapNode.classList.toggle('panelactive');
                            button.classList.toggle('panelactive');
                            GSPBtoggleBgScroll(paneltype);
                        });
                        button.addEventListener('keydown', function (e) {
                            const keyDown = e.key !== undefined ? e.key : e.keyCode;
                            if ((keyDown === 'Enter' || keyDown === 13) ||
                                (['Spacebar', ' '].indexOf(keyDown) >= 0 || keyDown === 32)) {
                                e.preventDefault();
                                this.click();
                            }
                        });
                    });
                }
            }
            if(closeNode){
                closeNode.addEventListener('click', function (ev) {
                    panel.classList.toggle('active');
                    GSPBtogglemodaldialog(panel, paneltype);
                    clickWrapNode.classList.toggle('panelactive');
                    GSPBtoggleBgScroll(paneltype);
                }, false);
                closeNode.addEventListener('keydown', function (e) {
                    const keyDown = e.key !== undefined ? e.key : e.keyCode;
                    if ((keyDown === 'Enter' || keyDown === 13) ||
                        (['Spacebar', ' '].indexOf(keyDown) >= 0 || keyDown === 32)) {
                        e.preventDefault();
                        this.click();
                    }
                });
            }
            currentNode.addEventListener('click', function (ev) {
                if(ev.target.classList.contains('gspb_slidingPanel')){
                    panel.classList.toggle('active');
                    GSPBtogglemodaldialog(panel, paneltype);
                    clickWrapNode.classList.toggle('panelactive');
                    GSPBtoggleBgScroll(paneltype);
                }
            }, false);
            if(closeNodeCustom && closeNodeCustom.length > 0){
                closeNodeCustom.forEach((closebutton) => {
                    closebutton.addEventListener('click', function (ev) {
                        panel.classList.toggle('active');
                        GSPBtogglemodaldialog(panel, paneltype);
                        clickWrapNode.classList.toggle('panelactive');
                        GSPBtoggleBgScroll(paneltype);
                    }, false);
                    closebutton.addEventListener('keydown', function (e) {
                        const keyDown = e.key !== undefined ? e.key : e.keyCode;
                        if ((keyDown === 'Enter' || keyDown === 13) ||
                            (['Spacebar', ' '].indexOf(keyDown) >= 0 || keyDown === 32)) {
                            e.preventDefault();
                            this.click();
                        }
                    });
                });
            }
            if(auto && autotime){
                setTimeout(() => {
                    panel.classList.toggle('active');
                    GSPBtogglemodaldialog(panel, paneltype);
                    clickWrapNode.classList.toggle('panelactive');
                    GSPBtoggleBgScroll(paneltype);
                }, parseFloat(autotime)*1000);
            }
            if(closeintent){
                let GSExitmouseEvent = e => {
                    let shouldShowExitIntent = 
                        !e.toElement && 
                        !e.relatedTarget &&
                        e.clientY < 10;
                    if(closeintentonce){
                        let onceonly = localStorage.getItem(closeintentonce);
                        if(onceonly && onceonly == '1'){
                            shouldShowExitIntent = false;
                        }
                    }
                    if (shouldShowExitIntent) {
                        document.removeEventListener('mouseout', GSExitmouseEvent);
                        panel.classList.toggle('active');
                        GSPBtogglemodaldialog(panel, paneltype);
                        clickWrapNode.classList.toggle('panelactive');
                        GSPBtoggleBgScroll(paneltype);
                        if(closeintentonce){
                            localStorage.setItem(closeintentonce, '1');
                        }
                    }
                };
                setTimeout(() => {
                    document.addEventListener('mouseout', GSExitmouseEvent);
                }, 2000);
            }
            if(paneltype == 'modal'){
                panel.addEventListener("click", e => {
                    const dialogDimensions = panel.getBoundingClientRect()
                    if (
                      e.clientX < dialogDimensions.left ||
                      e.clientX > dialogDimensions.right ||
                      e.clientY < dialogDimensions.top ||
                      e.clientY > dialogDimensions.bottom
                    ) {
                        panel.close();
                        panel.classList.remove('active');
                        GSPBtoggleBgScroll(paneltype);
                    }
                });
            }
        }
    }
}
GSPBSlidingPanelInit();
document.addEventListener('keydown', function(event){
	if(event.key === "Escape"){
		let panels = document.querySelectorAll('.gspb_slidingPanel');
        if(panels.length){
            panels.forEach(element => {
                let paneltype = element.parentNode.dataset.paneltype;
                element.classList.remove('active');
                GSPBtoggleBgScroll(paneltype);
            });
        }
        let btns = document.querySelectorAll('.clickWrapNode');
        if(btns.length){
            btns.forEach(element => {
                element.classList.remove('panelactive');
            });
        }
	}
});