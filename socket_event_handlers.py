from flask import request
from flask_socketio import join_room, emit
from helpers import generate_chat_user_number, get_user_color, get_stream_by_id, get_broadcaster_id_list, get_stream_by_broadcaster_id
from data import chat_users
from __main__ import socketio

@socketio.on('join')
def on_join(data):
    join_room(data["stream_id"])

# Chat message handler
@socketio.on('message')
def handle_message(data):
    stream = get_stream_by_id(data["stream_id"])

    if request.sid == stream["broadcasterId"]:
            new_message = {
                "sender": stream["channelName"],
                "text": data["text"],
                "sender_color": "#9147ff",
                "stream_id": data["stream_id"],
                "isFromStreamer": True
            }
    else:
        if not request.sid in chat_users:
            chat_users[request.sid] = generate_chat_user_number(chat_users)

        display_id = chat_users[request.sid]

        new_message = {
            "sender": f"Anonymus {display_id}",
            "text": data["text"],
            "sender_color": get_user_color(display_id),
            "stream_id": data["stream_id"]
        }

    stream["messages"].append(new_message)
    emit("new message", new_message, to=data["stream_id"])

# Websocket stream implementation

# @socketio.on("chunkOfStream")
# def handle_chunk_of_stream(chunk):
#     emit("chunkOfStream", chunk, broadcast=True)

# End of websocket stream implementation

# WebRTC stream implementation (depends on join room from chat part)

def handle_end_stream(stream):
    stream["broadcasterId"] = None
    stream["isLive"] = False
    stream["viewers"] = 0

    emit("endStream", stream["id"], broadcast=True)

@socketio.on("broadcaster")
def connect_broadcaster(stream_id):
    stream = get_stream_by_id(stream_id)

    stream["isLive"] = True
    stream["broadcasterId"] = request.sid
    emit("broadcaster", stream_id, broadcast=True)

@socketio.on("watcher")
def connect_watcher(stream_id):
    stream = get_stream_by_id(stream_id)

    if stream["broadcasterId"]:
        emit("watcher", request.sid, to=stream["broadcasterId"])

@socketio.on("disconnect")
def disconnect():
    broadcaster_ids = get_broadcaster_id_list()
    # Broadcaster is disconnected
    if request.sid in broadcaster_ids:
        stream = get_stream_by_broadcaster_id(request.sid)
        handle_end_stream(stream)
    # Peer is disconnected
    else:
        # Emit disconnectPeer to all broadcasters as we don't know streamId that he was connected to
        for id in broadcaster_ids:
            emit("disconnectPeer", request.sid, to=id)
        

@socketio.on("offer")
def offer(id, message):
    emit("offer", (request.sid, message), to=id)

@socketio.on("answer")
def answer(id, message):
    emit("answer", (request.sid, message), to=id)

@socketio.on("candidate")
def candidate(id, message):
    emit("candidate", (request.sid, message), to=id)

@socketio.on("endStream")
def end_stream(stream_id):
    stream = get_stream_by_id(stream_id)
    handle_end_stream(stream)

# We use the special event emited by broadcaster for view count
# Because we don't always know what stream the peer disconnected from
# But broadcaster always has the correct peer connection count
@socketio.on("viewCount")
def set_view_count(stream_id, view_count):
    stream = get_stream_by_id(stream_id)
    stream["viewers"] = view_count

    emit("viewCount", (stream_id, view_count), broadcast=True)

# End of webRTC stream implementation