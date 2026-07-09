let socket;

const currentOrigin = window.location.origin;

const SERVERS = currentOrigin.includes("3001")
    ? ["http://localhost:3001", "http://localhost:3000"]
    : ["http://localhost:3000", "http://localhost:3001"];

let currentServer = 0;

const connectBtn = document.getElementById("connectBtn");
const sendBtn = document.getElementById("sendBtn");

const username = document.getElementById("username");
const role = document.getElementById("role");
const messageInput = document.getElementById("messageInput");

const messages = document.getElementById("messages");
const users = document.getElementById("users");

const serverName = document.getElementById("serverName");
const status = document.getElementById("status");

function connectToServer(index) {

    socket = io(SERVERS[index], {
        reconnection: false
    });

    socket.on("connect", () => {

        status.textContent = "Connected";
        status.style.color = "green";
        connectBtn.disabled = true;
        username.disabled = true;
        role.disabled = true;

        socket.emit("join", {
            username: username.value,
            role: role.value
        });

    });

    socket.on("serverName", (server) => {
        serverName.textContent = server;
    });

    socket.on("message", (data) => {

        const div = document.createElement("div");
        div.className = "message";

        const time = new Date(data.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        div.innerHTML = `
            <div class="headerText">
                ${data.username} (${data.role})
            </div>

            <div>
                ${data.message}
            </div>

            <div class="time">
                ${time}
            </div>
        `;

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;

    });

    socket.on("userList", (list) => {

        users.innerHTML = "";

        list.forEach(user => {

            const li = document.createElement("li");

            li.textContent = `${user.username} (${user.role})`;

            users.appendChild(li);

        });

    });

    socket.on("disconnect", () => {

        status.textContent = "Reconnecting...";
        status.style.color = "orange";

        currentServer = currentServer === 0 ? 1 : 0;

        setTimeout(() => {

            connectToServer(currentServer);

        }, 1000);

    });

}

connectBtn.onclick = () => {

    if (username.value.trim() === "") {

        alert("Please enter a username.");

        return;

    }

    connectToServer(currentServer);

};

sendBtn.onclick = () => {

    if (messageInput.value.trim() === "")
        return;

    socket.emit("message", {

        username: username.value,

        role: role.value,

        message: messageInput.value

    });

    messageInput.value = "";

};

messageInput.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {
        sendBtn.click();
    }

});