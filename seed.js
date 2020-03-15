var WebTorrent = require('webtorrent-hybrid')
var client = new WebTorrent();
const color = require('colors');



function seed(filepath, bar1) {
  if(bar1){
    bar1.start(200, 0, {
      status: 'Created and bootstrapped !'
    });
  }


  // update the current value in your application..

  // stop the progress bar
  return new Promise((res, rej) => {
    var torrent = client.seed(filepath, {
      announce: ['http://localhost:8000/announce',
        'udp://0.0.0.0:8000',
        'udp://localhost:8000', 'ws://localhost:8000'
      ]
    }, function (torrent) {
      bar1.update(200, {
        status: "Wrapping up!"
      });
      bar1.stop();
      console.log("\n");
      console.log('Client is seeding \n \n' + torrent.magnetURI.green);
      res(torrent.magnetURI);
    });

    torrent.on('infoHash', function () {
      setTimeout(() => {
        bar1.update(50, {
          status: "Info Hash Created"
        });
      }, 1000)
    });
    torrent.on('metadata', function () {
      setTimeout(() => {
        bar1.update(100, {
          status: "Torrent cooked!"
        });
      }, 1000);
    })

    torrent.on('ready', function () {
      setTimeout(() => {
        bar1.update(150);
      }, 1000)
      torrent.on('done', function () {
        setTimeout(() => {
          bar1.update(190);
        }, 2000)
      })
      torrent.on('download', function () {})
      torrent.on('wire', function () {
        
      });
    })
  });
}


module.exports = seed;