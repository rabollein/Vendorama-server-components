class GSDynamicPanel {
    constructor(options = {}) {
        this.options = {
            ...options
        };
        this.injectStyles();
        this.createDynamicPanelElement();
        this.dynamicpanel = document.getElementById('gs-dynamicpanel');
        this.content = this.dynamicpanel.querySelector('.gs-dynamicpanel-content');
        this.panelcontent = [];
        this.dynamicpanel.addEventListener('click', (e) => {
            if (e.target === this.dynamicpanel || e.target.classList.contains('gs-close-backdrop')) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .gs-dynamicpanel {
                position: fixed;
                z-index: 999999;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            .gs-dynamicpanel.active {
                pointer-events: auto;
            }
            .gs-dynamicpanel-close {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: var(--wp--custom--lightbox--close-button--background-color, rgba(0, 0, 0, 0.5));
                border: none;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                color: var(--wp--custom--close-button--color, #ffffff);
                transition: var(--gs-root-transition, all .3s ease-in-out);
                transform: scale(0);
                opacity: 0;
            }
            .gs-dynamicpanel.active .gs-dynamicpanel-close {
                transform: scale(1);
                opacity: 1;
            }
            .gs-dynamicpanel.active .gs-dynamicpanel-close:hover {
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    createDynamicPanelElement() {
        const dynamicpanelHTML = `
            <div id="gs-dynamicpanel" class="gs-dynamicpanel" role="dialog" aria-modal="true" aria-label="Dynamic panel">
                <div class="gs-dynamicpanel-content" tabindex="-1"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', dynamicpanelHTML);
    }

    open(src, trigger, id) {
        this.triggerElement = trigger;
        if (this.triggerElement.classList.contains('triggeractive')) {
            this.close();
            return;
        }
        this.content.innerHTML = '';
        if (src instanceof HTMLElement) {
            try {
                src.classList.add('gs-panel-initial'); // Add initial state class
                this.content.appendChild(src);
                
                // Use setTimeout to add the active class after a small delay
                setTimeout(() => {
                    src.classList.add('active');
                    src.classList.remove('gs-panel-initial');
                    document.body.style.overflow = 'hidden';
                }, 10);

                if(id){
                    if(this.panelcontent.find(item => item.id === id)){
                        this.panelcontent.find(item => item.id === id).src = src;
                    }else{
                        this.panelcontent.push({id:id, src:src});
                    }
                }

            } catch (error) {
                console.error('Failed to use element:', error);
            }
        } else if(id && this.panelcontent.find(item => item.id === id)){
            let copy = this.panelcontent.find(item => item.id === id).src;

            try {
                copy.classList.add('gs-panel-initial'); // Add initial state class
                this.content.appendChild(copy);
                
                // Use setTimeout to add the active class after a small delay
                setTimeout(() => {
                    copy.classList.add('active');
                    copy.classList.remove('gs-panel-initial');
                    document.body.style.overflow = 'hidden';
                }, 10);

            } catch (error) {
                console.error('Failed to use element:', error);
            }
        }

        setTimeout(() => {
            this.dynamicpanel.classList.add('active');
        }, 10);
        if (this.triggerElement) {
            this.triggerElement.classList.add('triggeractive');
        }
        if (this.content.querySelector('.gs-panel-close')) {
            let closeBtns = this.content.querySelectorAll('.gs-panel-close');
            closeBtns.forEach(btn => {
                btn.addEventListener('click', () => this.close());
            });
            let closeBtn = this.dynamicpanel.querySelector('.gs-dynamicpanel-close');
            if(closeBtn){
                closeBtn.remove();
            }
        } else if (this.dynamicpanel.querySelector('.gs-dynamicpanel-close')) {
            //do nothing
        } else {
            this.closeBtn = document.createElement('button');
            this.closeBtn.classList.add('gs-dynamicpanel-close');
            this.closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            this.dynamicpanel.appendChild(this.closeBtn);
            this.closeBtn.addEventListener('click', () => this.close());
        }
        this.content.focus();
    }

    close() {
        this.dynamicpanel.classList.remove('active');
        this.content.classList.remove('active');
        if(this.content.querySelector('.active')){
            this.content.querySelector('.active').classList.remove('active');
        }
        document.body.style.overflow = 'auto';
        if (this.triggerElement) {
            this.triggerElement.classList.remove('triggeractive');
            this.triggerElement.focus();
        }
    }

}

// Initialize the gs-dynamicpanel with default options (using href)
let greenDynamicPanel;
document.addEventListener('DOMContentLoaded', () => {
    greenDynamicPanel = new GSDynamicPanel();
});

// Function to open dynamicpanel from external triggers
function openGreendynamicpanel(src, trigger, id) {
    if (greenDynamicPanel) {
        greenDynamicPanel.open(src, trigger, id);
    }
}