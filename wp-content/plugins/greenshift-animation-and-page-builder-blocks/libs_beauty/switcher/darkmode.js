window.addEventListener('DOMContentLoaded', (event) => {

    const { getCookie, removeCookie, setCookie } = GSCookService;

    // Get all dark mode switcher elements
    const allDarkModeToggles = document.querySelectorAll('.gs_darkmode_switcher');

    for (let i = 0; i < allDarkModeToggles.length; i++) {
        const toggle = allDarkModeToggles[i];
        const cookdays = toggle.dataset.cookdays || 30;
        const cookieId = 'darkmode';

        // Check if dark mode cookie exists
        let currentcook = getCookie(cookieId);

        // Apply dark mode on page load if cookie exists
        if (currentcook) {
            document.body.classList.add('darkmode');
            if (toggle.checked !== true) {
                toggle.checked = true;
            }
        }

        // Add click event listener
        toggle.addEventListener('click', function (ev) {
            //ev.preventDefault();
            
            // Check the checkbox state after the browser has toggled it
            setTimeout(() => {
                if (toggle.checked) {
                    // Enable dark mode
                    document.body.classList.add('darkmode');
                    setCookie(cookieId, "on", cookdays);
                    toggle.setAttribute("data-status", "on");
                    currentcook = 'on';
                } else {
                    // Remove dark mode
                    document.body.classList.remove('darkmode');
                    removeCookie(cookieId);
                    toggle.setAttribute("data-status", "off");
                    currentcook = '';
                }
            }, 0);
        });

        // Add keyboard accessibility
        toggle.addEventListener('keydown', function (e) {
            const keyDown = e.key !== undefined ? e.key : e.keyCode;
            if ((keyDown === 'Enter' || keyDown === 13) ||
                (['Spacebar', ' '].indexOf(keyDown) >= 0 || keyDown === 32)) {
                e.preventDefault();
                this.click();
            }
        });
    }
});
