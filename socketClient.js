var io = require('socket.io-client');

const socketpipe=()=>{return io.connect('http://09363ae6.ngrok.io/', {reconnect: true});}

module.exports=socketpipe;

