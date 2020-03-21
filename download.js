var WebTorrent = require('webtorrent-hybrid');
var prettyBytes = require('pretty-bytes');
var clips = require('./clipboard.js');


var client = new WebTorrent();
var clipswitch;

function download(magnetURI, cb, path,clip) {
    if(clip){
        clipswitch=true;
    }
    if (path == null) {
        client.add(magnetURI, callback);
    }
    else {
        client.add(magnetURI, {
            path: path
        }, callback);
    }

    
    function callback(torrent) {
        if(clipswitch){
            cb({status:"Copied to clipboard",no:0});
            torrent.files[0].getBuffer((err,buf)=>{
                clips.copy(buf.toString('utf-8'));
                cb({status:"Copied to clipboard",no:100});
            });
            clipswitch=false;
            return ;

        }
        cb({status:"Incoming !!",no:0});

    
        function updateSpeed() {
            var progress = 100 * torrent.progress;
            var update = {
                status: `Peers : ${torrent.wires.length} Download : ${prettyBytes(client.downloadSpeed)} Upload : ${prettyBytes(client.uploadSpeed)}`,
                no: progress,
                peers: torrent.wires.length,
                progress: progress,
                downloadSpeed: prettyBytes(client.downloadSpeed),
                uploadSpeed: prettyBytes(client.uploadSpeed)
            }
            cb(update);
        }
        torrent.on('download', updateSpeed)
        torrent.on('upload', updateSpeed)
        updateSpeed();
    };
};


module.exports = download