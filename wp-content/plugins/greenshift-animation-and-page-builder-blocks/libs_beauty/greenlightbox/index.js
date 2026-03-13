class GSLightbox {
    constructor(options = {}) {
        this.options = {
            linkAttribute: 'href',
            iframeWidth: '16',
            iframeHeight: '9',
            ...options
        };
        this.injectStyles();
        this.createLightboxElement();
        this.lightbox = document.getElementById('gs-lightbox');
        this.content = this.lightbox.querySelector('.gs-lightbox-content');
        this.closeBtn = this.lightbox.querySelector('.gs-lightbox-close');

        this.closeBtn.addEventListener('click', () => this.close());
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });

        this.initLinks();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .gs-lightbox {
                display: flex;
                justify-content: center;
                align-items: center;
                position: fixed;
                z-index: 999999;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: var(--wp--custom--lightbox--background-color, rgba(0, 0, 0, 0.8));
                opacity: 0;
                visibility: hidden;
                transition: var(--gs-root-transition, all .3s ease-in-out);
                pointer-events: none;
            }
            .gs-lightbox.active {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }
            .gs-lightbox-content {
                max-width: 90%;
                max-height: 90%;
                overflow: auto;
                transform: scale(0.8);
                transition: var(--gs-root-transition, all .3s ease-in-out);
            }
            .gs-lightbox.active .gs-lightbox-content {
                transform: scale(1);
            }
            .gs-lightbox-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: var(--wp--custom--lightbox--close-button--background-color, rgba(0, 0, 0, 0.5));
                border: none;
                cursor: pointer;
                display: flex;
                color: var(--wp--custom--close-button--color, white);
                justify-content: center;
                align-items: center;
                transition: background-color 0.3s ease;
            }
            .gs-lightbox-close:hover {
                background-color: rgba(0, 0, 0, 0.8);
            }
            .gs-lightbox-content img {
                max-width: 100%;
                max-height: 80vh;
                display: block;
            }
            .gs-lightbox-video-wrapper {
                position: relative;
                max-width: 90%;
                width: 142.3vh;
                margin: 0 auto;
                overflow: hidden;
                max-height: 80vh;
            }
            .gs-lightbox-video-wrapper::before {
                content: "";
                display: block;
                padding-top: 56.25%; /* 16:9 aspect ratio */
            }
            .gs-lightbox-video-wrapper iframe,
            .gs-lightbox-video-wrapper video {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    createLightboxElement() {
        const lightboxHTML = `
            <div id="gs-lightbox" class="gs-lightbox" aria-label="Lightbox" aria-hidden="true" role="dialog" aria-modal="true">
                <div class="gs-lightbox-content" tabindex="-1"></div>
                <button class="gs-lightbox-close" aria-label="Close lightbox">
                    <svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"/></svg>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }

    initLinks() {
        document.querySelectorAll('[data-gs-lightbox]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const src = link.getAttribute(this.options.linkAttribute) || link.getAttribute('data-lightbox-src');
                if (src) {
                    this.open(src, link);
                }
            });
        });
    }

    open(src, trigger) {
        this.content.innerHTML = '';
        this.triggerElement = trigger;
        if (typeof src === 'string') {
            if (src.includes('youtube.com') || src.includes('youtu.be')) {
                const videoId = this.getYouTubeId(src);
                this.createResponsiveVideo(`https://www.youtube.com/embed/${videoId}`);
            } else if (src.includes('vimeo.com')) {
                const videoId = this.getVimeoId(src);
                this.createResponsiveVideo(`https://player.vimeo.com/video/${videoId}`);
            } else if (src.match(/\.(mp4)$/) !== null) {
                this.createResponsiveVideo(src, true);
            } else {
                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Lightbox Image';
                this.content.appendChild(img);
            }
        } else if (src instanceof HTMLElement) {
            const element = src;
            if (element && typeof element.cloneNode === 'function') {
                try {
                    const clone = element.cloneNode(true);
                    clone.classList.add('gs-lightbox-initial');
                    this.content.appendChild(clone);
                    setTimeout(() => {
                        clone.classList.add('active');
                        clone.classList.remove('gs-lightbox-initial');
                    }, 10);
                } catch (error) {
                    console.error('Failed to clone element:', error);
                }
            } else if (element) {
                // Fallback if cloneNode is not available
                this.content.innerHTML = element.outerHTML || element.textContent;
            }
        }

        setTimeout(() => {
            this.lightbox.classList.add('active');
        }, 10);
        if (this.triggerElement) {
            this.triggerElement.classList.add('triggeractive');
        }
        this.lightbox.setAttribute('aria-hidden', 'false');
        this.content.focus();
    }

    createResponsiveVideo(src, isMP4 = false) {
        const wrapper = document.createElement('div');
        wrapper.className = 'gs-lightbox-video-wrapper';

        if (isMP4) {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            wrapper.appendChild(video);
        } else if (src.includes('youtube.com') || src.includes('youtu.be')) {
            const videoId = this.getYouTubeId(src);
            const playerDiv = document.createElement('div');
            playerDiv.id = 'gs-youtube-player';
            wrapper.appendChild(playerDiv);

            this.loadYouTubeAPIAndCreatePlayer(videoId, playerDiv);
        } else {
            const iframe = document.createElement('iframe');
            if (src.includes('youtube.com') || src.includes('youtu.be')) {
                // Modify YouTube src to include autoplay and mute
                src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
            }
            iframe.src = src;
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            wrapper.appendChild(iframe);
        }

        this.content.appendChild(wrapper);
    }

    loadYouTubeAPIAndCreatePlayer(videoId, playerDiv) {
        if (window.YT && window.YT.Player) {
            this.createYouTubePlayer(videoId, playerDiv);
        } else {
            // Load the API
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // Set up the callback
            window.onYouTubeIframeAPIReady = () => {
                this.createYouTubePlayer(videoId, playerDiv);
            };
        }
    }

    createYouTubePlayer(videoId, playerDiv) {
        new window.YT.Player(playerDiv, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                autoplay: 1,
            },
            events: {
                'onReady': (event) => {
                    // Focus on the player when it's ready
                    event.target.getIframe().focus();
                }
            }
        });
    }

    close() {
        this.lightbox.classList.remove('active');
        this.lightbox.setAttribute('aria-hidden', 'true');
        if (this.triggerElement) {
            this.triggerElement.classList.remove('triggeractive');
            this.triggerElement.focus();
        }
        setTimeout(() => {
            this.content.innerHTML = '';
        }, 300); // Wait for transition to finish before clearing content
    }

    getYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    getVimeoId(url) {
        const regExp = /vimeo.*\/(\d+)/i;
        const match = url.match(regExp);
        return match ? match[1] : null;
    }
}

// Initialize the gs-lightbox with default options (using href)
let greenLightbox;
document.addEventListener('DOMContentLoaded', () => {
    greenLightbox = new GSLightbox();
});

// Function to open lightbox from external triggers
function openGreenlightbox(src, trigger) {
    if (greenLightbox) {
        greenLightbox.open(src, trigger);
    }
}