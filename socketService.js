let ioInstance = null;

function initSocket(server){
    const { Server } = require('socket.io');
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log(`A New Client connected: ${socket.id}`);

        socket.on('subscribe', (submissionId)=>{
            console.log(`Client ${socket.id} subscribed to submission: ${submissionId}`);
            socket.join(submissionId);

        })

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    ioInstance = io;
    return io;
}

function getIO(){
    if(!ioInstance){
        throw new Error('Socket.io not initialized');
    }
    return ioInstance;
}

module.exports = { initSocket, getIO };