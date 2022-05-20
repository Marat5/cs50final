// This script is executed on load for any page before all other scripts
socket = io();

// Don't show any transitions when document is first loaded
document.addEventListener('DOMContentLoaded', function() {
    const body = document.querySelector("body");
    body.classList.remove("preload");
});

// Fix 100vh problem in mobile safari
const setCSSAppHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--app-height', `${window.innerHeight}px`)
}

window.addEventListener('resize', setCSSAppHeight);
setCSSAppHeight();

socket.on("broadcaster", (streamId) => {
    const liveCircle = document.querySelector(`#liveCircle-${streamId}`);

    liveCircle.classList.remove("inactive");
});

socket.on("endStream", (streamId) => {
    const liveCircle = document.querySelector(`#liveCircle-${streamId}`);
    const viewerCount = document.querySelector(`#viewerCount-${streamId}`);

    viewerCount.textContent = 0;
    liveCircle.classList.add("inactive");
});

socket.on("viewCount", (streamId, newCount) => {
    const viewerCount = document.querySelector(`#viewerCount-${streamId}`);

    viewerCount.textContent = newCount;
});
