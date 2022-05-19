const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};
let peerConnection;

const streamId = Number(location.pathname.split("/").pop());

const streamElem = document.querySelector('#stream');
const streamNotLiveElem = document.querySelector("#stream-not-live");
const viewsCountElem = document.querySelector("#viewsCount");


socket.on("offer", async (id, description) => {
    peerConnection = new RTCPeerConnection(config);

    peerConnection.ontrack = event => {
        streamElem.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
        }
    };

    await peerConnection.setRemoteDescription(description);
    const sdp = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(sdp);

    socket.emit("answer", id, peerConnection.localDescription);
});

socket.on("candidate", async (id, candidate) => {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
        console.log(e);
    }
});

socket.on("connect", () => {
    socket.emit("watcher", streamId);
});

socket.on("broadcaster", (broadcasterStreamId) => {
    if (broadcasterStreamId !== streamId) {
        return;
    }

    streamNotLiveElem.classList.add("d-none");
    streamNotLiveElem.classList.remove("d-block");

    socket.emit("watcher", streamId);
});

socket.on("viewCount", (newCountStreamId, newCount) => {
    if (newCountStreamId !== streamId) {
        return;
    }

    viewsCountElem.textContent = newCount;
});

socket.on("endStream", (broadcasterStreamId) => {
    if (broadcasterStreamId !== streamId) {
        return;
    }

    streamElem.srcObject = null;

    viewsCountElem.textContent = 0;
    streamNotLiveElem.classList.remove("d-none");
    streamNotLiveElem.classList.add("d-block");
});

window.onunload = window.onbeforeunload = () => {    
    if (peerConnection) {
        peerConnection.close();
        socket.emit("disconnectPeer", streamId)
    }
};