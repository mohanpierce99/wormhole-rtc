
const CFonts = require('cfonts');
const cliCursor = require('cli-cursor');
const fs=require('fs');
var Spinner = require('./cli-spinner/index.js').Spinner;
const color = require('colors');
const cliProgress = require('cli-progress');
const axios = require('axios');
const tty = require('tty');
const center = require('center-align');

function drawIntro(){
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
}

function createSpinner(){
    var spinner = new Spinner('Creating => Einstein–Rosen bridge %s'.bold.green);
    spinner.setSpinnerString(15);
    return spinner;
}

function hideCursor(){
    cliCursor.hide();
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

  module.exports={updateProgress,printProgress,drawIntro,is_dir,hideCursor,createSpinner}

//  process.stdout.columns
