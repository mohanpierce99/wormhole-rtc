#!/usr/bin/env node

const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const program = require('commander');
const {send,receive,search,joinLocal}=require('./brain.js');
const color = require('colors');
const utils = require("./cli-util.js");
var clear = require('clear');
const clip = require('./clipboard.js');
const center = require('center-align');
require('on-change-network')(function () {
  process.exit();
})

const{updateProgress,printProgress}=utils;

var whchoice=[];
var a = null;
var amap={};
utils.drawIntro();
utils.hideCursor();

program
  .command('send [file/dir]')
  .option('-c, --clip')
  .action((data, args) => {
    if(args.clip){
      let text = clip.paste();
      var buff = new Buffer.from(text);
      buff.name = 'clip';
      send(buff, updateProgress.bind(this, printProgress("Manipulating space time Please wait ..."))).then((payload)=>{
              console.log("\n");
              console.log(center('Client is seeding and clipboard is ready to be copied by other localhosts'.bold.green,process.stdout.columns));
              console.log("\n");
              console.log(center("-----------------------------------------------------------------".cyan,process.stdout.columns));
              console.log("\n");
              console.log(center("                 Your portal code : ".bold.cyan + color.bold.green(payload.wormhole.slice(0,payload.wormhole.lastIndexOf("-"))),process.stdout.columns));
              console.log("\n");
              console.log(center("-----------------------------------------------------------------".cyan,process.stdout.columns));
      });
    }else{
      console.log("\n");
      let spinner=utils.createSpinner();
      spinner.start();
      setTimeout(() => {
        spinner.stop();
        console.log("\n");
        sendDecision(data)
      }, 1000)
    }
    
  }).description('Send a file / directory');


program
  .command('receive [words]')
  .option('-p, --path <dirpath>')
  .option('-c, --clip')
  .option('-l, --localscan')
  .action((data, args) => {
    if(args.localscan){
      let p = (args.path)?path.resolve(args.path):null;
      search(createPrompt,updateProgress.bind(this, printProgress("Downloading Please wait ...")),false,p);
    }else{
      if(args.clip){
        createPrompt('initial');
        search(createPrompt,updateProgress.bind(this, printProgress("Downloading Please wait ...")),true);
      }else if(args.path){
        receive(data,path.resolve(args.path),updateProgress.bind(this, printProgress("Downloading Please wait ...")));
      }else{
        receive(data,path.resolve("./"),updateProgress.bind(this, printProgress("Downloading Please wait ...")));
      }
    }
  }).description('Receive a file / directory');

program.parse(process.argv);

function createPrompt(decision, hole){

  if(a != null){
    a.ui.close();
    clear();
  }else{
    clear();
    whchoice.push(new inquirer.Separator('Which portal will it be?'));
  }

  if(decision == 'add'){
    whchoice.push(hole[0]);
    amap[hole[0]] = hole[1];
  }else if(decision == 'remove'){
    whchoice = whchoice.filter(item => item !== hole);
    delete amap[hole];
  }

  a = inquirer.prompt([{
    type: 'list',
    message: 'Select wormhole',
    name: 'selectWormhole',
    choices: whchoice,
    validate: function (answer) {
      if (answer.length < 1) {
        return 'You must choose at least one option.';
      }
      return true;
    }
  }]);
  a.then((answer)=>{
      let data = answer['selectWormhole'];
      joinLocal(amap[data]);
  });
}

function sendDecision(data) {
  var isDirectory = utils.is_dir(data);
  if (isDirectory){
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
            send(dir, updateProgress.bind(this, printProgress("Manipulating space time Please wait ..."))).then((payload)=>{
              console.log("\n");
              console.log(center("-----------------------------------------------------------------".cyan,process.stdout.columns));
              console.log("\n");
              console.log(center("                     Your portal code : ".bold.cyan + color.bold.green(payload.wormhole),process.stdout.columns));
              console.log("\n");
              console.log(center("-----------------------------------------------------------------".cyan,process.stdout.columns));
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
                send(listoffiles, updateProgress.bind(this, printProgress("Manipulating space time Please wait ..."))).then((payload)=>{
                  console.log("\n");
                  console.log(center("-----------------------------------------------------------------".cyan,process.stdout.columns));
                  console.log("\n");
                  console.log(center("                     Your portal code : ".bold.cyan + color.bold.green(payload.wormhole),process.stdout.columns));
                  console.log("\n");
                  console.log(center("-----------------------------------------------------------------".cyan,process.stdout.columns));
                });
              })
          }
        });
    });
  } else {
    send(path.resolve(data), updateProgress.bind(this, printProgress("Manipulating space time Please wait ..."))).then((payload)=>{
      console.log("\n");
      console.log(center("-----------------------------------------------------------------".cyan,process.stdout.columns));
      console.log("\n");
      console.log(center("                    Your portal code : ".bold.cyan + color.bold.green(payload.wormhole),process.stdout.columns));
      console.log("\n");
      console.log(center("-----------------------------------------------------------------".cyan,process.stdout.columns));
  });
}
}