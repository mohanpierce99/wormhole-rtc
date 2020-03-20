var fs = require('fs')
var text = require('./list')
var content;
function generate(n){
    let i=0,result=[];
    while(i<n){
        result.push(content[Math.floor(Math.random() * content.length)]);    
        i+=1;
    }
    return result.join("-");
}

module.exports = function(platform){
    if(platform){
        content = text.default
    }else{
        content = fs.readFileSync("./passlist.txt",'utf-8').split("\n");
    }
     return generate;
}




console.log(generate());