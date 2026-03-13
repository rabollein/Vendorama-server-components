document.querySelectorAll('[data-gs-counter]').forEach(link => {

    // Extract the first numeric value from the link's content
    const linkContent = link.textContent;
    const firstNumber = linkContent.match(/\d+/);
    
    if (firstNumber) {

        let options = JSON.parse(link.getAttribute('data-gs-counter'));
        const startValue = parseFloat(firstNumber[0]);
        let dataEnd = link.getAttribute('data-counter-end');
        if(dataEnd){
            dataEnd = parseFloat(dataEnd)
        }else{
            dataEnd = 100;
        }
        const endValue = parseFloat(options.end) || dataEnd;
        const totalDuration = (parseFloat(options.duration) || 5) * 1000; // Convert to milliseconds
        const offset = parseFloat(options.offset) || 100;
        const stepNumber = parseFloat(options.step) || 1;

        // Calculate the number of decimal places in the step
        const stepPrecision = (stepNumber.toString().split('.')[1] || '').length;

        // Calculate the number of steps and step duration
        const numberOfSteps = Math.ceil((endValue - startValue) / stepNumber);
        const stepDuration = totalDuration / numberOfSteps;

        // Create a span element with the first number
        const span = document.createElement('span');
        span.className = 'gs-greenlight-counter';
        span.textContent = startValue;
        
        // Replace the first occurrence of the number with the span
        link.innerHTML = '';
        link.appendChild(span);
        
        // Set the container to the newly created span
        const container = link.querySelector('.gs-greenlight-counter');
        
        // Create an Intersection Observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start the animation when the element is in view
                    GSanimateCounter(startValue, endValue, stepDuration, offset, container, stepNumber, stepPrecision);
                    // Disconnect the observer after starting the animation
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1 }); // Start animation when 10% of the element is visible

        // Start observing the container
        observer.observe(container);
    }
});

function GScreateNumberElement(value, className) {
    const element = document.createElement('span');
    element.className = `gs-counter-number ${className}`;
    element.textContent = value;
    return element;
}

function GSanimateCounter(currentValue, endValue, stepDuration, offset, container, stepNumber, stepPrecision) {
    if (currentValue >= endValue) {
        // Set the final value without animation
        //container.textContent = GSroundNumberforCounter(endValue, stepPrecision);
        container.classList.add('gs-counter-finished');
        return;
    }
    
    // Clear previous numbers
    container.innerHTML = '';
    
    // Calculate the next value based on stepNumber
    const nextValue = Math.min(currentValue + stepNumber, endValue);
    
    // Create elements for current and next numbers
    const current = GScreateNumberElement(GSroundNumberforCounter(currentValue, stepPrecision), 'gs-current-number');
    const next = GScreateNumberElement(GSroundNumberforCounter(nextValue, stepPrecision), 'gs-next-number');
    
    // Add elements to container
    container.appendChild(current);
    container.appendChild(next);
    
    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Current number slides up and fades out
            current.style.transform = `translateY(-${offset}px)`;
            current.style.opacity = '0';
            
            // Next number slides up and fades in
            next.style.transform = 'translateY(0)';
            next.style.opacity = '1';
        });
    });
    
    setTimeout(() => GSanimateCounter(nextValue, endValue, stepDuration, offset, container, stepNumber, stepPrecision), stepDuration);
}

function GSroundNumberforCounter(num, precision) {
    return num.toFixed(precision);
}