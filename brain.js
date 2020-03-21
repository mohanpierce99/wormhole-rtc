const seed = require('./seed.js');
const download = require('./download.js');
const generateR = require("./randomdb.js")(false);
const sockclient = require('./socketClient.js');
var axios = require('axios');
let thirdword, pipe, magnetUri, path, prompt;

function send(...args) {
    return seed(...args).then(postTorrent);
}

function receive(...args) {
    postReceive(...args);
}

function search(create,progress,clip,p) {
    path = null;
    if(p){
        path=p;
    }
    prompt = create;
    createPipe(progress,clip); 
};


function postTorrent(magnet) {
    magnetUri = magnet;
    return new Promise((res, rej) => {
        createPipe().then(() => {
            res(createRoom(magnet));
        })

    });
}

function postReceive(words, p, callback) {
    path = p;
    createPipe(callback).then(() => {
        downloadRoom(words);
    });
} 

function pipeInit(pipe, callback,clip) {
    return new Promise((res, rej) => {

        pipe.on('connect', () => {

            axios.get('https://radiant-stream-49856.herokuapp.com/ipcheck').then((response) => {
                pipe.emit("init", response.data);
            });

            pipe.on('insufficient-word-length', () => {
                console.log("Wrong Query Length!");
            });
            pipe.on('wrong-query', () => {
                console.log("Wrong Query!");
            });
            pipe.on('torrent-found', (torrent) => {
                if(clip){
                    download(torrent, callback, path,clip);
                }else{
                    download(torrent, callback, path);
                }
            });

            pipe.on('ipset', () => {
                pipe.emit("search");
                res(pipe);
            });

            pipe.on('directJoin',(callback)=>{
                if(magnetUri){
                    callback(magnetUri);
                }
            });

            pipe.on("peerFound", (arr) => {
                if (prompt) {
                    prompt("add", arr);
                }
            });
            
            pipe.on("peerDelete", (arr) => {
                if (prompt) {
                    prompt("remove", arr);
                }
            }) 

            pipe.on('verify', (query, cb) => {
                console.log(query.trim(),thirdword.trim())
                if (query.trim() === thirdword.trim()) {
                    cb(true, magnetUri);
                } else {
                    cb(false);
                }
            });



        });

    });


}

function downloadRoom(words) {

    pipe.emit("req-connect", words);

}

function createRoom(torrent) {
    return new Promise((res, rej) => {
        pipe.emit("createRoom");
        pipe.off('joinedRoom');
        pipe.off('doorchange');
        pipe.on("joinedRoom", (room) => {
            generate();
            res({
                wormhole: room + "-" + thirdword,
                torrent
            });
        });

        pipe.on("door-change", (d) => {
            generate();
        });

    })

}


function joinLocal(key){
    pipe.emit('localnetjoin',key);
}

function createPipe(callback,clip) {
    return new Promise((res, rej) => {
        if (!pipe) {
            if (callback == null) {
                callback = () => {
                    console.log(arguments);
                }
            }
            pipeInit(sockclient(), callback,clip).then((x) => {
                pipe = x;
                res(true);
            })
            return;
        }
        res(pipe);

    });

}

function generate() {
    thirdword = generateR(1);
    return thirdword;
}


module.exports = {
    send,
    receive,
    search,
    joinLocal
}
