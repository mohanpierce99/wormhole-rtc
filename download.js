var WebTorrent = require('webtorrent-hybrid');
var prettyBytes = require('pretty-bytes');


var client = new WebTorrent();


function download(magnetURI, cb, path) {
    if (path == null) {
        client.add(magnetURI, callback);
    } else {
        client.add(magnetURI, {
            path: path
        }, callback);
    }
    
    function callback(torrent) {
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
        torrent.swarm.on('download', updateSpeed)
        torrent.swarm.on('upload', updateSpeed)
        console.log(torrent.progress);
        updateSpeed();
    }
}


module.exports = download