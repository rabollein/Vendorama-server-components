window.addEventListener('DOMContentLoaded', (event) => {

    const { getCookie, removeCookie, setCookie } = GSCookService;

    // //function to set position to local storage
    function setLocalStorage(lsSwitchPositionArray, target) {
        let switchData = JSON.stringify(lsSwitchPositionArray);
        localStorage.setItem(target, switchData);
    }

    // //function to get position from local storage
    function getLocalStorage(target) {
        let lsSwitchPositionArray = localStorage.getItem(target);
        return JSON.parse(lsSwitchPositionArray);
    }

    // get all switcher elements
    const allToggles = document.getElementsByClassName('gspb__switcher-element');
    let lsSwitchPositionArray = [];
    let localSwitchPositionArray = [];

    for (let i = 0; i < allToggles.length; i++) {
        const toggle = allToggles[i];
        const toggleId = toggle.id;
        const toggleData = [toggleId, toggle.dataset.status];
        const isLocalEnabled = toggle.dataset.local;
        const storagePoint = toggle.dataset.storage;
        let bodyclass = toggle.dataset.class;
        let cookname = toggle.dataset.cookname;
        let cookdays = toggle.dataset.cookdays || 30;
        let cookieId = cookname || 'gspbswitchers' + toggleId;
        let container = toggle.closest('.gspb__switcher-container');
        let checkbox = container.querySelector('.gspb-switchbox-checkbox');

        if (isLocalEnabled == "true") {
            let currentcook = '';
            let targetIndex = '';
            let localStorageData = [];
            if (storagePoint == "cookie") {
                currentcook = getCookie(cookieId);
            } else if (storagePoint == 'local') {
                localStorageData = getLocalStorage('gspbswitchers');
                if (localStorageData != null) {
                    targetIndex = localStorageData.includes(toggleId);
                    if (targetIndex) {
                        currentcook = toggleId;
                    }
                }
            }

            let statusDefault = toggle.dataset.status;
            if (currentcook && bodyclass) {
                document.body.classList.add(bodyclass);
            }
            if (currentcook && statusDefault == "off" && !checkbox.checked) {
                checkbox.click();
                toggle.setAttribute("data-status", "on");
            }

            toggle.addEventListener('click', function (ev) {
                ev.preventDefault();
                if (bodyclass) {
                    document.body.classList.toggle(bodyclass);
                }
                if (currentcook) {
                    if (storagePoint == "cookie") {
                        removeCookie(cookieId);
                    } else if (storagePoint == 'local') {
                        const index = localStorageData.indexOf(toggleId);
                        if (index > -1) {
                            localStorageData.splice(index, 1);
                        }
                        setLocalStorage(localStorageData, 'gspbswitchers');
                    }
                    toggle.setAttribute("data-status", "off");
                } else {
                    if (storagePoint == "cookie") {
                        setCookie(cookieId, "on", cookdays);
                    } else if (storagePoint == 'local') {
                        if(localStorageData == null){localStorageData = [];}
                        localStorageData.push(toggleId);
                        setLocalStorage(localStorageData, 'gspbswitchers');
                    }
                    toggle.setAttribute("data-status", "on");
                }

                checkbox.click();

            });

        }
    }
});