let GSscrollCalcDistance = 0;
let GSonScrollIEvents = [];
let GSonMouseMoveIEvents = [];

function GSfindChildrenWithoutStyle(parentNode) {
    let children = parentNode.children;
    var result = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        // Ignore if node is a <style> element
        if (child.tagName.toLowerCase() === 'style') {
            continue;
        }

        // Add child to result
        result.push(child);
    }

    return result;
}

function GSloopCall(fn, interval, times, signal) {
    let count = 0;
    
    // Immediately invoke the function if the signal is not aborted
    if (!signal.aborted) {
        fn();
        count++;
    }
    
    // If the desired call count has been reached immediately, no need to set up interval
    if (count >= times) {
        return;
    }
    
    const intervalId = setInterval(() => {
        // Check if the signal is aborted
        if (signal.aborted) {
            clearInterval(intervalId);
            console.log("Loop aborted");
            return;
        }
        
        fn(); // Call the function
        count++;
        
        if (count >= times) {
            clearInterval(intervalId); // Stop when the limit is reached
        }
    }, interval);
}

let GSCookClass = {

    setCookie(name, value, sec) {
        let expires = '';

        if (sec) {
            const date = new Date();
            date.setTime(date.getTime() + (sec * 1000));
            expires = '; expires=' + date.toUTCString();
        }

        document.cookie = name + '=' + (encodeURIComponent(value) || '') + expires + '; path=/';
    },

    getCookie(name) {
        const cookies = document.cookie.split(';');

        for (const cookie of cookies) {
            if (cookie.indexOf(name + '=') > -1) {
                return decodeURIComponent(cookie.split('=')[1]);
            }
        }

        return null;
    },

    removeCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    }
}

function GSPBgetTransformValue(transformString, valueName) {
    const matrix = new DOMMatrix(transformString);

    const values = {
        scale: () => Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
        rotate: () => Math.atan2(matrix.b, matrix.a) * (180 / Math.PI),
        scaleX: () => matrix.a,
        scaleY: () => matrix.d,
        rotateX: () => {
            const match = transformString.match(/rotateX\(([^)]+)\)/);
            return match ? parseFloat(match[1]) : 0;
        },
        rotateY: () => {
            const match = transformString.match(/rotateY\(([^)]+)\)/);
            return match ? parseFloat(match[1]) : 0;
        },
        translateX: () => matrix.e,
        translateY: () => matrix.f,
        translateZ: () => matrix.m34
    };

    if (values.hasOwnProperty(valueName)) {
        return values[valueName]();
    } else {
        return null;
    }
}

function GSPBsetTransformAttribute(element, attribute, value) {
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

if (document.body && document.body.classList.contains('gspb-bodyfront')) {
    const layersElements = document.querySelectorAll("[data-gspbactions]");
    GSPB_Trigger_Actions('front', layersElements);
}

function GSPB_Trigger_Actions(place = 'front', layersElements, windowobj = window, documentobj = document, signal = null, dataLayers = null) {
    if (layersElements) {
        if (signal == null) {
            const abortcontroller = new AbortController();
            signal = abortcontroller.signal;
        }
        layersElements.forEach((element) => {
            if (element == null) return;
            let dataSetActions = dataLayers ? dataLayers : element.getAttribute("data-gspbactions");
            if (dataSetActions == null) {
                let newElement = element.querySelector('[data-gspbactions]');
                if (newElement == null) return;
                dataSetActions = newElement.getAttribute("data-gspbactions");
            }
            const layersArr = JSON.parse(dataSetActions);
            if (!layersArr || !layersArr.length) return;
            layersArr.forEach((layerData, layerIndex) => {

                const triggerData = layerData?.triggerData;
                const triggerType = triggerData?.trigger;
                let env = layerData?.env;
                if (env === 'no-action' && !documentobj.body.classList.contains('gspb-bodyfront')) {
                    return;
                }
                if (triggerType === 'motion-scroll' && typeof GSPB_Motion_Scroll_Trigger != 'undefined') {
                    GSPB_Motion_Scroll_Trigger(place, layersElements, windowobj, documentobj, signal, dataLayers);
                };
                let observerargs = {
                    root: null,
                    rootMargin: (triggerData.rootmargin && (triggerData.rootmargin.includes('px') || triggerData.rootmargin.includes('%'))) ? triggerData.rootmargin : '0px 0px 0px 0px',
                    threshold: (triggerData.threshold && triggerData.threshold >= 0 && triggerData.threshold <= 1) ? triggerData.threshold : 0.3
                }

                let triggerSelector = triggerData?.selector;
                let triggerElements = [];
                if (triggerSelector) {
                    let searchIn = documentobj;
                    if (triggerSelector.includes('{CURRENT}')) {
                        searchIn = element;
                        triggerSelector = triggerSelector.replace('{CURRENT}', '');
                    }
                    triggerSelector = triggerSelector.trim();
                    if (triggerSelector == '.' || triggerSelector == '#') return;
                    if (triggerSelector.includes('{CLOSEST')) {
                        let matchesClosest = triggerSelector.match(/\{CLOSEST:(.*?)\}/)?.[1];
                        let matchesSelector = triggerSelector.match(/\{SELECTOR_ALL:(.*?)\}/)?.[1];
                        if (matchesClosest && matchesSelector) {
                            triggerElements = Array.from(element.closest(matchesClosest).querySelectorAll(matchesSelector));
                        } else if (matchesClosest) {
                            triggerElements = [element.closest(matchesClosest)];
                        }
                    } else {
                        triggerElements = Array.from(searchIn.querySelectorAll(triggerSelector));
                    }
                } else {
                    triggerElements = [element];
                }

                if (!triggerElements.length) {
                    return;
                }

                triggerElements.forEach(triggerElement => {
                    switch (triggerType) {
                        case 'on-load':
                            gspb_trigger_inter_Actions(element, triggerElement, layerData, null, windowobj, documentobj);
                            break;
                        case "on-slider-change":
                            let sliderFind = triggerElement.querySelector('.swiper');
                            if (sliderFind) {
                                let sliderObj = sliderFind.swiper;
                                sliderObj.on('slideChange', function () {
                                    gspb_trigger_inter_Actions(element, triggerElement, layerData, null, windowobj, documentobj);
                                });
                            }
                        case "click":
                            triggerElement.addEventListener("click", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { capture: true, signal: signal });
                            break;
                        case "keydown":
                            triggerElement.addEventListener("keydown", (event) => {
                                let keyCode = triggerData?.keycode;
                                if (keyCode && keyCode.length > 0) {
                                    if (event.key === keyCode) {
                                        gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                                    }
                                }
                            }, { signal: signal });
                            break;
                        case 'mouse-enter':
                            triggerElement.addEventListener("mouseenter", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;
                        case 'mouse-leave':
                            triggerElement.addEventListener("mouseleave", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;

                        case 'exit-intent':
                            documentobj.addEventListener("mouseout", (event) => {
                                if (event.toElement == null && event.relatedTarget == null && event.clientY < 10) {
                                    gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                                }
                            }, { signal: signal });
                            break;
                        case 'touch-start':
                            triggerElement.addEventListener("touchstart", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;
                        case 'touch-end':
                            triggerElement.addEventListener("touchend", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;

                        case 'on-change':
                            triggerElement.addEventListener("change", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;

                        case 'on-input':
                            triggerElement.addEventListener("input", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;

                        case "focus":
                            triggerElement.addEventListener("focus", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;

                        case "blur":
                            triggerElement.addEventListener("blur", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;

                        case "scroll-above":
                        case "scroll-below":
                            if (place === 'front') {
                                GSonScrollIEvents.push(
                                    {
                                        type: triggerType,
                                        pixelScrollValue: triggerData.pixel_scroll,
                                        element: element,
                                        triggerElement: triggerElement,
                                        layerData: layerData,
                                        windowobj: windowobj,
                                        documentobj: documentobj
                                    }
                                );
                            } else {
                                let pixelScrollAbove = triggerData.pixel_scroll;
                                let triggerObj = documentobj.querySelector('.interface-interface-skeleton__content') ? document.querySelector(".interface-interface-skeleton__content") : windowobj;
                                triggerObj.addEventListener("scroll", (event) => {
                                    let scrollY = triggerObj.scrollY;
                                    if ((triggerType === 'scroll-above' && scrollY < pixelScrollAbove) || (triggerType === 'scroll-below' && scrollY >= pixelScrollAbove)) {
                                        gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                                    }
                                }, { capture: true, signal: signal });
                            }
                            break;
                        case "mouse-move":
                            if (place === 'front') {
                                GSonMouseMoveIEvents.push(
                                    {
                                        element: element,
                                        triggerElement: triggerElement,
                                        layerData: layerData,
                                        windowobj: windowobj,
                                        documentobj: documentobj
                                    }
                                );
                            } else {
                                windowobj.addEventListener("mousemove", (event) => {
                                    gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                                }, { signal: signal });
                            }
                            break;
                        case "mouse-move-object":
                            triggerElement.addEventListener("mousemove", (event) => {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, { signal: signal });
                            break;
                        case "on-view":
                            let gspb_inview_inter_observe = new IntersectionObserver(entries => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                        gspb_trigger_inter_Actions(element, triggerElement, layerData, entry, windowobj, documentobj);
                                    }
                                });
                            }, observerargs);
                            gspb_inview_inter_observe.observe(triggerElement);
                            break;
                        case "on-leave":
                            let gspb_leaveview_inter_observe = new IntersectionObserver(entries => {
                                entries.forEach(entry => {
                                    if (!entry.isIntersecting) {
                                        gspb_trigger_inter_Actions(element, triggerElement, layerData, entry, windowobj, documentobj);
                                    }
                                });
                            }, observerargs);
                            gspb_leaveview_inter_observe.observe(triggerElement);
                            break;
                        case "loop":
                            GSloopCall(function () {
                                gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj, documentobj);
                            }, triggerData.interval, triggerData.loop_times, signal);
                            break;
                        default:
                            break;
                    }
                });
            });
        });
    }
}

if (GSonScrollIEvents.length > 0) {
    let windowobj = GSonScrollIEvents[0].windowobj || window;
    windowobj.addEventListener("scroll", (event) => {
        let scrollY = windowobj.scrollY;
        GSonScrollIEvents.forEach((scrollItem) => {
            if ((scrollItem.type === 'scroll-above' && scrollY < scrollItem.pixelScrollValue) || (scrollItem.type === 'scroll-below' && scrollY >= scrollItem.pixelScrollValue)) {
                gspb_trigger_inter_Actions(scrollItem.element, scrollItem.triggerElement, scrollItem.layerData, event, scrollItem.windowobj, scrollItem.documentobj);
            }
        });
    });
}

if (GSonMouseMoveIEvents.length > 0) {
    let windowobj = GSonMouseMoveIEvents[0].windowobj || window;
    windowobj.addEventListener("mousemove", (event) => {
        GSonMouseMoveIEvents.forEach((moveItem) => {
            gspb_trigger_inter_Actions(moveItem.element, moveItem.triggerElement, moveItem.layerData, event, moveItem.windowobj, moveItem.documentobj);
        });
    });
}

function GSPBDynamicMathPlaceholders(element, event, windowobj, documentobj, value, selector) {
    if (selector) {
        element = selector;
    } else if (element && element.length > 0) {
        element = element[0];
    }
    if (typeof value != 'string') return value;
    if (value.indexOf('{{SCROLLVIEW}}') > -1) {
        const rect = element.getBoundingClientRect();
        if (rect.top < windowobj.innerHeight && rect.bottom >= 0) {
            const normalizedscroll = ((windowobj.innerHeight - rect.top) / (windowobj.innerHeight + rect.height)) * 100;
            value = value.replace('{{SCROLLVIEW}}', normalizedscroll);
        } else if (rect.bottom < 0) {
            value = value.replace('{{SCROLLVIEW}}', 100);
        } else {
            value = value.replace('{{SCROLLVIEW}}', 0);
        }
    }
    if (value.indexOf('{{CLIENT_X}}') > -1) {
        let clientX = event.clientX;
        value = value.replace('{{CLIENT_X}}', clientX);
    }
    if (value.indexOf('{{VALUE}}') > -1) {
        let inputVal = element?.value;
        if (inputVal) {
            value = value.replace('{{VALUE}}', inputVal);
        }
    }
    if (value.indexOf('{{ATTR:') > -1) {
        let matches = value.match(/\{{ATTR:(.*?)\}\}/)?.[1];
        if (matches) {
            let attrValue = element.getAttribute(matches);
            value = value.replace('{{ATTR:' + matches + '}}', attrValue);
        }
    }
    if (value.indexOf('{{RANDOM:') > -1) {
        let matches = value.match(/\{{RANDOM:(.*?)\}\}/)?.[1];
        if (matches) {
            let splitMatches = matches.split('-');
            let minStr = splitMatches[0].trim();
            let maxStr = splitMatches[1].trim();
            let min = parseFloat(minStr);
            let max = parseFloat(maxStr);
            let randomValue;
    
            // Check if either min or max contains a decimal point.
            if (minStr.includes('.') || maxStr.includes('.')) {
                // Determine the maximum number of decimal places in the input.
                let minDecimals = minStr.split('.')[1] ? minStr.split('.')[1].length : 0;
                let maxDecimals = maxStr.split('.')[1] ? maxStr.split('.')[1].length : 0;
                let decimals = Math.max(minDecimals, maxDecimals);
                // Generate a random float rounded to the determined decimals.
                randomValue = parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
            } else {
                // Generate a random integer (inclusive).
                randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
            }
            value = value.replace(`{{RANDOM:${matches}}}`, randomValue);
        }
    }
    if (value.indexOf('{{STORAGE:') > -1) {
        let matches = value.match(/\{{STORAGE:(.*?)\}\}/)?.[1];
        if (matches) {
            let storageValue = localStorage.getItem(matches);
            value = value.replace('{{STORAGE:' + matches + '}}', storageValue);
        }
    }
    if (value.indexOf('{{COOKIE:') > -1) {
        let matches = value.match(/\{{COOKIE:(.*?)\}\}/)?.[1];
        if (matches) {
            let cookieValue = GSCookClass.getCookie(matches);
            value = value.replace('{{COOKIE:' + matches + '}}', cookieValue);
        }
    }
    if (value.indexOf('{{INDEX}}') > -1) {
        let index = Array.from(GSfindChildrenWithoutStyle(element.parentNode)).indexOf(element);
        value = value.replace('{{INDEX}}', index);
    }
    if (value.indexOf('{{CHILD_COUNT}}') > -1) {
        let count = Array.from(GSfindChildrenWithoutStyle(element)).length;
        value = value.replace('{{CHILD_COUNT}}', count);
    }
    if (value.indexOf('{{STYLE:') > -1) {
        let matches = value.match(/\{{STYLE:(.*?)\}\}/)?.[1];
        if (matches) {
            let computedStyle = window.getComputedStyle(element);
            if (['translateX', 'translateY', 'rotateX', 'rotateY', 'scaleX', 'scaleY', 'translateZ', 'scale', 'rotate'].includes(matches)) {
                const transformValue = computedStyle.getPropertyValue('transform');
                cssValue = GSPBgetTransformValue(transformValue, matches);
            } else {
                cssValue = computedStyle.getPropertyValue(matches);
            }
            value = value.replace('{{STYLE:' + matches + '}}', cssValue);
        }
    }
    if (value.indexOf('{{CLIENT_Y}}') > -1) {
        let clientY = event.clientY;
        value = value.replace('{{CLIENT_Y}}', clientY);
    }
    if (value.indexOf('{{CONTENT}}') > -1) {
        let content = element.innerHTML;
        value = value.replace('{{CONTENT}}', content);
    }
    if (value.indexOf('{{OFFSET_X}}') > -1) {
        let offsetX = event.offsetX;
        value = value.replace('{{OFFSET_X}}', offsetX);
    }
    if (value.indexOf('{{OFFSET_Y}}') > -1) {
        let offsetY = event.offsetY;
        value = value.replace('{{OFFSET_Y}}', offsetY);
    }
    if (value.indexOf('{{CLIENT_X_%}}') > -1) {
        let clientX = event.clientX;
        let percentValue = (clientX / windowobj.innerWidth) * 100;
        let clampedValue = Math.min(Math.max(percentValue, 0), 100);
        value = value.replace('{{CLIENT_X_%}}', clampedValue);
    }
    if (value.indexOf('{{CLIENT_Y_%}}') > -1) {
        let clientY = event.clientY;
        let percentValue = (clientY / windowobj.innerHeight) * 100;
        let clampedValue = Math.min(Math.max(percentValue, 0), 100);
        value = value.replace('{{CLIENT_Y_%}}', clampedValue);
    }
    if (value.indexOf('{{WIDTH}}') > -1) {
        value = value.replace('{{WIDTH}}', element.offsetWidth);
    }
    if (value.indexOf('{{HEIGHT}}') > -1) {
        value = value.replace('{{HEIGHT}}', element.offsetHeight);
    }
    if (value.indexOf('{{OFFSET_LEFT}}') > -1) {
        value = value.replace('{{OFFSET_LEFT}}', element.offsetLeft);
    }
    if (value.indexOf('{{OFFSET_TOP}}') > -1) {
        value = value.replace('{{OFFSET_TOP}}', element.offsetTop);
    }
    if (value.indexOf('{{POSITION_TOP}}') > -1) {
        let top = element.getBoundingClientRect().top;
        if (top > windowobj.innerHeight) {
            top = windowobj.innerHeight;
        }
        value = value.replace('{{POSITION_TOP}}', top);
    }
    if (value.indexOf('{{POSITION_LEFT}}') > -1) {
        value = value.replace('{{POSITION_LEFT}}', element.getBoundingClientRect().left);
    }
    return value;
}

function GSPBGetCustomSelector(selector, triggerElement, documentobj) {
    if (selector == '{TRIGGERELEMENT}') {
        selector = triggerElement;
    } else if (selector == '{TRIGGERNEXT}') {
        selector = triggerElement.nextElementSibling;
        if(selector && selector.tagName === 'STYLE'){
            selector = selector.nextElementSibling;
        }
    } else if (selector == '{TRIGGERPREVIOUS}') {
        selector = triggerElement.previousElementSibling;
        if(selector && selector.tagName === 'STYLE'){
            selector = selector.nextElementSibling;
        }
    } else if (selector == '{TRIGGERPARENT}') {
        selector = triggerElement.parentNode;
    } else if (selector == '{TRIGGERGRANDPARENT}') {
        selector = triggerElement.parentNode.parentNode;
    } else if (selector == '{TRIGGERCHILD}') {
        selector = triggerElement.children[0];
    } else {
        selector = documentobj.querySelector(selector.trim());
    }
    return selector;
}

function GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, unit, value, selector, math) {
    if (selector && selector != '.' && selector != '#') {
        selector = GSPBGetCustomSelector(selector, triggerElement, documentobj);
    }
    value = GSPBDynamicMathPlaceholders(element, event, windowobj, documentobj, value, selector);
    let finalValue = value;
    if (finalValue && math && math.length > 0) {
        math.forEach((mathItem, mathIndex) => {
            let mathValue = mathItem?.value;
            let mathSelector = mathItem?.selector;
            let mathType = mathItem?.type;
            if (mathType && mathValue) {
                if (mathSelector) {
                    mathSelector = mathSelector.trim();
                    if (mathSelector != '.' && mathSelector != '#') {
                        element = documentobj.querySelector(mathSelector);
                    };
                }
                let currentVal = GSPBDynamicMathPlaceholders(element, event, windowobj, documentobj, mathValue, mathSelector);
                currentVal = parseFloat(currentVal);
                finalValue = parseFloat(finalValue);
                if (mathType === 'add') {
                    finalValue = finalValue + currentVal;
                } else if (mathType === 'subtract') {
                    finalValue = finalValue - currentVal;
                } else if (mathType === 'multiply') {
                    finalValue = finalValue * currentVal;
                } else if (mathType === 'divide') {
                    finalValue = finalValue / currentVal;
                } else if (mathType === 'modulo') {
                    finalValue = finalValue % currentVal;
                }
            }
        });

    }
    if (unit) {
        finalValue = finalValue + unit;
    }
    return finalValue;
}
window.GSPBMathAttributeOperator = GSPBMathAttributeOperator;

function gspb_trigger_inter_Actions(element, triggerElement, layerData, event, windowobj = window, documentobj = document) {
    if (!layerData) return;
    let layersActions = layerData?.actions;
    let triggerDelay = layerData?.triggerData?.delay;
    let triggerDelayTime = layerData?.triggerData?.delaytime || 0;
    let triggerActions = layerData?.triggerData;

    if (typeof layersActions === 'undefined') return;
    if (triggerDelay && triggerDelayTime > 0) {
        setTimeout(() => {
            gspb_execute_inter_Actions(element, triggerElement, layersActions, event, windowobj, documentobj, triggerActions);
        }, triggerDelayTime);
    } else {
        gspb_execute_inter_Actions(element, triggerElement, layersActions, event, windowobj, documentobj, triggerActions);
    }
}

function gspb_execute_inter_Actions(element, triggerElement, layersActions, event, windowobj = window, documentobj = document, triggerActions = {}) {
    if (typeof layersActions === 'undefined') return;
    for (const actionItem of layersActions) {
        const actionName = actionItem?.actionname;
        let actionSelector = actionItem?.selector;
        const conditions = actionItem?.conditions;

        let checkCondition = '';

        let targetEleClass = actionItem?.classname;
        let targetEleAttribute = actionItem?.attr;
        let targetEleAttributeValue = actionItem?.attrValue;
        const targetEleAttributeSelector = actionItem?.attrValueSelector;
        const targetEleAttributecustomMath = actionItem?.customMath;
        let targetEleAttributeUnit = actionItem?.attrUnit;

        let targetElements = [];
        if (actionSelector) {
            let searchIn = documentobj;
            if (actionSelector.includes('{CURRENT}')) {
                searchIn = element;
                actionSelector = actionSelector.replace('{CURRENT}', '');
            }
            if (actionSelector.includes('{POST_ID}')) {
                let grid_id = element.closest('.gspbgrid_item');
                let post_id = '';
                if (grid_id) {
                    let gridclass = grid_id.getAttribute('class');
                    let classes = gridclass.split(' ');
                    for (let i = 0; i < classes.length; i++) {
                        if (classes[i].startsWith('post-')) {
                            post_id = classes[i].replace('post-', '');
                            break;
                        }
                    }
                } else {
                    let bodyclass = documentobj.body.getAttribute('class');
                    let classes = bodyclass.split(' ');
                    for (let i = 0; i < classes.length; i++) {
                        if (classes[i].startsWith('post-')) {
                            post_id = classes[i].replace('post-', '');
                            break;
                        }
                    }
                }
                actionSelector = actionSelector.replace('{POST_ID}', post_id);
            }
            actionSelector = actionSelector.trim();
            if (actionSelector == '.' || actionSelector == '#') return;
            if (element.classList && element.classList.contains('gspb-buttonbox')) {
                if (!element.classList.contains('wp-block-greenshift-blocks-buttonbox')) {
                    triggerElement = element.closest('.wp-block-greenshift-blocks-buttonbox');
                } else {
                    triggerElement = element.closest('.gspb_button_wrapper');
                }
            }
            if (actionSelector.includes('{CLOSEST')) {
                let matchesClosest = actionSelector.match(/\{CLOSEST:(.*?)\}/)?.[1];
                let matchesSelector = actionSelector.match(/\{SELECTOR_ALL:(.*?)\}/)?.[1];
                if (matchesClosest && matchesSelector) {
                    matchesSelector = matchesSelector.replace('{TRIGGERINDEX}', Array.from(GSfindChildrenWithoutStyle(triggerElement.parentNode)).indexOf(triggerElement));
                    targetElements = Array.from(element.closest(matchesClosest).querySelectorAll(matchesSelector));
                } else if (matchesClosest) {
                    targetElements = [element.closest(matchesClosest)];
                }
            } else if (actionSelector == '{CHILDREN}') {
                targetElements = element.children;
            } else if (actionSelector == '{TRIGGERNEXT}') {
                let nextElement = triggerElement.nextElementSibling;
                if(nextElement && nextElement.tagName === 'STYLE'){
                    nextElement = nextElement.nextElementSibling;
                }
                targetElements = [nextElement];
            } else if (actionSelector == '{TRIGGERPREVIOUS}') {
                let previousElement = triggerElement.previousElementSibling;
                if(previousElement && previousElement.tagName === 'STYLE'){
                    previousElement = previousElement.nextElementSibling;
                }
                targetElements = [previousElement];
            } else if (actionSelector == '{TRIGGERPARENT}') {
                targetElements = [triggerElement.parentNode];
            } else if (actionSelector == '{TRIGGERGRANDPARENT}') {
                targetElements = [triggerElement.parentNode.parentNode];
            } else if (actionSelector == '{TRIGGERCHILD}') {
                targetElements = [triggerElement.children[0]];
            } else if (actionSelector == '{TRIGGERELEMENT}') {
                targetElements = [triggerElement];
            } else {
                actionSelector = actionSelector.replace('{TRIGGERINDEX}', (Array.from(GSfindChildrenWithoutStyle(triggerElement.parentNode)).indexOf(triggerElement) + 1));
                targetElements = Array.from(searchIn.querySelectorAll(actionSelector));
            }
        } else {
            targetElements = [triggerElement];
        }

        if (!targetElements.length) {
            if ((actionName == 'panel' || actionName == 'popup') && typeof greenDynamicPanel != 'undefined' && greenDynamicPanel.panelcontent.find(item => item.id === actionSelector)) {
                targetElements = [greenDynamicPanel.panelcontent.find(item => item.id === actionSelector).src];
            } else {
                return;
            }
        }

        if ((actionName === 'animation') && typeof GSPB_Motion_Action === 'function') {
            let conditionCheck = true;
            targetElements.forEach((targetEle) => {
                if (conditions && conditions.length > 0) {
                    checkCondition = gspb_check_inter_Conditions(targetEle, conditions, event, triggerElement, documentobj);
                    if (checkCondition === false) {
                        conditionCheck = false;
                    }
                }
            });
            if (conditionCheck) {
                GSPB_Motion_Action(targetElements, element, actionItem, triggerActions, event, windowobj, documentobj);
            }
        }

        targetElements.forEach((targetEle) => {
            if (conditions && conditions.length > 0) {
                checkCondition = gspb_check_inter_Conditions(targetEle, conditions, event, triggerElement, documentobj);
                if (checkCondition === false) {
                    return;
                }
            }
            if (actionName === 'attach-class') {
                targetEle.classList.add(targetEleClass);
            }
            else if (actionName === 'slideto') {
                let sliderobj = targetEle.querySelector('.swiper');
                if (sliderobj) {
                    let slideIndex = actionItem?.slideindex.replace('{TRIGGERINDEX}', (Array.from(GSfindChildrenWithoutStyle(triggerElement.parentNode)).indexOf(triggerElement)));
                    if (slideIndex) {
                        sliderobj.swiper.slideTo(slideIndex);
                    }
                }
            }
            else if (actionName === 'slidepause') {
                let sliderobj = targetEle.querySelector('.swiper');
                if (sliderobj) {
                    sliderobj.swiper.pause();
                }
            }
            else if (actionName === 'slideresume') {
                let sliderobj = targetEle.querySelector('.swiper');
                if (sliderobj) {
                    sliderobj.swiper.resume();
                }
            }
            else if (actionName === 'sethtml') {
                targetEle.innerHTML = GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath);
            }

            else if (actionName === 'copyelement') {
                let targetcopy = actionItem?.targetcopy;
                if (targetcopy) {
                    let copy = documentobj.querySelector(targetcopy);
                    if (copy) {
                        let copied = copy.cloneNode(true);
                        if(actionItem?.placetype == 'prepend'){
                            targetEle.prepend(copied);
                        }else if(actionItem?.placetype == 'replace'){
                            targetEle.innerHTML = '';
                            targetEle.appendChild(copied);
                        }else{
                            targetEle.appendChild(copied);
                        }
                    }
                }
            }

            else if (actionName === 'createelement') {
                let elementType = actionItem?.elementtype;
                if (elementType) {
                    let newElement = documentobj.createElement(elementType);
                    if(actionItem?.placetype == 'prepend'){
                        targetEle.prepend(newElement);
                    }else if(actionItem?.placetype == 'replace'){
                        targetEle.innerHTML = '';
                        targetEle.appendChild(newElement);
                    }else{
                        targetEle.appendChild(newElement);
                    }
                }
            }
            else if (actionName === 'video') {
                let videoType = actionItem?.videotype;
                let videoObj = '';
                if (targetEle instanceof HTMLVideoElement) {
                    videoObj = targetEle;
                } else if (targetEle instanceof HTMLAudioElement) {
                    videoObj = targetEle;
                } else {
                    videoObj = targetEle.querySelector('video');
                    if (!videoObj) {
                        videoObj = targetEle.querySelector('audio');
                    }
                }
                if (videoObj) {
                    if (videoType === 'play') {
                        videoObj.play();
                    } else if (videoType === 'pause') {
                        videoObj.pause();
                    } else if (videoType === 'restart') {
                        videoObj.currentTime = 0;
                    } else {
                        videoObj.play();
                    }
                }
            }

            else if (actionName === 'reusable') {
                let reusableID = actionItem?.reusableid;
                if (reusableID && typeof GSEL_ajax_load === 'function') {
                    GSEL_ajax_load(event, reusableID, targetEle);
                }
            }

            else if (actionName === 'rive') {
                let riveInput = actionItem?.riveinput;
                let riveInputAction = actionItem?.riveinputaction;
                if (typeof window[riveInput] != 'undefined') {
                    if (riveInputAction === 'fire') {
                        window[riveInput].fire();
                    } else {
                        let riveInputValue = actionItem?.riveinputvalue;
                        if (riveInputValue) {
                            window[riveInput].value = GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath);
                        }
                    }
                }
            }

            else if (actionName === 'repeaterapi') {
                let api_id = actionItem?.api_id;
                if (api_id && typeof GSPB_Connector_API_Run === 'function') {
                    let item = documentobj.querySelector('[data-api-id="' + api_id + '"]');
                    let runIndex = item.getAttribute('data-api-run-index');
                    if(!runIndex){
                        runIndex = -1;
                    }else{
                        runIndex = parseInt(runIndex);
                    }
                    if (item) {
                        let formdataobj = {};
                        GSPB_Connector_API_Run(item, api_id, formdataobj, runIndex);
                    }
                }
            } 

            else if(actionName == 'customapi'){
                let api_filters = actionItem?.api_filters;
                if(api_filters){
                    GSrunAPICall(api_filters);
                }
            }

            else if (actionName === 'threed') {
                let appid = actionItem?.appid;
                if (typeof window[appid] == 'object') {
                    window[appid].setVariable(targetEleAttribute, GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath));
                }
            }

            else if (actionName === 'attach-attribute') {
                if(targetEleAttribute == 'value'){
                    targetEle.value = GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath);
                }else{
                    targetEle.setAttribute(targetEleAttribute, GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath));
                }
            }

            else if (actionName === 'trigger-scroll') {
                let scrollValue = GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath);

                if(scrollValue){
                    windowobj.scrollTo(0, parseFloat(scrollValue));
                }
            }

            else if (actionName === 'set-variable') {
                // List of valid transform attributes
                const transformAttributes = [
                    'translateX', 'translateY', 'rotateX', 'rotateY',
                    'scaleX', 'scaleY', 'translateZ', 'scale', 'rotate'
                ];

                if (transformAttributes.includes(targetEleAttribute)) {
                    GSPBsetTransformAttribute(targetEle, targetEleAttribute, GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath));
                } else {
                    targetEle.style.setProperty(targetEleAttribute, GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath));
                }

            }

            else if (actionName === 'toggle-class') {
                targetEle.classList.toggle(targetEleClass);
            }

            else if (actionName === 'trigger-click') {
                triggerElement.click();
            }

            else if (actionName === 'remove-class') {
                targetEle.classList.remove(targetEleClass);
            }

            else if (actionName === 'remove-attribute') {
                targetEle.removeAttribute(targetEleAttribute);
            }

            else if (actionName === 'toggle-attribute') {
                targetEle.toggleAttribute(targetEleAttribute);
            }

            else if (actionName === 'save-to-browser-storage') {
                let storageKeyAdd = actionItem.storagekey;
                let storageValAdd = targetEleAttributeValue || actionItem.storagevalue;
                localStorage.setItem(storageKeyAdd, GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, storageValAdd, targetEleAttributeSelector, targetEleAttributecustomMath));
            }

            else if (actionName === 'copy-to-clipboard') {
                let copyText = GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, targetEleAttributeValue, targetEleAttributeSelector, targetEleAttributecustomMath);
                if (copyText) {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(copyText).catch(error => {
                            console.error('Failed to copy text: ', error);
                            // Fallback to execCommand
                            const textArea = document.createElement("textarea");
                            textArea.value = copyText;
                            document.body.appendChild(textArea);
                            textArea.select();
                            try {
                                document.execCommand('copy');
                            } catch (err) {
                                console.error("Failed to copy using execCommand: ", err);
                            }
                            document.body.removeChild(textArea);
                        });
                    } else {
                        // Fallback for browsers that don't support clipboard API
                        const textArea = document.createElement("textarea");
                        textArea.value = copyText;
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) {
                            console.error("Failed to copy using execCommand: ", err);
                        }
                        document.body.removeChild(textArea);
                    }
                }
            }

            else if (actionName === 'save-to-cookie') {
                let storageKeyAdd = actionItem.storagekey;
                let storageValAdd = targetEleAttributeValue || actionItem.storagevalue;
                let storageValTime = actionItem.storagetime;
                GSCookClass.setCookie(storageKeyAdd, GSPBMathAttributeOperator(element, triggerElement, event, windowobj, documentobj, targetEleAttributeUnit, storageValAdd, targetEleAttributeSelector, targetEleAttributecustomMath), storageValTime);
            }

            else if (actionName === 'remove-from-browser-storage') {
                let storageKeyRemove = actionItem.storagekey;
                localStorage.removeItem(storageKeyRemove);
            }

            else if (actionName === 'remove-from-cookie') {
                let storageKeyRemove = actionItem.storagekey;
                GSCookClass.removeCookie(storageKeyRemove);
            }

            else if (actionName === 'hide-element') {
                targetEle.style.display = 'none';
            }

            else if (actionName === 'show-element') {
                targetEle.style.display = 'block';
            }

            else if (actionName === 'toggle-element') {
                if (targetEle.style.display === "none") {
                    targetEle.style.display = "block";
                } else {
                    targetEle.style.display = "none";
                }
            }
            else if (actionName === 'lightbox' && typeof openGreenlightbox === 'function') {
                if(event && typeof event.preventDefault === 'function'){
                    event.preventDefault();
                }
                if (triggerElement != targetEle) {
                    openGreenlightbox(targetEle, triggerElement);
                } else {
                    let lightboxlink = actionItem?.lightboxlink;
                    if (lightboxlink) {
                        openGreenlightbox(lightboxlink, triggerElement);
                    } else if (triggerElement.getAttribute('data-lightbox-src')) {
                        openGreenlightbox(triggerElement.getAttribute('data-lightbox-src'), triggerElement);
                    } else if (triggerElement.getAttribute('href')) {
                        openGreenlightbox(triggerElement.getAttribute('href'), triggerElement);
                    }
                }
            }
            else if ((actionName === 'panel' || actionName === 'popup') && typeof openGreendynamicpanel === 'function') {
                if(event && typeof event.preventDefault === 'function'){
                    event.preventDefault();
                }
                if (triggerElement != targetEle) {
                    openGreendynamicpanel(targetEle, triggerElement, actionSelector);
                }
            }
            else if (actionName === 'popover') {
                event.preventDefault();
                if (triggerElement != targetEle) {
                    targetEle.togglePopover();
                    targetEle.classList.toggle('active');
                    triggerElement.classList.toggle('gs-popover-open');
                }
            }
        });
    }
}

function gspb_check_inter_Conditions(targetElement, conditions, event, triggerElement, documentobj = document) {
    let conditionResults = [];
    let returnResult = false;
    conditions && conditions.forEach(condition => {
        let condtionResult = false;
        const includeOrNot = condition.includeornot;
        const classOrId = condition.classorid;
        const name = condition.additionalclass;
        const value = condition.value;
        const customSelector = condition.customselector;

        if(customSelector){
            targetElement = GSPBGetCustomSelector(customSelector, triggerElement, documentobj);
        }

        const compareTwo = (type, value, compare) => {

            let compareElement = '';
            if (type === 'value') {
                compareElement = event?.target?.value;
            } else if (type === 'storage') {
                compareElement = localStorage.getItem(name);
            } else if (type === 'cookie') {
                compareElement = GSCookClass.getCookie(name);
            } else if (type === 'window-width') {
                compareElement = window.innerWidth;
            } else if (type === 'window-height') {
                compareElement = window.innerHeight;
            }

            if (compare === 'more') {
                return compareElement > parseFloat(value);
            } else if (compare === 'less') {
                return compareElement < parseFloat(value);
            } else if (compare === 'equal') {
                return compareElement == parseFloat(value);
            } else if (compare === 'not-equal') {
                return compareElement != parseFloat(value);
            } else if (compare === 'contains') {
                return compareElement.includes(value);
            } else if (compare === 'not-contains') {
                return !compareElement.includes(value);
            } else if (compare === 'between') {
                let valueBetween = value.split('-');
                return valueBetween && valueBetween.length > 0 && compareElement >= parseFloat(valueBetween[0].trim()) && compareElement <= parseFloat(valueBetween[1].trim());
            }
        }

        if (includeOrNot === 'includes') {
            console.log(targetElement);
            if (classOrId === 'class' && targetElement && targetElement.classList && targetElement.classList.contains(name)) {
                condtionResult = true;
            } else if (classOrId === 'id' && targetElement && targetElement.id === name) {
                condtionResult = true;
            } else if (classOrId === 'storage' && localStorage.getItem(name)) {
                condtionResult = true;
            } else if (classOrId === 'cookie' && GSCookClass.getCookie(name)) {
                condtionResult = true;
            }

        } else if (includeOrNot === 'not-includes') {
            if (classOrId === 'class' && !targetElement.classList.contains(name)) {
                condtionResult = true;
            } else if (classOrId === 'id' && targetElement.id !== name) {
                condtionResult = true;
            } else if (classOrId === 'storage' && !localStorage.getItem(name)) {
                condtionResult = true;
            } else if (classOrId === 'cookie' && !GSCookClass.getCookie(name)) {
                condtionResult = true;
            }
        } else if (includeOrNot == 'more') {
            condtionResult = compareTwo(classOrId, value, 'more');
        } else if (includeOrNot == 'less') {
            condtionResult = compareTwo(classOrId, value, 'less');
        } else if (includeOrNot == 'equal') {
            condtionResult = compareTwo(classOrId, value, 'equal');
        } else if (includeOrNot == 'not-equal') {
            condtionResult = compareTwo(classOrId, value, 'not-equal');
        } else if (includeOrNot == 'contains') {
            condtionResult = compareTwo(classOrId, value, 'contains');
        } else if (includeOrNot == 'not-contains') {
            condtionResult = compareTwo(classOrId, value, 'not-contains');
        } else if (includeOrNot == 'checked') {
            if (classOrId == 'value') {
                if (event?.target?.checked) {
                    condtionResult = true;
                }
            }
        } else if (includeOrNot == 'not-checked') {
            if (classOrId == 'value') {
                if (!event?.target?.checked) {
                    condtionResult = true;
                }
            }
        } else if (includeOrNot == 'between') {
            condtionResult = compareTwo(classOrId, value, 'between');
        }
        conditionResults.push(condtionResult);
    });
    if(conditionResults.length > 0){
        if(conditionResults.includes(false)){
            returnResult = false;
        }else{
            returnResult = true;
        }
    }
    return returnResult;
}