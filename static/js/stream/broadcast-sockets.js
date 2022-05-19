const webcamVideo = document.querySelector("#webcamVideo");

const startSreamBtn = document.querySelector("#startStream");
const endStreamBtn = document.querySelector("#endStream");

let stream;
let recorder;
const startStream = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        return;
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        recorder = new MediaRecorder(stream, {mimeType: 'video/webm; codecs="vp8"', videoBitsPerSecond: 10000000});
        webcamVideo.srcObject = stream;

        startSreamBtn.classList.add("d-none");
        endStreamBtn.classList.remove("d-none");

        recorder.start(100);
        recorder.ondataavailable = async (event) => {
            if (recorder.state === 'recording') {
                const buffer = await event.data.arrayBuffer();
                socket.emit('chunkOfStream', buffer);
            }
        };
    } catch (e) {
        console.log("Something went wrong!", e);
    }
}

const endStream = () => {
    recorder.stop();
    stream.getTracks().forEach( track => track.stop() );


    webcamVideo.srcObject = null;

    startSreamBtn.classList.remove("d-none");
    endStreamBtn.classList.add("d-none");
}


startSreamBtn.addEventListener("click", startStream);
endStreamBtn.addEventListener("click", endStream);