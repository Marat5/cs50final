window.debounce = function(func, timeout = 300) {
    let timerId;
    return (...args) => {
        clearTimeout(timerId);

        timerId = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}