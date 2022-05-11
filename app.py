from unicodedata import name
from flask import Flask, render_template, jsonify
from data import stream_list, followed_channels, recommended_channels
import time

app = Flask(__name__)

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