socket.on("broadcaster", (streamId) => {
    const streamCard = document.querySelector(`#streamCard-${streamId}`);
    streamCard.classList.remove("inactive");
});

socket.on("endStream", (streamId) => {
    const streamCard = document.querySelector(`#streamCard-${streamId}`);
    streamCard.classList.add("inactive");
});