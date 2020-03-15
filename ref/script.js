var WebTorrent = require('webtorrent-hybrid')

var client = new WebTorrent()

var torrentId='magnet:?xt=urn:btih:f1e07feeaf81d8784cb053d995d0d5cf78648ac0&dn=004-conditionals.mp4&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce&tr=udp%3A%2F%2F0.0.0.0%3A8000&tr=udp%3A%2F%2Flocalhost%3A8000&tr=ws%3A%2F%2Flocalhost%3A8000&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

client.add(torrentId, function (torrent) {
	console.log(torrent);
  // Torrents can contain many files. Let's use the .mp4 file
  var file = torrent.files.find(function (file) {
    return file.name.endsWith('.mp4')
  })

  // Display the file by adding it to the DOM. Supports video, audio, image, etc. files
  file.appendTo('body')
})
