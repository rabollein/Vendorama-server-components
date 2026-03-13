function GSshowSnackbar(id) {
    var snackbar = document.getElementById(id);
    snackbar.classList.add("show");
    setTimeout(function() {
        snackbar.classList.remove("show");
    }, 3000);
}
async function GSwriteClipboardText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error(error.message);
        }
    }else{
        var textArea = document.createElement("textarea");
        textArea.value = text;
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