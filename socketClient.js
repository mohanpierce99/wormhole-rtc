var io = require('socket.io-client');

const socketpipe=()=>{return io.connect('https://radiant-stream-49856.herokuapp.com/', {reconnect: true});}

module.exports=socketpipe;

