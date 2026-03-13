document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'gs-twin-on-hover'
    const twinSlides = document.querySelectorAll('.gs-twin-on-hover');

    twinSlides.forEach(slide => {
        // Store the original content
        const content = slide.innerHTML;

        // Wrap the content in a span
        const wrappedContent = `<span>${content}</span>`;

        // Duplicate the wrapped content and add aria-hidden to the second span
        slide.innerHTML = `${wrappedContent}<span aria-hidden="true">${content}</span>`;
    });
});