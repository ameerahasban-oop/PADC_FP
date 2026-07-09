const { createClient } = require("redis");

const pubClient = createClient({
    url: "redis://localhost:6379"
});

const subClient = pubClient.duplicate();

async function connectRedis() {
    await pubClient.connect();
    await subClient.connect();
    console.log("Redis Connected");
}

const USERS_KEY = "connectedUsers";

async function getUsers() {
    const data = await pubClient.get(USERS_KEY);
    return data ? JSON.parse(data) : [];
}

async function saveUsers(users) {
    await pubClient.set(USERS_KEY, JSON.stringify(users));
}

module.exports = {
    pubClient,
    subClient,
    connectRedis,
    getUsers,
    saveUsers
};