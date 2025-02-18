const express = require('express');
const { Server } = require('socket.io');
const http = require("http");
 const { join } = require('node:path');
 const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
});

io.on('connection', socket =>{
    console.log(socket.id);
})

app.get("/api", (req, res) =>{
    res.json({fruits: [
        'apple',
        'orange'
    ]})
});

server.listen(3001, () => {
      console.log('server listening on port 3001')
})