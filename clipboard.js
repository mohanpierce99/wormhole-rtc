const clip = require('clipboardy');

function copy(text){
    clip.writeSync(text);
}

function paste(){
    return clip.readSync();
}

module.exports = {copy,paste}