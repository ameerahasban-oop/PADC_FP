const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const {
    pubClient,
    subClient,
    connectRedis,
    getUsers,
    saveUsers
} = require("./redis");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "../client")));

const PORT = 3001;
const SERVER_NAME = "Server 2";


async function startServer() {

    await connectRedis();

    await subClient.subscribe("notifications", (message) => {
        io.emit("message", JSON.parse(message));
    });

    await subClient.subscribe("usersUpdated", async () => {
    await broadcastUsers();
    });

    io.on("connection", (socket) => {

        console.log("Client connected to Server 2");

        socket.emit("serverName", SERVER_NAME);

        socket.on("join", async (user) => {

    let users = await getUsers();

users = users.filter(u => u.username !== user.username);

user.id = socket.id;
user.server = SERVER_NAME;

users.push(user);

await saveUsers(users);

    await pubClient.publish("usersUpdated", "refresh");

    });

        socket.on("message", async (data) => {

            data.server = SERVER_NAME;
            data.time = new Date().toLocaleString();

            await pubClient.publish(
                "notifications",
                JSON.stringify(data)
            );

        });

        socket.on("disconnect", async () => {

    let users = await getUsers();

    users = users.filter(u => u.id !== socket.id);

    await saveUsers(users);

    await pubClient.publish("usersUpdated", "refresh");

    console.log("Disconnected");

});

    });

    server.listen(PORT, () => {
        console.log(`Server 2 running on http://localhost:${PORT}`);
    });

}

async function broadcastUsers() {
    const users = await getUsers();
    io.emit("userList", users);
}

startServer();