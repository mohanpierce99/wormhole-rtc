#!/usr/bin/env node

var inquirer = require('inquirer');
var path = require('path');
var fs = require('fs');
const program = require('commander');
const seed = require('./seed.js');
const cliProgress = require('cli-progress');
const color = require('colors');
var Spinner = require('cli-spinner').Spinner;
const sockclient=require('./socketClient.js');
const generate = require("./randomdb.js")(false);


var art = require('ascii-art');

program
  .command('send <file/dir>')
  .action((data, args) => {
    console.log("\n")
    var spinner = new Spinner(art.style('           Creating => Einstein–Rosen bridge %s       ', 'green+bold'));
    spinner.setSpinnerString(15);
    spinner.start();
    setTimeout(() => {
      spinner.stop();
      console.log("\n");
      sendDecision(data)
    }, 1000)
  }).description('Send a file / directory');


program
  .command('receive <file/dir>')
  .action((data, args) => {
    console.log(data);
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
            art.font('wormhole', 'Doom', function (rendered, a) {
              console.log("\n\n");
              console.log(art.style("*******************************************************", 'cyan+bold'));
              console.log(art.style(a, 'cyan+bold'));
              console.log(art.style("*******************************************************", 'cyan+bold'));
              var bar1 = new cliProgress.SingleBar({
                format: 'Progress'.green + ' |' + ' {bar} '.cyan + '| ' + '{percentage}% '.green + ' Status: {status}'.grey
              }, cliProgress.Presets.shades_classic);
              seed(dir, bar1).then(postTorrent);
            });

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
                art.font('wormhole', 'Doom', function (rendered, a) {
                  console.log(art.style('\n\n', 'cyan+bold'));
                  console.log(art.style("*********************************************************", 'cyan+bold'))
                  console.log(art.style(a, 'cyan+bold'));
                  console.log(art.style("*********************************************************", 'cyan+bold'))
                  var bar1 = new cliProgress.SingleBar({
                    format: ' Manipulating space time Please wait .. '.green + ' |' + ' {bar} '.cyan + '| ' + '{percentage}% '.green + ' Status: {status}'.grey
                  }, cliProgress.Presets.shades_classic);
                  seed(listoffiles, bar1).then(postTorrent);
                });
              })
          }
        });
    });
  } else {
    art.font('wormhole', 'Doom', function (rendered, a) {
      console.log(art.style('\n\n', 'cyan+bold'));
      console.log(art.style("*********************************************************", 'cyan+bold').trap)
      console.log(art.style(a, 'cyan+bold'));
      console.log(art.style("*********************************************************", 'cyan+bold').trap)
      console.log("\n")
      var bar1 = new cliProgress.SingleBar({
        format: ' Manipulating space time Please wait .. '.green + ' |' + ' {bar} '.cyan + '| ' + '{percentage}% '.green + ' Status: {status}'.grey
      }, cliProgress.Presets.shades_classic);
      seed(path.resolve(data), bar1).then(postTorrent);
    });
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


function  postTorrent(magnetUri){
     var pipe=sockclient();
     pipe.on('connect',()=>{
        pipe.emit("createRoom");
     });
     pipe.on("joinedRoom",(room)=>{
       console.log("\n");
       console.log("-----------------------------------------------------------------".cyan)
       console.log("\n");
       console.log("Your portal code : ".cyan+ color.bold.green(room+"-"+generate(1)));
       console.log("\n")
       console.log("-----------------------------------------------------------------".cyan)
     });

}