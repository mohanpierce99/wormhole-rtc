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
const dict = {};


app.use(expressip().getIpInfoMiddleware);

app.use(cors());

app.get("/ipcheck",(req,res)=>{
    const ipInfo = req.ipInfo;
    let token = jwt.encode({'ipInfo': ipInfo,'timestamp': + new Date()},secret_key,algorithm='HS256').decode('utf-8');
    res.json(token);
});

app.get("/",(req,res)=>{
    var message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
        console.log(message);
   fs.createReadStream("./view/lk.html").pipe(res);
})

io.on("connection", (socket) => {
    console.log("new socket");

    socket.emit("lol",(ll)=>{
        console.log(ll);
    })
    socket.on("init",(token)=>{
        token = jwt.decode(JSON.parse(token),secret_key,algorithms=['HS256']);
        if(token['timestamp'] + 1000*30 <= + new Date()){
            ip = token['ipInfo'];
            if (!(ip in masterNetwork)){
                masterNetwork[ip]={}
                masterNetwork[ip]["transceiver"]=null;
                masterNetwork[ip]["receiver"]=null;
            } 
            socket.cip=ip;
        }else{
            socket.emit("IPConfig failure",false);
        }
    });


    socket.on("search",()=>{
        add(masterNetwork[socket.cip],"receiver",socket);
        search(masterNetwork[socket.cip],(sock)=>{
            socket.emit("peerFound",[findDoor(sock.room),sock.room]);
        },"transceiver");
    });


    socket.on("createRoom", (cb) => {

        let room = joiningProtocol();
        dict[room] = uuid();
        socket.master = true;
        socket.room=dict[room];
        socket.join(dict[room]);
        // search(masterNetwork[socket.cip],(sock)=>{
        //     if(sock.id==socket.id){
        //         return;
        //     }
        //     sock.emit("peerFound",[room,socket.room]);
        // });
        // del(masterNetwork[socket.cip],"receiver",socket);
        // add(masterNetwork[socket.cip],"transceiver",socket);
        cb("thankyou reply from server");
        socket.emit("joinedRoom", room);
    });

    socket.on("req-connect", (query) => {
        if (query.split("-").length !== 3) {
            socket.emit("insufficient-word-length", true);
        }
        let oquery = query.slice(0, query.lastIndexOf("-"));
        console.log("query in"+oquery+"\n");
        console.log(dict[oquery]);
        let mastersock=io.sockets.connected[Object.keys(io.sockets.adapter.rooms[dict[oquery]].sockets)[0]];
        if (dict[oquery] !== undefined) {
            mastersock.emit("verify", query.slice(query.lastIndexOf("-") + 1), (res,torrent) => {
                if (res) {
                    socket.room=dict[oquery];
                    socket.join(dict[oquery]);
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




    socket.on("disconnect", () => {

        if (socket.master) {
            var room = socket.room;
            socket.master=false;
            console.log("leaving "+room);
             socket.leave(room);

            // search(masterNetwork[socket.cip],(sock)=>{
            //     if(sock.id==socket.id){
            //         return;
            //     }
            //     sock.emit("peerDelete",findDoor(dict,room));
            // });
            // del(masterNetwork[socket.cip],"transceiver",socket);
            delete dict[findDoor(dict,room)];
            if(io.sockets.adapter.rooms[room]!=undefined){
                var clients_in_the_room = io.sockets.adapter.rooms[room].sockets; 
                for (var clientId in clients_in_the_room ) {
                  var client_socket = io.sockets.connected[clientId];
                  client_socket.leave(room);
            }
        }
    }else{
            // del(masterNetwork[socket.cip],"receiver",socket);
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