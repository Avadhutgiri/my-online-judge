// socketService.js
let ioInstance = null;

function initSocket(server, options = {}) {
    const { Server } = require("socket.io");
    const io = new Server(server, options);

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('subscribe', (submissionId) => {
            const roomId = String(submissionId);
            socket.join(roomId);
            console.log(`Client ${socket.id} joined room ${roomId}`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    ioInstance = io;
    return io;
}

function getIO() {
    if (!ioInstance) {
        throw new Error("Socket.io not initialized. Call initSocket(server) first.");
    }
    return ioInstance;
}

module.exports = { initSocket, getIO }; 