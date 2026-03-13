// Menu Actions Implementation
// Based on the gspbactions JSON data from the button

class MenuActions {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {

        const panelButtons = document.querySelectorAll('.gs-nav-trigger-panel');
        if (panelButtons && panelButtons.length > 0) {
            panelButtons.forEach(panelButton => {
                let panelID = panelButton.getAttribute('data-panel-id');
                let copyID = panelButton.getAttribute('data-copy-id');
                let copyTopID = panelButton.getAttribute('data-copy-top-id');
                let copyBottomID = panelButton.getAttribute('data-copy-bottom-id');
                let panelElement = document.querySelector(panelID);
                if (panelElement) {
                    if (copyID) {
                        let copyElement = document.querySelector(copyID);
                        if (copyElement) {
                            let copyArea = panelElement.querySelector('.gs-menu-copy-area');
                            if (copyArea) {
                                let clone = copyElement.cloneNode(true);
                                clone.className = '';

                                // Get the tag name of the clone element
                                const cloneTagName = clone.tagName.toLowerCase();

                                // Change the copyArea to have the same tag as clone
                                const newElement = document.createElement(cloneTagName);

                                // Preserve all attributes from the original copyArea
                                Array.from(copyArea.attributes).forEach(attr => {
                                    newElement.setAttribute(attr.name, attr.value);
                                });

                                newElement.innerHTML = '';

                                // Remove the top tag of clone to keep only children
                                while (clone.firstChild) {
                                    newElement.appendChild(clone.firstChild);
                                }

                                // Replace the copyArea with the new element
                                copyArea.parentNode.replaceChild(newElement, copyArea);
                            }
                        }
                    }
                    let backElement = panelElement.querySelector('.gs-nav-back-trigger-copy');
                    if (backElement) {
                        let dropDowns = panelElement.querySelectorAll('.gs-dropdown-menu');
                        if (dropDowns && dropDowns.length > 0) {
                            dropDowns.forEach(dropDown => {
                                dropDown.classList.add('gs-nav-sub-level');
                                dropDown.classList.remove('gs-dropdown-menu');
                            });
                        }
                        let dropDownsNew = panelElement.querySelectorAll('.gs-nav-sub-level');
                        if (dropDownsNew && dropDownsNew.length > 0) {
                            dropDownsNew.forEach(dropDown => {
                                let backClone = backElement.cloneNode(true);
                                dropDown.prepend(backClone);
                            });
                        }
                        backElement.remove();
                    }
                    if (copyTopID) {
                        let copyTopElement = document.querySelector(copyTopID);
                        if (copyTopElement) {
                            let copyTopClone = copyTopElement.cloneNode(true);
                            let copyTopArea = panelElement.querySelector('.gs-nav-top-copy');
                            if (copyTopArea) {
                                copyTopArea.appendChild(copyTopClone);
                            }
                        }
                    }
                    if (copyBottomID) {
                        let copyBottomElement = document.querySelector(copyBottomID);
                        if (copyBottomElement) {
                            let copyBottomClone = copyBottomElement.cloneNode(true);
                            let copyBottomArea = panelElement.querySelector('.gs-nav-bottom-copy');
                            if (copyBottomArea) {
                                copyBottomArea.appendChild(copyBottomClone);
                            }
                        }
                    }

                    // Action 1: Panel trigger
                    panelButton.addEventListener('click', (e) => {
                        if (panelElement && typeof openGreendynamicpanel === 'function') {
                            e.preventDefault();
                            openGreendynamicpanel(panelElement, e.currentTarget, panelID);
                        }
                    });

                    // Action 2: Navigation trigger (slide left)
                    const navTriggers = panelElement.querySelectorAll('.gs-nav-trigger');
                    if (navTriggers && navTriggers.length > 0) {
                        navTriggers.forEach(trigger => {
                            trigger.addEventListener('click', (e) => {
                                const topLevel = panelElement.querySelector('.gs-nav-top-level');
                                if (!topLevel) return;

                                // Get height from next sibling and set min-height
                                let nextElement = e.currentTarget.nextElementSibling;
                                if (nextElement.classList && !nextElement.classList.contains('gs-nav-sub-level')) {
                                    nextElement = e.currentTarget.nextElementSibling.nextElementSibling;
                                }
                                if (nextElement && nextElement.tagName !== 'STYLE' && nextElement.classList && nextElement.classList.contains('gs-nav-sub-level')) {
                                    const height = nextElement.offsetHeight;
                                    topLevel.style.setProperty('min-height', height + 'px');
                                    nextElement.style.setProperty('visibility', 'visible');
                                    nextElement.classList.add('activelevel');
                                }

                                // Get current slide value or default to 0
                                let currentSlide = parseInt(topLevel.getAttribute('data-slide')) || 0;

                                // Subtract 100 from current slide value
                                const newSlideValue = currentSlide - 100;

                                // Set the new slide value as attribute
                                topLevel.setAttribute('data-slide', newSlideValue.toString());

                                // Apply translateX transform with percentage unit
                                const translateValue = newSlideValue + '%';
                                this.setTransformAttribute(topLevel, 'translateX', translateValue);
                            });
                        });
                    }

                    // Action 3: Back trigger (slide right)
                    const backTriggers = panelElement.querySelectorAll('.gs-nav-back-trigger');
                    if (backTriggers && backTriggers.length > 0) {
                        backTriggers.forEach(trigger => {
                            trigger.addEventListener('click', (e) => {
                                const topLevel = panelElement.querySelector('.gs-nav-top-level');
                                if (!topLevel) return;

                                // Get current slide value or default to 0
                                let currentSlide = parseInt(topLevel.getAttribute('data-slide')) || 0;

                                // Add 100 to current slide value
                                const newSlideValue = currentSlide + 100;

                                // Set the new slide value as attribute
                                topLevel.setAttribute('data-slide', newSlideValue.toString());

                                // Apply translateX transform with percentage unit
                                const translateValue = newSlideValue + '%';
                                this.setTransformAttribute(topLevel, 'translateX', translateValue);

                                // Get height from grandparent and set min-height
                                const grandparent = e.target.closest('.gs-nav-top-level');
                                if (grandparent) {
                                    const height = grandparent.offsetHeight;
                                    topLevel.style.setProperty('min-height', height + 'px');
                                }

                                setTimeout(() => {
                                    const parent = e.target.closest('.gs-nav-sub-level');
                                    if (parent) {
                                        parent.style.setProperty('visibility', 'hidden');
                                        parent.classList.remove('activelevel');
                                    }
                                }, 1300);

                            });
                        });
                    }

                }
            });
        }

        const menuItemsWithChildren = document.querySelectorAll('.gs-menu-item-has-children');
        if (menuItemsWithChildren) {
            menuItemsWithChildren.forEach(item => {
                const link = item.querySelector('a');
                if (link) {
                    link.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            item.classList.toggle('active');
                        }
                    });
                }
            });
        }
    }


    // Helper function to set transform attributes
    setTransformAttribute(element, attribute, value) {
        // Get the current transform style
        let currentTransform = element.style.transform || '';

        // Create a regular expression to match the specific transform property
        const regex = new RegExp(`${attribute}\\([^)]*\\)`, 'g');

        if (currentTransform.match(regex)) {
            // If the transform property exists, replace it
            currentTransform = currentTransform.replace(regex, `${attribute}(${value})`);
        } else {
            // If it doesn't exist, append it
            currentTransform = `${currentTransform} ${attribute}(${value})`.trim();
        }

        // Set the updated transform style
        element.style.transform = currentTransform;
    }

}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MenuActions();
});
