import * as p5 from "p5/lib/p5.min"
import './css/style.css';
import { Synth, Noise } from './tone';
import {intervals, scales, synths} from './config';
import { subscribe, sendSocketUpdate } from './api/subscribe';
import Tone from 'tone';
import {State, User} from './state';
import {isEqual} from 'lodash';

var randomColor = require('randomcolor');

const transport = Tone.Transport;
Tone.Transport.bpm.value = 120;
Tone.Transport.start();

const toneSynths = {
  "synth": new Synth(),
  "noise": new Noise()
};
let users = []
let thisUser = new User(randomColor(), synths.synth, false);
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
          var prevCell = {...currentCell};
          currentCell = {...this};
          if (!mouseLocked)  {
            this.color = disabledColor;
            // Tell server that user mouse is not clicked on a cell
            state.thisUser.setIsOn(false);
          } else {
            // Mouse held on cell, set its color and update user position

            this.color = state.thisUser.color;
            state.thisUser.setX(this.x);
            state.thisUser.setY(this.y);
            state.thisUser.setIsOn(true); // Tell server user instrument is on
            if (!_.isEqual({...this}, prevCell)) {
              // If mouse is held and moved to a new cell restart the instrument
              toneSynths[state.thisUser.synth].start(state.scale[currentCell.x], intervals[currentCell.y], currentCell.x);
            }
            // Tell server if the user has moved cell
            state.thisUser.setHasMoved(!_.isEqual({...this}, prevCell));

            // Send updated user position to socket
            sendSocketUpdate(state.thisUser);
          }
        } else {
          this.color = 255;
        }
      }

      setUserOn(user) {
        this.color = user.color;
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

      Object.values(state.users).filter(user => user.isOn).forEach(user => {
        grid[user.x][user.y].setUserOn(user);
        console.log(user)
        if (user.hasMoved) {
          toneSynths[user.synth].start(state.scale[user.x], intervals[user.y], user.x);
        }
      });

      Object.values(state.users).filter(user => !user.isOn).forEach(user => {
        toneSynths[user.synth].stop();
      });

      // DRAW TEXT
      for (var i = 0; i < columns; i++) {
        p5.fill(0);
        p5.text(state.scale[i], (i * w) + w / 2, rows * (w + 2));
      }
    }

    function fillCurrentCell() {
      mouseLocked = true;
      toneSynths[state.thisUser.synth].start(state.scale[currentCell.x], intervals[currentCell.y], currentCell.x);
      state.thisUser.setHasMoved(true);
    }

    function unfillCurrentCell() {
      mouseLocked = false;
      currentCell.color = disabledColor;
      toneSynths[state.thisUser.synth].stop();
      state.thisUser.setIsOn(false);
      sendSocketUpdate(state.thisUser);
    }

}
const P5 = new p5(sketch);

// TODO: EXPORT THESE FROM AN EXTERNAL
// Callback when socket notifies that there is a new user connected
let userUpdate = (err, userId, userState) => {
  state.users[userId] = userState;
  if (userState.isOn) {console.log(state.users[userId])};
};

// Remove a user from the list of clients when they disconnect from the socket.
let removeUser = (err, userId) => {
  delete state.users[userId];
};
// Subscribe to socket and pass message callback functions and this user info
subscribe(userUpdate, removeUser, state.thisUser);
