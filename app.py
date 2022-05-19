from flask import Flask, render_template, jsonify, abort, request
from data import stream_list, streams_from_followed_channels, recommended_streams
from helpers import generate_chat_user_number, get_user_color, get_stream_by_id, get_broadcaster_id_list, get_stream_by_broadcaster_id
from flask_socketio import SocketIO, join_room, emit
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Session id is key, displayed number is value
chat_users = {}
ping_words = ["Async", "generator", "is", "fetching", "paginated", "data"]

@app.route("/")
def index():
    return render_template(
            "main-page.html",
            streams=stream_list,
            streams_from_followed_channels=streams_from_followed_channels,
            recommended_streams=recommended_streams
        )

@app.route("/api/v1/ping")
def ping():
    page = request.args.get('page', 1, type=int)
    if page > len(ping_words):
        abort(404)
    
    displayWord = ping_words[page - 1]
    
    if len(ping_words) == page:
        next = None
    else:
        next = page + 1

    ping_response = {
        "isApiFine": True,
        "displayWord": displayWord,
        "next": next
    }
    
    time.sleep(0.4)
    return jsonify(ping_response)

@app.route("/check-api")
def checkApi():    
    return render_template("check.html", streams_from_followed_channels=streams_from_followed_channels, recommended_streams=recommended_streams)

@app.route("/stream/<stream_id>")
def stream(stream_id):
    stream = get_stream_by_id(stream_id)

    return render_template(
        "watch-stream.html",
        streams_from_followed_channels=streams_from_followed_channels,
        recommended_streams=recommended_streams,
        stream=stream,
        messages=stream["messages"][::-1]
    )

@app.route("/start-streaming/<stream_id>")
def start_streaming(stream_id):
    stream = get_stream_by_id(stream_id)

    return render_template(
        "start-streaming.html",
        streams=stream_list,
        streams_from_followed_channels=streams_from_followed_channels,
        recommended_streams=recommended_streams,
        messages=stream["messages"][::-1],
        is_live=stream["isLive"],
        channel_name=stream["channelName"]
    )

@socketio.on('join')
def on_join(data):
    join_room(data["stream_id"])

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

# Used for websocket stream implementation

# @socketio.on("chunkOfStream")
# def handle_chunk_of_stream(chunk):
#     emit("chunkOfStream", chunk, broadcast=True)

# End of websocket stream implementation

# Used for webRTC stream implementation (depends on join room from chat part)

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


if __name__ == '__main__':
    socketio.run(app, port=9000, host="192.168.18.87", debug=True)
    # socketio.run(app, debug=True)