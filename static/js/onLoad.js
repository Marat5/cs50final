// Don't show any transitions when document is first loaded
document.addEventListener('DOMContentLoaded', function() {
    const body = document.querySelector("body");
    body.classList.remove("preload");
});

// Fix 100vh problem in mobile safari
const appHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--app-height', `${window.innerHeight}px`)
}
window.addEventListener('resize', appHeight)
appHeight()