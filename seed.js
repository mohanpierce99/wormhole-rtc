var WebTorrent = require('webtorrent-hybrid')
var client = new WebTorrent();



function seed(filepath, cb) {

  return new Promise((res, rej) => {
      cb({status:"Created and bootstrapped !",no:0});

    var torrent = client.seed(filepath, {
      announce: ['http://localhost:8000/announce',
        'udp://0.0.0.0:8000',
        'udp://localhost:8000', 'ws://localhost:8000'
      ]
    }, function (torrent) {
      cb({status:"Wrapping up!",no:100});
      console.log("\n");
      res(torrent.magnetURI);
    });

    torrent.on('infoHash', function () {
      cb({status:"Info Hash Created",no:25,timeout:1000});
    });

    torrent.on('metadata', function () {
      cb({status:"Torrent cooked!",no:50,timeout:1000}); 
    })

    torrent.on('ready', function () {
      cb({status:"Almost ready !",no:75,timeout:1000});

      torrent.on('done', function () {
        cb({status:"Done !",no:90,timeout:2000});
      })
      torrent.on('download', function () {})
      torrent.on('wire', function () {
        
      });
    })
  });
}


module.exports = seed;