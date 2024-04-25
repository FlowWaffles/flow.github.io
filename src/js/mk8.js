let tips;
let currentTipIndex = 0;

function showNextTip() {
    tips[currentTipIndex].classList.remove('active');
    currentTipIndex = (currentTipIndex + 1) % tips.length;
    tips[currentTipIndex].classList.add('active');
}

function showPrevTip() {
    tips[currentTipIndex].classList.remove('active');
    currentTipIndex = (currentTipIndex - 1 + tips.length) % tips.length; // Ensure positive modulo
    tips[currentTipIndex].classList.add('active');
}

function handleScroll(event) {
    let deltaY = 0;
    if (event.type === 'wheel') {
        deltaY = event.deltaY;
    } else if (event.type === 'touchmove') {
        deltaY = event.touches[0].clientY - lastYPosition;
        lastYPosition = event.touches[0].clientY;
    }

    let scrollDirection;
    if (deltaY > 0) {
        scrollDirection = 'down';
        showNextTip();
    } else if (deltaY < 0) {
        scrollDirection = 'up';
        showPrevTip();
    } else {
        scrollDirection = 'none'; // No scroll
    }
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        const context = this;
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}


function handleKeyDown(event) {
    switch(event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
            showPrevTip();
            break;
        case 'ArrowDown':
        case 'ArrowRight':
            showNextTip();
            break;
        default:
            break;
    }
}

window.addEventListener('load', async (event) => {
    tips = document.querySelectorAll('.tip');
    window.addEventListener('touchmove', debounce(handleScroll, 250));
    window.addEventListener('wheel', debounce(handleScroll, 250));
    window.addEventListener('keydown', handleKeyDown);
});


