var dragDrop = require('drag-drop')
var WebTorrent = require('webtorrent-hybrid')

var client = new WebTorrent()
console.log("hello");
// When user drops files on the browser, create a new torrent and start seeding it!
console.log(dragDrop)
dragDrop('body', function (files) {
	console.log(files);
  client.seed(files,{announce:['http://localhost:8000/announce',
'udp://0.0.0.0:8000',
'udp://localhost:8000'
,'ws://localhost:8000']}, function (torrent) {
    console.log('Client is seeding ' + torrent.magnetURI)
  })
})
