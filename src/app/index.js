import * as p5 from "p5/lib/p5.min"
import './css/style.css';
import { Synth, Noise } from './tone';
import {intervals, scales, synths} from './config';
import { subscribe, sendSocketUpdate } from './api/subscribe';
import Tone from 'tone';
import {State, User} from './state';

var randomColor = require('randomcolor'); // import the script

const transport = Tone.Transport;
Tone.Transport.bpm.value = 120;
Tone.Transport.start();

const toneSynths = {
  "synth": new Synth(),
  "noise": new Noise()
};
const users = []
const thisUser = new User(randomColor(), synths.synth);
const state = new State(thisUser, scales.minor.c, users)

let sketch = (p5) => {
    var w;
    var columns;
    var rows;
    var grid;
    var next;
    var currentCell;
    var mouseLocked;

    const disabledColor = 209;

    class Cell {
      constructor(color, player, x, y) {
        this.color = color;
        this.player = player;
        this.x = x;
        this.y = y;
      }

      mouseIsOver() {
        let mouseX = p5.mouseX;
        let mouseY = p5.mouseY;
        if (mouseX > this.x * w && mouseX < (this.x * w) + w && mouseY > this.y * w && mouseY < (this.y * w) + w ) {
          let prevCell = currentCell;
          currentCell = this;
          if (!mouseLocked)  {
            this.color = disabledColor;

            // Tell server that user mouse is not clicked on a cell
            state.thisUser.setX(-1);
            state.thisUser.setY(-1);
          } else {
            if (prevCell != currentCell) {
              // If mouse is held and moved to a new cell
              toneSynths[state.thisUser.synth].start(state.scale[currentCell.x], intervals[currentCell.y], currentCell.x);
            }

            // Mouse held on cell, set its color and update user position
            this.color = state.thisUser.color;
            state.thisUser.setX(this.x);
            state.thisUser.setY(this.y);

            // Send updated user position to socket
            sendSocketUpdate(state.thisUser);
          }
        } else {
          this.color = 255;
        }
      }
    }

     p5.setup = () => {
         var cnv = p5.createCanvas(850, 420);
         cnv.mousePressed(fillCurrentCell);
         cnv.mouseReleased(unfillCurrentCell);
         w = 50;
         columns = 15;
         rows = 8;

         grid = new Array(columns);
         for (var i = 0; i < columns; i++) {
           grid[i] = new Array(rows);
         }
         for (var i = 0; i < columns; i++) {
           for (var j = 0; j < rows; j++) {
             grid[i][j] = new Cell(255, null, i, j);
           }
         }

         p5.textAlign(p5.CENTER);
     }

    p5.draw = () => {
      p5.background(255);
      for (var i = 0; i < columns; i++) {
        for (var j = 0; j < rows; j++) {
          p5.fill(grid[i][j].color)
          p5.stroke(209);
          p5.rect(i*w, j*w, w-1, w-1);
          grid[i][j].mouseIsOver()
        }
      }

      // DRAW TEXT
      for (var i = 0; i < columns; i++) {
        p5.fill(0);
        p5.text(state.scale[i], (i * w) + w / 2, rows * (w + 2));
      }
    }

    function fillCurrentCell() {
      currentCell.color = 0;
      mouseLocked = true;
      toneSynths[state.thisUser.synth].start(state.scale[currentCell.x], intervals[currentCell.y], currentCell.x);
    }

    function unfillCurrentCell() {
      mouseLocked = false;
      currentCell.color = disabledColor;
      toneSynths[state.thisUser.synth].stop();
    }

}
const P5 = new p5(sketch);

// TODO: EXPORT THESE FROM AN EXTERNAL
// Callback when socket notifies that there is a new user connected
let registerNewUser = (err, userId, userState) => {
  users[userId] = userState;
  console.log(users);
  if (userState.x != -1) {console.log(users[userId])};
};

// Remove a user from the list of clients when they disconnect from the socket.
let removeUser = (err, userId) => {
  delete users[userId];
  console.log(users);
};
// Subscribe to socket and pass message callback functions and this user info
subscribe(registerNewUser, removeUser, state.thisUser);
