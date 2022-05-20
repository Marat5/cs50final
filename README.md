# Video streaming platform
## Routes
1. **"/"** - Index route, shows the main page with list of streams
2. **"/stream/<stream_id>"** - Stream page that shows the stream if it's live and a message if it is not live. Stream chat is accessible from here
3. **"/start-streaming/<stream_id>"** - Start streaming page that allows you to start streaming on the specified channel or returns a list of available channels if this one is already live. Stream chat is accessible from here

## How it works?
The app is multi page, with Flask on backend and js without frameworks on client side.  
Streaming works on WebRTC and uses python server as a signaling server, sending signals through websockets  
Chat messages are sent through websockets and saved on server