var WebTorrent = require('webtorrent-hybrid')
var client = new WebTorrent();
// const color = require('colors');



function seed(filepath, cb) {

  // stop the progress bar
  return new Promise((res, rej) => {
      cb({status:"Created and bootstrapped !",no:0});
    bar1.start(200, 0, {
      status: ''
    });
    var torrent = client.seed(filepath, {
      announce: ['http://localhost:8000/announce',
        'udp://0.0.0.0:8000',
        'udp://localhost:8000', 'ws://localhost:8000'
      ]
    }, function (torrent) {
      cb({status:"Wrapping up!",no:200});
      console.log("\n");
      console.log('Client is seeding \n \n' + torrent.magnetURI.green);
      res(torrent.magnetURI);
    });

    torrent.on('infoHash', function () {
      cb({status:"Info Hash Created",no:50}); //timeout
    });

    torrent.on('metadata', function () {
      cb({status:"Torrent cooked!"}); //timeout
    })

    torrent.on('ready', function () {
      cb({status:"Almost ready !",no:150});

      torrent.on('done', function () {
        cb({status:"Almost ready !",no:190});
      })
      torrent.on('download', function () {})
      torrent.on('wire', function () {
        
      });
    })
  });
}


module.exports = seed;