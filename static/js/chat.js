// Should be imported after socket is in global scope

const messagesContainer = document.querySelector("#chat-messages");

socket.on('connect', function() {
    document.querySelector("#send-message").disabled = false;
    
    const streamId = Number(location.pathname.split("/").pop());
    socket.emit('join', { stream_id: streamId });
});

socket.on('new message', function (e) {
    const msgElem = document.createElement('div');
    msgElem.classList.add(`chat-message`);
    if (e.isFromStreamer) {
        msgElem.classList.add('message-from-streamer');
    }

    const msgSenderElem = document.createElement('span');
    const msgSenderText = document.createTextNode(`${e.sender}:`);
    msgSenderElem.style.color = e.sender_color;
    msgSenderElem.classList.add('chat-message__sender');
    msgSenderElem.appendChild(msgSenderText);
    msgElem.appendChild(msgSenderElem);

    msgElem.append(document.createTextNode("\n"));

    const msgTextElem = document.createElement('span');
    const msgText = document.createTextNode(e.text);
    msgTextElem.classList.add('chat-message__text');
    msgTextElem.appendChild(msgText);
    msgElem.appendChild(msgTextElem);

    // Prepend instead of appending because chat has reversed column flex direction
    // To show latest messages on load (instead of scrolling down with js)
    messagesContainer.prepend(msgElem)

    const emptyMessagesText = document.querySelector("#noMessagesText");
    emptyMessagesText?.remove();
});

document.querySelector('#newMessageForm').onsubmit = e => {
    e.preventDefault();

    const streamId = Number(location.pathname.split("/").pop());
    const textField = document.querySelector('#newMessageInput');
    socket.emit("message", { text: textField.value, stream_id: streamId });
    textField.value = '';
};