const express = require('express');
const { Server } = require('socket.io');
const http = require("http");
const { join } = require('node:path');
const cors = require("cors");
const app = express();
app.use(cors());
const server = http.createServer(app);

lobbies = new Map();
connectedSockets = new Map();

const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
});

 io.on('connection', socket =>{
    console.log('hello ' + socket.id)
    socket.on("message", arg =>{
        console.log('server recieved emit: ' + arg['roomId'] + " " + arg['message'])
        console.log("clients connected to " + arg['roomId'])
        for(const key of lobbies.get(arg['roomId']).keys()){
            console.log(key)
        }
        socket.to(arg["roomId"]).emit('player-message')
    })
    socket.on('create-lobby', (arg) =>{
        console.log("trying to create lobby..." + arg['roomId'])
        socket.join(arg['roomId']); // omg omg omg omg was ('roomId')
        lobbies.set(arg['roomId'], new Map().set(socket.id, socket))
        console.log(lobbies)
    })

    socket.on('join-lobby', (arg)=>{
        console.log("attempting to join lobby: " + arg['roomId'])
        if(lobbies.has(arg['roomId'])){
            socket.join(arg['roomId'])
            lobbies.get(arg['roomId']).set(socket.id, socket)
            console.log(lobbies)
            socket.emit('join-success')
            io.to(arg["roomId"]).emit("player-joined", {roomId: arg['roomId']})
        }
        else{
            socket.emit("failed-to-join")
        }
    })

    socket.on('disconnect', (arg) =>{
        console.log('socket disconnected')
        lobbies.clear()
    })


})

// io.on('create-lobby', socket =>{
//     console.log("creating lobby..." + socket.id)
//     const room = new Room({ io: classicMode, socket, username, roomId, password, action });
// })

app.get("/api", (req, res) =>{
    res.json({fruits: [
        'apple',
        'orange'
    ]})
});

server.listen(3001, () => {
      console.log('server listening on port 3001')
})
