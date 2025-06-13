let quoteBox;
let authorBox;
let quotes;
let noDoubleLoading = false;
let lastQuoteNumber;

window.addEventListener('load', async (event) => {
  await getSomeMotivationalQuote();
});

if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    window.document.addEventListener('touchmove', e => {
        if(e.scale !== 1) {
            e.preventDefault();
        }
    }, {passive: false});
}

async function getSomeMotivationalQuote() {
    quoteBox = document.getElementById('motivationQuote');
    authorBox = document.getElementById('motivationAuthor');
    quotes = await getQuotes();
    const quoteNumber = Math.floor(Math.random() * quotes.length);
    lastQuoteNumber = quoteNumber;
    quoteBox.innerText = quotes[quoteNumber].quote;
    authorBox.innerText = quotes[quoteNumber].author;
    quoteBox.classList.add('fade-in');
    authorBox.classList.add('fade-in');
}

async function reloadMotivationQuote() {
    if(!noDoubleLoading) {
        noDoubleLoading = true;
        const button = document.getElementById('reloadButton');
        showHide([quoteBox,authorBox,button]);
        let quoteNumber = lastQuoteNumber;
        while (quoteNumber===lastQuoteNumber){
            quoteNumber =Math.floor(Math.random() * quotes.length);
        }
        setTimeout(() => {
            quoteBox.innerText = quotes[quoteNumber].quote;
            authorBox.innerText = quotes[quoteNumber].author;
            hideShow([quoteBox,authorBox,button]);
            noDoubleLoading = false;
         }, 5000);
    }
}

async function getQuotes() {
    const response = await fetch("src/media/motivations.json");
    return await response.json();
}

function showHide(array){
        array.forEach(element => {
                element?.classList.remove('fade-in');
                element?.classList.add('fade-out');
        })
}

function hideShow(array){
        array.forEach(element => {
                element?.classList.add('fade-in');
                element?.classList.remove('fade-out');
        })
}

function playPause() {
    const player = document.getElementById('player');
    if(player.paused) {
        player.play();
    }else {
        player.pause();
    }
}

