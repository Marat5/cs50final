from flask import Flask, render_template, jsonify, request
from data import stream_list, followed_channels, recommended_channels, messages
from helpers import generate_chat_user_number, get_user_color
from flask_socketio import SocketIO, join_room
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Session id is key, displayed number is value
chat_users = {}

@app.route("/")
def index():
    return render_template("index.html", streams=stream_list, followed_channels=followed_channels, recommended_channels=recommended_channels)

@app.route("/api/v1/ping")
def ping():
    ping_response = {
        "isApiFine": True
    }
    
    time.sleep(1)
    return jsonify(ping_response)

@app.route("/check-api")
def checkApi():
    return render_template("check.html", followed_channels=followed_channels, recommended_channels=recommended_channels)

@app.route("/stream/<stream_id>")
def stream(stream_id):
    stream = next((item for item in stream_list if item["id"] == int(stream_id)), None)

    return render_template(
        "stream.html",
        followed_channels=followed_channels,
        recommended_channels=recommended_channels,
        stream=stream,
        messages=stream["messages"][::-1]
    )

@socketio.on('join')
def on_join(data):
    join_room(data["stream_id"])

@socketio.on('message')
def handle_message(data):
    if not request.sid in chat_users:
        chat_users[request.sid] = generate_chat_user_number(chat_users)

    display_id = chat_users[request.sid]
    new_message = {
        "sender": f"Anonymus {display_id}",
        "text": data["text"],
        "sender_color": get_user_color(display_id),
        "stream_id": data["stream_id"]
    }

    stream = next((item for item in stream_list if item["id"] == int(data["stream_id"])), None)

    stream["messages"].append(new_message)
    socketio.emit("new message", new_message, room=data["stream_id"])


if __name__ == '__main__':
    socketio.run(app, port=9000, host="192.168.18.87", debug=True)
    # socketio.run(app, debug=True)