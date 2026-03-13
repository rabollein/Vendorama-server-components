class FollowObject {
    constructor(container, selector, options = {}) {
        this.container = container;
        this.object = container.querySelector(selector);
        this.mouseX = 0;
        this.mouseY = 0;
        this.objectX = 0;
        this.objectY = 0;
        this.isVisible = false;
        this.options = {
            useOpacity: options.useOpacity || false,
            initialOpacity: options.initialOpacity || 0,
            hoverOpacity: options.hoverOpacity || 1
        };
        this.objectWidth = 0;
        this.objectHeight = 0;

        this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.container.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.animate = this.animate.bind(this);

        this.init();
        requestAnimationFrame(this.animate);
    }

    init() {
        if (this.options.useOpacity) {
            this.object.style.opacity = this.options.initialOpacity;
        }
        // Calculate object dimensions once
        this.objectWidth = this.object.offsetWidth;
        this.objectHeight = this.object.offsetHeight;
    }

    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    handleMouseEnter() {
        this.isVisible = true;
        if (this.options.useOpacity) {
            this.object.style.opacity = this.options.hoverOpacity;
        }
    }

    handleMouseLeave() {
        this.isVisible = false;
        if (this.options.useOpacity) {
            this.object.style.opacity = this.options.initialOpacity;
        }
    }

    handleMouseDown() {
        this.container.classList.add('mouseclick-wrapper');
        this.object.classList.add('mouseclick-obj');
    }

    handleMouseUp() {
        this.container.classList.remove('mouseclick-wrapper');
        this.object.classList.remove('mouseclick-obj');
    }

    animate() {
        // Ease the movement (now to the center of the object)
        let dx = (this.mouseX - this.objectWidth / 2) - this.objectX;
        let dy = (this.mouseY - this.objectHeight / 2) - this.objectY;
        this.objectX += dx * 0.1;
        this.objectY += dy * 0.1;

        // Constrain object within the container (adjusted for center positioning)
        this.objectX = Math.max(-this.objectWidth / 2, Math.min(this.objectX, this.container.clientWidth - this.objectWidth / 2));
        this.objectY = Math.max(-this.objectHeight / 2, Math.min(this.objectY, this.container.clientHeight - this.objectHeight / 2));

        // Apply the position (adjusted for center)
        this.object.style.left = `${this.objectX}px`;
        this.object.style.top = `${this.objectY}px`;

        requestAnimationFrame(this.animate);
    }
}

let GSCustomCursors = document.querySelectorAll('[data-custom-cursor]');
GSCustomCursors.forEach(cursor => {
    let options = JSON.parse(cursor.getAttribute('data-custom-cursor'));
    let selector = options.selector || '[data-custom-cursor-object]';
    let useOpacity = options.opacity || false;
    if(selector){
        new FollowObject(cursor, selector, { useOpacity: useOpacity });
    }
});