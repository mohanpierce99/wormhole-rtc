


const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const generate = require("./randomdb.js")(true);

var server = require("http").Server(app);
let io = require("socket.io")(server);
const { uuid } = require('uuidv4');

app.use(cors());

app.get("/",(req,res)=>{
   fs.createReadStream("./view/lk.html").pipe(res);
})
let dict = {};
io.on("connection", (socket) => {
    console.log("new socket");
    var client_ip_address = socket.request.connection.remoteAddress;
    console.log("======================");
    console.log(`New connection from  ${client_ip_address}`);

    socket.on("createRoom", () => {
        let room = joiningProtocol();
        dict[room] = uuid();
        socket.master = true;
        socket.room=dict[room];
        socket.join(dict[room]);
        socket.emit("joinedRoom", room);
    });

    socket.on("req-connect", (query) => {
        if (query.split("-").length !== 3) {
            socket.emit("insufficient-word-length", true);
        }
        let oquery = query.slice(0, query.lastIndexOf("-"));
        if (dict[oquery] !== undefined) {
            io.sockets.adapter.rooms[dict[oquery]][0].emit("verify", query.slice(query.lastIndexOf("-") + 1), (res,torrent) => {
                if (res) {
                    socket.room=dict[oquery];
                    socket.join(dict[oquery]);
                    socket.emit("torrent-found",torrent);
                } else {
                    socket.emit("wrong-query", query);
                    let newroom=joiningProtocol();
                    io.sockets.adapter.rooms[dict[oquery]][0].emit("door-change",newroom);
                    delete Object.assign(dict, {[newroom]: dict[oquery] })[oquery];
                }
            });
        } else {
            socket.emit("wrong-query", query);
        }
    });


    socket.on("disconnect", () => {
       let room = socket.room;
       console.log("leaving "+room);
        socket.leave(room);
        if (socket.master) {
            delete dict[findDoor(dict,room)];
            if(io.sockets.adapter.rooms[room]!=undefined){
                io.sockets.adapter.rooms[room].forEach(function (s) {
                    s.leave(room);
                });
            }
         
        }
    });

});



function joiningProtocol() { //Recursively calls back untill it finds a room
    const door = generate(2);
    if (dict[door] !== undefined) {
        return joiningProtocol();
    }
    return door;
}

function findDoor(dict,room){
    for(door in dict){
        if(dict[door] == room){
            return door;
        }
    }
    return null;
}

server.listen(process.env.PORT || 4000);