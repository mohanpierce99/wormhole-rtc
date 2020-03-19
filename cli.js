#!/usr/bin/env node

var inquirer = require('inquirer');
var path = require('path');
var fs = require('fs');
const program = require('commander');
const seed = require('./seed.js');
const download=require('./download.js')
const cliProgress = require('cli-progress');
const color = require('colors');
var Spinner = require('cli-spinner').Spinner;
const sockclient = require('./socketClient.js');
const generate = require("./randomdb.js")(false);
const CFonts = require('cfonts');
var third;
var magnetUri;

CFonts.say('wormhole', {
  font: 'block',
  align: 'center',
  colors: false,
  background: 'transparent',
  letterSpacing: 1,
  lineHeight: 1,
  space: true,
  maxLength: '0',
  gradient: ['red', 'green'],
  independentGradient: false,
  transitionGradient: false,
  env: 'node'
});


var art = require('ascii-art');

program
  .command('send <file/dir>')
  .action((data, args) => {
    console.log("\n")
    var spinner = new Spinner(art.style('                                     Creating => Einstein–Rosen bridge %s       ', 'green+bold'));
    spinner.setSpinnerString(15);
    spinner.start();
    setTimeout(() => {
      spinner.stop();
      console.log("\n");
      sendDecision(data)
    }, 1000)
  }).description('Send a file / directory');


program
  .command('receive <words>')
  .option('-p, --path <dirpath>')
  .action((data, args) => {
    if(args.path){
      postReceive(data,path.resolve(args.path));
    }else{
      postReceive(data,path.resolve("./"));
    }
  }).description('Receive a file / directory');

program.parse(process.argv);

function sendDecision(data) {
  var isDirectory = is_dir(data);
  if (isDirectory) {
    var dir = path.resolve(data);
    var choice = [new inquirer.Separator('= Choose Selective files =')];
    fs.readdir(dir, (err, files) => {
      files.forEach((file) => {
        fileopt = {
          name: file
        }
        choice.push(fileopt);
      })
      inquirer.prompt([{
          type: 'checkbox',
          message: 'Do you want to send all files?',
          name: 'wantAllFiles',
          choices: [new inquirer.Separator('Entire Directory?'),
            {
              name: 'yes'
            },
            {
              name: 'no'
            }
          ],
          validate: function (answer) {
            if (answer.length < 1) {
              return 'You must choose at least one option.';
            }
            return true;
          }
        }])
        .then(answer => {
          if (answer['wantAllFiles'].includes('yes')) {
            seed(dir, updateProgress.bind(this, printProgress("Manipulating space time Please wait ..."))).then(postTorrent);

          } else {
            inquirer
              .prompt([{
                type: 'checkbox',
                message: 'Select files',
                name: 'Requiredfiles',
                choices: choice,
                validate: function (answer) {
                  if (answer.length < 1) {
                    return 'You must choose at least one option.';
                  }
                  return true;
                }
              }])
              .then(answers => {
                var listoffiles = []
                answers['Requiredfiles'].forEach((chosenfile) => {
                  listoffiles.push(path.join(dir, chosenfile))
                });
                seed(listoffiles, updateProgress.bind(this, printProgress("Manipulating space time Please wait ..."))).then(postTorrent);
              })
          }
        });
    });
  } else {
    seed(path.resolve(data), updateProgress.bind(this, printProgress("Manipulating space time Please wait ..."))).then(postTorrent);
  }
}

function is_dir(path) {
  try {
    var stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

function printProgress(intro) {
  console.log("\n");
  var bar1 = new cliProgress.SingleBar({
    format: intro.bold.green + ' |' + ' {bar} '.cyan + '| ' + '{percentage}% '.bold.green + ' Status: {status}'.bold.grey
  }, cliProgress.Presets.shades_classic);
  return bar1;
}


function updateProgress(bar, obj) {
  setTimeout(() => {
    if (obj.no == 0) {
      bar.start(100, 0, {
        status: obj.status
      });
    }
    bar.update(obj.no, {
      status: obj.status
    });

    if (obj.no == 100) {
      bar.stop();
    }
  }, obj.timeout || 0);
}


function postReceive(words,path) {
  console.log(words,path);
  var pipe = sockclient();
  pipe.on('connect', () => {
    pipe.emit("req-connect",words);
    pipe.on('torrent-found',(torrent)=>{
      console.log(torrent);
      download(torrent,updateProgress.bind(this, printProgress("Downloading Please wait ...")),path);
    });

    pipe.on('insufficient-word-length',()=>{
      console.log("Wrong Query Length!");
    });
    pipe.on('wrong-query',()=>{
      console.log("Wrong Query!");
    });

  });

}


function postTorrent(magnetUri) {
  setTimeout(() => {
    console.log('Client is seeding \n \n' + magnetUri.bold.green);

  }, 2000);
  var pipe = sockclient();
  pipe.on('connect', () => {

    pipe.emit("createRoom",(a)=>{
console.log(a);
    });
  });

  pipe.on('verify',(query,cb)=>{
    console.log(query);
    console.log(third);
     if(query===third){
       cb(true,magnetUri);
     }else{
       cb(false);
     }
  })
  pipe.on("joinedRoom", (room) => {
    third = generate(1);
    console.log("\n");
    console.log("-----------------------------------------------------------------".cyan);
    console.log("\n");
    console.log("Your portal code : ".cyan + color.bold.green(room + "-" + third));
    console.log("\n");
    console.log("-----------------------------------------------------------------".cyan);
  });

}