from flask import Flask, render_template, jsonify, abort, request
from data import stream_list, streams_from_followed_channels, recommended_streams, ping_words
from helpers import get_stream_by_id
from flask_socketio import SocketIO
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app)
import socket_event_handlers

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


if __name__ == '__main__':
    socketio.run(app, port=9000, host="192.168.18.87", debug=True)
    # socketio.run(app, debug=True)