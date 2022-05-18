const socket = io();

const streamElem = document.querySelector('#stream');

const mediaSource = new MediaSource;
let mediaBuffer;
let duration = 0;
streamElem.src = URL.createObjectURL(mediaSource);

mediaSource.addEventListener("sourceopen", () => {
    mediaBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
}, false);

socket.on('chunkOfStream', (buffer) => {
    mediaBuffer.appendBuffer(buffer);
});