// var i = 0;  // dots counter
// setInterval(function() {
//   process.stdout.clearLine();  // clear current text
//   process.stdout.cursorTo(0);  // move cursor to beginning of line
//   i = (i + 1) % 4;
//   var dots = new Array(i + 1).join(".");
//   process.stdout.write("Waiting" + dots);  // write text
// }, 300);

// Yeah, Jetty!
// var Jetty = require("jetty");

// // Create a new Jetty object. This is a through stream with some additional
// // methods on it. Additionally, connect it to process.stdout
// var jetty = new Jetty(process.stdout);

// // Clear the screen
// jetty.clear();

// // write something
// jetty.text("hello world\n");
// jetty.text("hello world\n");
// jetty.text("hello world\n");
// jetty.text("hello world\n");
// setTimeout(()=>{
//     jetty.moveTo([0,0]);

//     jetty.text("hello panda");

// },4000);
var inquirer = require('inquirer');
var clear = require('clear');


var choice=[new inquirer.Separator('Entire Directory?'),
{
  name: 'yes'
},
{
  name: 'no'
}
];
clear();

var a=inquirer.prompt([{
    type: 'checkbox',
    message: 'Do you want to send all files?',
    name: 'wantAllFiles',
    choices: choice,
    validate: function (answer) {
      if (answer.length < 1) {
        return 'You must choose at least one option.';
      }
      return true;
    }
  }]);
  a.then((answer)=>{
      console.log("\n");
      console.log(answer['wantAllFiles']+"-----------------")
  });

  setTimeout(()=>{
    a.ui.close();
      clear();
      choice.push({name:"rofl"});

      inquirer.prompt([{
        type: 'checkbox',
        message: 'Do you want to send all files?',
        name: 'wantAllFiles',
        choices: choice,
        validate: function (answer) {
          if (answer.length < 1) {
            return 'You must choose at least one option.';
          }
          return true;
        }
      }]).then((answer)=>{
          console.log("\n");
          console.log(answer['wantAllFiles']+"-----------------")
      });
},3000);

// for(let i=1;i<=1000;i++){process.stdout.write('Hello, World'); if(i<10)process.stdout.clearLine(); process.stdout.cursorTo(0);}
