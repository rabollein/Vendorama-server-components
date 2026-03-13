
let gspb_switchers = document.querySelectorAll('.gspb__switcher-element');
for (let i = 0; i < gspb_switchers.length; i++) {
    let switcher = gspb_switchers[i];
    switcher.addEventListener('keydown', function (e) {
        const keyDown = e.key !== undefined ? e.key : e.keyCode;
        if ((keyDown === 'Enter' || keyDown === 13) ||
            (['Spacebar', ' '].indexOf(keyDown) >= 0 || keyDown === 32)) {
            e.preventDefault();
            this.click();
        }
    });
}