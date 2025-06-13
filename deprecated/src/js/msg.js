window.addEventListener('load', async (event) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.get('head') && urlParams.get('msg') ) {
        const headMsg = UnicodeDecodeB64(urlParams.get('head'));
        const message = UnicodeDecodeB64(urlParams.get('msg'));
        const head = document.getElementById('headId');
        head.innerText = headMsg;
        const messageElement = document.getElementById('msgId');
        messageElement.innerText = message;
        messageElement.classList.add('fade-in-slow');
    }
});



function UnicodeDecodeB64(str) {
    return decodeURIComponent(atob(str));
}