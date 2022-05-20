# Video streaming platform

## Short description
This is an app for streaming webcam video to multiple viewers. Viewers can communicate with streamer in chat. There are 7 rooms for streaming, you can find them on sidebar (with live status and viewers count) and on the main page
## Routes
1. **"/"** - Index route, shows the main page with list of streams
2. **"/stream/<stream_id>"** - Stream page that shows the stream if it's live and a message if it is not live. Stream chat is accessible from here
3. **"/start-streaming/<stream_id>"** - Start streaming page that allows you to start streaming on the specified channel or returns a list of available channels if this one is already live. Stream chat is accessible from here

## How it works?
The app is multi page, with Flask on backend and js without frameworks on client side.  
Streaming works on WebRTC and uses python server for signaling via websockets  
Chat messages are also sent through websockets and saved on server

## How to run?
pip install -r requirements.txt  
python app.py

## How it looks?
Main page:
![Alt text](/readmeAssets/main.png "Main Page")
How streamer sees the stream:
![Alt text](/readmeAssets/startStream.png "Broadcast stream")
How watcher sees the stream:
![Alt text](/readmeAssets/watchStream.png "Watch stream")

## What can go wrong?
The app will let you stream on http (not secure) in your local network only if you set chrome://flags/#unsafely-treat-insecure-origin-as-secure to treat requests to your origin (example: http://192.168.18.87:9000) as secure  
But you can **watch** streams without that or just use localhost (uncomment last line in app.py)