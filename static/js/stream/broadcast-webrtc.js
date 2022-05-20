// In this file we handle communication with webrtc signaling server
// And UI changes related to stream broadcasting
const rtcPeerConnectionConfig = {
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
};

// Using proxy traps to trigger views count change when peerConnections are touched
const peerConnections = new Proxy({}, {
    set: (target, prop, value) => {
        target[prop] = value;
        onViewsCountChange();
    },
    deleteProperty: (target, prop) => {
        delete target[prop];
        onViewsCountChange();
    }
});

const streamId = Number(location.pathname.split("/").pop());
const webcamVideo = document.querySelector("#webcamVideo");

const startSreamBtn = document.querySelector("#startStream");
const endStreamBtn = document.querySelector("#endStream");
const viewsCountElem = document.querySelector("#viewsCount");

let stream;
const startStream = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        return;
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 180 }, audio: true });
        webcamVideo.srcObject = stream;

        socket.emit("broadcaster", streamId);
    
        startSreamBtn.classList.add("d-none");
        endStreamBtn.classList.remove("d-none");
    } catch {
        console.log("Something went wrong")
    }
}

const closePeerConnection = (id) => {
    peerConnections[id].close();
    delete peerConnections[id];
}

const endStream = () => {
    stream.getTracks().forEach(track => track.stop());
    webcamVideo.srcObject = null;

    socket.emit("endStream", streamId);
    Object.keys(peerConnections).forEach(id => {
        closePeerConnection(id);
    })

    startSreamBtn.classList.remove("d-none");
    endStreamBtn.classList.add("d-none");
}

const onViewsCountChange = debounce(() => {
    const newCount = Object.keys(peerConnections).length;
    viewsCountElem.textContent = newCount;
    socket.emit("viewCount", streamId, newCount);
});

socket.on("watcher", async id => {
    const peerConnection = new RTCPeerConnection(rtcPeerConnectionConfig);
    peerConnections[id] = peerConnection;

    if (stream) {
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    }
        
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
        }
    };

    const sdp = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(sdp);
    socket.emit("offer", id, peerConnection.localDescription);
});

socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description);
});

socket.on("candidate", (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
    // disconnectPeer is fired to all broadcasters as we don't know what stream he was watching
    // So we just check it on every broadcaster instead
    if (!peerConnections[id]) {
        return;
    }

    closePeerConnection(id);
});

startSreamBtn.addEventListener("click", startStream);
endStreamBtn.addEventListener("click", endStream);