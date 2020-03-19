var io = require('socket.io-client');

const socketpipe=()=>{return io.connect('http://localhost:4000/', {reconnect: true});}

module.exports=socketpipe;

