window.debounce = function(func, timeout = 300) {
    let timerId;
    return (...args) => {
        clearTimeout(timerId);

        timerId = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

window.showDangerAlert = function(alertText) {
    const alertDangerElem = document.querySelector("#alertDanger");
    alertDangerElem.textContent = alertText;

    alertDangerElem.classList.remove("d-none");
    // Trigger recalc
    getComputedStyle(alertDangerElem).opacity;
    alertDangerElem.style.opacity = 1;

    setTimeout(() => {
        hideDangerAlert();
    }, 5000);
}

hideDangerAlert = function() {
    const alertDangerElem = document.querySelector("#alertDanger");
    alertDangerElem.style.opacity = 0;

    setTimeout(() => {
        // Wait for opacity transition
        alertDangerElem.classList.add("d-none");
    }, 1000);
}