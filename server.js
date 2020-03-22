const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const expressip = require('express-ip');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const generate = require("./randomdb.js")(true);
const server = require("http").Server(app);
const io = require("socket.io")(server);
const {add,del,search}=require('./linkedlist.js');
const { uuid } = require('uuidv4');

const masterNetwork={};
const secret_key = crypto.randomBytes(64).toString('hex');
let dict = {};


app.use(expressip().getIpInfoMiddleware);

app.use(cors());

app.get("/ipcheck",(req,res)=>{
    const ipInfo = req.ipInfo;
    let token = jwt.sign({'ipInfo': ipInfo.ip,'timestamp': + new Date()},secret_key);
    res.json(token);
});

io.on("connection", (socket) => {

    socket.on("init",(token)=>{
        token = jwt.verify(token,secret_key);

        if(token['timestamp'] + 1000*30 >= + new Date()){
            ip = token['ipInfo'];
            if (!(ip in masterNetwork)){
                masterNetwork[ip]={}
                masterNetwork[ip]["transceiver"]=null;
                masterNetwork[ip]["receiver"]=null;
            } 
            socket.cip=ip;
            socket.emit("ipset");
        }else{
            socket.emit("IPConfig failure",false);
        }
    });


    socket.on("search",()=>{
        dict=dict;
        add(masterNetwork[socket.cip],"receiver",socket);
        search(masterNetwork[socket.cip],(sock)=>{
            socket.emit("peerFound",[findDoor(dict,sock.room),sock.room]);
        },"transceiver");
    });


    socket.on("createRoom", () => {
        let room = joiningProtocol();
        dict[room] = uuid();
        socket.master = true;
        socket.room=dict[room];
        socket.join(dict[room]);
        search(masterNetwork[socket.cip],(sock)=>{
            if(sock.id==socket.id){
                return;
            }
            sock.emit("peerFound",[room,socket.room]);
        });
        del(masterNetwork[socket.cip],"receiver",socket);
        add(masterNetwork[socket.cip],"transceiver",socket);
        console.log("room created"+socket.id);
        socket.emit("joinedRoom", room);
    });

    socket.on("req-connect", (query) => {
        console.log("join request"+socket.id);
        if (query.split("-").length !== 3) {
            socket.emit("insufficient-word-length", true);
        }
        let oquery = query.slice(0, query.lastIndexOf("-"));
        if(!(oquery in dict)){
            socket.emit("wrong-query", oquery);
            return;
        }
        let mastersock=io.sockets.connected[Object.keys(io.sockets.adapter.rooms[dict[oquery]].sockets)[0]];
        if (dict[oquery] !== undefined) {
            mastersock.emit("verify", query.slice(query.lastIndexOf("-") + 1), (res,torrent) => {
                console.log("Reply from master"+socket.id);
                if (res) {
                    socket.room=dict[oquery];
                    socket.join(dict[oquery]);
                    console.log("torrent found !!!",torrent);
                    socket.emit("torrent-found",torrent);
                } else {
                    socket.emit("wrong-query", query);
                    let newroom=joiningProtocol();
                    mastersock.emit("door-change",newroom);
                    delete Object.assign(dict, {[newroom]: dict[oquery] })[oquery];
                }
            });
        } else {
            socket.emit("wrong-query", query);
        }
    });

    socket.on('localnetjoin',(roomkey)=>{
        console.log("Localnetwork join",socket.id);
        if(findDoor(dict,roomkey)){
            let mastersock=io.sockets.connected[Object.keys(io.sockets.adapter.rooms[roomkey].sockets)[0]];
            mastersock.emit("directJoin",(torrent)=>{
                socket.room=roomkey;
                socket.join(roomkey);
                console.log("almost emitted",socket.id);
                socket.emit("torrent-found",torrent);            
            })
        }

    })




    socket.on("disconnect", () => {
        console.log("leaving"+socket)

        if (socket.master) {
            var room = socket.room;
            socket.master=false;

            search(masterNetwork[socket.cip],(sock)=>{
                if(sock.id==socket.id){
                    return;
                }
                sock.emit("peerDelete",findDoor(dict,room));
            });
            del(masterNetwork[socket.cip],"transceiver",socket);
            delete dict[findDoor(dict,room)];
            if(io.sockets.adapter.rooms[room]!=undefined){
                var clients_in_the_room = io.sockets.adapter.rooms[room].sockets; 
                for (var clientId in clients_in_the_room ) {
                  var client_socket = io.sockets.connected[clientId];
                  client_socket.leave(room);
            }
        }
    }else{
            del(masterNetwork[socket.cip],"receiver",socket);
        }
    });

});



function joiningProtocol() {
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