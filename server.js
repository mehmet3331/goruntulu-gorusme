const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server =
http.createServer(app);

const io =
new Server(server);

app.use(
express.static("public")
);

const rooms = {};

io.on(
"connection",
(socket)=>{

socket.on(
"join-room",
(data)=>{

const room =
data.room;

const password =
data.password;

if(!rooms[room]){

rooms[room] = {
password: password,
users: []
};

}

if(
rooms[room].password !== password
){

socket.emit(
"wrong-password"
);

return;
}

if(
rooms[room].users.length >= 2
){

socket.emit(
"room-full"
);

return;
}

socket.join(room);

socket.room = room;

rooms[room].users.push(
socket.id
);

socket.emit(
"joined"
);

if(
rooms[room].users.length === 2
){

io.to(room).emit(
"ready"
);

}

});

socket.on(
"signal",
(data)=>{

socket.to(
data.room
).emit(
"signal",
data.signal
);

});

socket.on(
"chat-message",
(msg)=>{

if(socket.room){

socket.to(
socket.room
).emit(
"chat-message",
msg
);

}

});

socket.on(
"disconnect",
()=>{

const room =
socket.room;

if(
room &&
rooms[room]
){

rooms[room].users =
rooms[room].users.filter(
id=>id!==socket.id
);

if(
rooms[room].users.length===0
){

delete rooms[room];

}

}

});

});

const PORT =
process.env.PORT || 3000;

server.listen(
PORT,
"0.0.0.0",
()=>{

console.log(
"Sunucu çalışıyor: "
+ PORT
);

}
);