const GSgreenCalculateScroll = (element, windowobj = window, startElement = 0, startWindow = 100, endElement = 100, endWindow = 0, orientation = "vertical" // 'vertical' or 'horizontal'
) => {
    const rect = element.getBoundingClientRect();
    let value = null;

    // Determine the properties to use based on the orientation
    const startPosElement = orientation === "vertical" ? rect.top : rect.left;
    const sizeElement = orientation === "vertical" ? rect.height : rect.width;
    let sizeWindow = 0;
    if (windowobj.innerHeight) {
        sizeWindow = orientation === "vertical" ? windowobj.innerHeight : windowobj.innerWidth;
    } else {
        sizeWindow = orientation === "vertical" ? windowobj.clientHeight : windowobj.clientWidth;
    }

    // Calculate the custom start and end positions based on the percentages
    const startPositionElement = startPosElement + sizeElement * startElement / 100;
    const endPositionElement = startPosElement + sizeElement * endElement / 100;
    const startPositionWindow = sizeWindow * startWindow / 100;
    const endPositionWindow = sizeWindow * endWindow / 100;

    // Adjusted conditions for interpolation
    if (startPositionElement <= startPositionWindow && endPositionElement >= endPositionWindow) {
        const totalDistance = startPositionWindow - endPositionWindow + (endPositionElement - startPositionElement);
        const currentDistance = startPositionWindow - startPositionElement;
        let initialValue = element.getAttribute("data-scroll-initial") || 0;
        const interpolate = (originalValue, minOriginal, maxOriginal = 100) => {
            // Ensure the value stays within the bounds
            originalValue = Math.max(minOriginal, Math.min(maxOriginal, originalValue));

            // Re-map the value from the original scale (28-100) to the new scale (0-100)
            const remappedValue = (originalValue - minOriginal) / (maxOriginal - minOriginal) * 100;
            return remappedValue;
        };
        value = currentDistance / totalDistance * 100;
        value = interpolate(value, initialValue, 100);
    } else if (endPositionElement < endPositionWindow) {
        value = 100;
    } else {
        value = 0;
    }
    return value;
};

const GSgreengetTransformValue = (transformString, valueName) => {
    const matrix = new DOMMatrix(transformString);

    const values = {
        scale: () => Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
        rotate: () => {
            const match = transformString.match(/rotate\(([^)]+)\)/);
            if (match) {
                let angle = parseFloat(match[1]);
                // Normalize the angle to be between 0 and 360
                angle = angle % 360;
                if (angle < 0) angle += 360;
                return angle;
            }
            // If no explicit rotate, fall back to matrix calculation
            return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        },
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

window.addEventListener("load", event => {
    let greenlightScrollItems = document.querySelectorAll(".gs-motion-onscrub, [data-aos-scrub]");
    for (let element of greenlightScrollItems) {
        let calculateProgressInitial = GSgreenCalculateScroll(element, window);
        if (calculateProgressInitial) {
            element.setAttribute("data-scroll-initial", calculateProgressInitial);
        }
        let computedStyle = window.getComputedStyle(element);

        // Check and store initial values for transform properties and opacity
        const initialValues = {};
        const properties = ['translateX', 'translateY', 'translateZ', 'rotateX', 'rotateY', 'rotate', 'scaleX', 'scaleY', 'scale', 'skewX', 'skewY', 'opacity'];

        console.log(computedStyle);
        console.log(GSgreengetTransformValue(computedStyle.getPropertyValue('transform'), 'rotate'));

        properties.forEach(prop => {
            if (prop === 'opacity') {
                initialValues[prop] = parseFloat(computedStyle.getPropertyValue(prop));
            } else {
                const transformValue = computedStyle.getPropertyValue('transform');
                initialValues[prop] = GSgreengetTransformValue(transformValue, prop) || 0;
            }
        });

        element.setAttribute('data-initial-values', JSON.stringify(initialValues));
    }
});

window.addEventListener("scroll", event => {
    let greenlightScrollItems = document.querySelectorAll(".gs-motion-onscrub, [data-aos-scrub]");
    for (let element of greenlightScrollItems) {
        let calculateProgress = GSgreenCalculateScroll(element, window);
        if (calculateProgress) {
            element.setAttribute("data-scroll-progress", calculateProgress);

            // Interpolate between initial and static values
            const initialValues = JSON.parse(element.getAttribute('data-initial-values'));
            const progress = calculateProgress / 100;

            let transformString = '';
            let opacityValue = 1;

            if (initialValues) {

                for (const [prop, initialValue] of Object.entries(initialValues)) {
                    if (prop === 'opacity' || prop === 'scale' || prop === 'scaleX' || prop === 'scaleY') {
                        opacityValue = initialValue + (1 - initialValue) * progress;
                    } else {
                        const staticValue = 0;
                        const interpolatedValue = initialValue + (staticValue - initialValue) * progress;

                        if (prop.startsWith('rotate')) {
                            transformString += `${prop}(${interpolatedValue}deg) `;
                        } else if (prop.startsWith('skew')) {
                            transformString += `${prop}(${interpolatedValue}deg) `;
                        } else {
                            transformString += `${prop}(${interpolatedValue}${prop.startsWith('scale') ? '' : 'px'}) `;
                        }
                    }
                }
            }

            element.style.transform = transformString.trim();
            element.style.opacity = opacityValue;
        }
    }
});