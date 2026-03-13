function GSinitCursorEffect() {
    const elements = document.querySelectorAll('[data-cursor-effect]');

    elements.forEach(element => {
        const options = JSON.parse(element.getAttribute('data-cursor-effect'));
        const { shiftX = 0, shiftY = 0, rotateX = 0, rotateY = 0, selector = null, restore = false } = options;

        let targetElement = selector ? document.querySelector(selector) : window;
        let isOver = !selector;

        // Add perspective to the parent element if rotation is used
        if (rotateX !== 0 || rotateY !== 0) {
            const parent = element.parentElement;
            if (parent) {
                parent.style.perspective = '1000px';
                // Ensure the parent preserves 3D for its children
                parent.style.transformStyle = 'preserve-3d';
            }
        }

        const handleMouseMove = (e) => {
            if (!isOver) return;

            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            const x = (clientX - innerWidth / 2) / (innerWidth / 2);
            const y = (clientY - innerHeight / 2) / (innerHeight / 2);

            const translateX = x * shiftX;
            const translateY = y * shiftY;
            const rotX = -y * rotateX;
            const rotY = x * rotateY;

            element.style.transform = `
                translateX(${translateX}px)
                translateY(${translateY}px)
                rotateX(${rotX}deg)
                rotateY(${rotY}deg)
            `;
        };

        const handleMouseEnter = () => {
            isOver = true;
        };

        const handleMouseLeave = () => {
            isOver = false;
            if (restore) {
                element.style.transform = 'none';
            }
        };

        if (selector) {
            targetElement.addEventListener('mouseenter', handleMouseEnter);
            targetElement.addEventListener('mouseleave', handleMouseLeave);
        }

        targetElement.addEventListener('mousemove', handleMouseMove);

        // Cleanup function
        return () => {
            if (selector) {
                targetElement.removeEventListener('mouseenter', handleMouseEnter);
                targetElement.removeEventListener('mouseleave', handleMouseLeave);
            }
            targetElement.removeEventListener('mousemove', handleMouseMove);
        };
    });
}

// Initialize the effect when the DOM is ready
document.addEventListener('DOMContentLoaded', GSinitCursorEffect);