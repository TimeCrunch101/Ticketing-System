const app = require('express')();
const httpServer = require('http').createServer(app);
const options = {
    cors: {
        origin: '*'
    }
};
const io = require('socket.io')(httpServer, options);

io.on('connection', socket => {
    console.log('Socket link established')
})

const startSocketServer = () => {
    httpServer.listen(8081, () => {
        console.log('Socket.io Server Running on https://socket.cincitechlabs.com/')
    })
}

let emitMessage = (data) => {
    console.log(data)
    io.emit('server-msg', `${data}`)
}

module.exports = {
    startSocketServer: startSocketServer,
    emitMessage: emitMessage
}