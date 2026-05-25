const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket => {

    socket.on("join-room", data => {

        const room = data.room;
        const password = data.password;

        if (!rooms[room]) {

            rooms[room] = {
                password,
                users: []
            };

        } else {

            if (rooms[room].password !== password) {

                socket.emit(
                    "room-error",
                    "Şifre yanlış"
                );

                return;
            }
        }

        if (rooms[room].users.length >= 2) {

            socket.emit(
                "room-error",
                "Oda dolu"
            );

            return;
        }

        socket.join(room);

        rooms[room].users.push(socket.id);

        socket.room = room;

        socket.emit(
            "joined-room",
            rooms[room].users.length
        );

        socket.to(room).emit(
            "user-connected"
        );

    });

    socket.on("change-password", newPassword => {

        if (
            socket.room &&
            rooms[socket.room]
        ) {

            rooms[socket.room].password =
                newPassword;

            io.to(socket.room).emit(
                "password-changed"
            );
        }
    });

    socket.on("signal", data => {

        socket.to(data.room).emit(
            "signal",
            data.signal
        );

    });

    socket.on("chat-message", msg => {

        if (!socket.room) return;

        socket.to(socket.room).emit(
            "chat-message",
            msg
        );

    });

    socket.on("disconnect", () => {

        const room = socket.room;

        if (
            room &&
            rooms[room]
        ) {

            rooms[room].users =
                rooms[room].users.filter(
                    id => id !== socket.id
                );

            socket.to(room).emit(
                "user-disconnected"
            );

            if (
                rooms[room].users.length === 0
            ) {

                delete rooms[room];
            }
        }
    });

});

const PORT =
process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {

    console.log(
        "Sunucu çalışıyor: " + PORT
    );

});