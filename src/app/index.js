import * as p5 from "p5/lib/p5.min"
import './css/style.css';
import { Synth, Noise, AMSynth } from './tone';
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
  "noise": new Noise(),
  "am": new AMSynth()
};
let users = []
let thisUser = new User(randomColor(), synths.am, false);
const state = new State(thisUser, scales.minor.c, users);

// User Synths

let sketch = (p5) => {
    var w;
    var columns;
    var rows;
    var grid;
    var next;
    var currentCell;
    var mouseLocked;

    const disabledColor = 209;
    const emptyColor = 255;

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
        if (mouseX > this.x * w && mouseX < (this.x * w) + w && mouseY > this.y * w && mouseY < (this.y * w) + w) {
          var prevCell = {...currentCell};
          if (!mouseLocked)  {
            this.color = disabledColor;
          } else {
            // Mouse held on cell, set its color and update user position
            this.color = state.thisUser.color;
            let hasMoved = !_.isEqual({...this}, prevCell)
            if (hasMoved) {
              // If mouse is held and moved to a new cell restart the instrument
              toneSynths[state.thisUser.synth].start(state.scale[this.x], intervals[this.y], this.y);
            }
            // Tell server if the user has moved cell
            updateThisUserState(this, hasMoved);
          }

          currentCell = {...this};
        } else {
          this.color = emptyColor;
        }
      }

      setUserOnCell(user) {
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

         // Initialise grid structure
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
      p5.background(emptyColor);
      drawGrid();

      handleOnUsers();
      handleOffUsers();

      drawText();
    }

    function fillCurrentCell() { // mouseClicked
      mouseLocked = true;
      toneSynths[state.thisUser.synth].start(state.scale[currentCell.x], intervals[currentCell.y], currentCell.y);
    }

    function unfillCurrentCell() { // mouseReleased
      mouseLocked = false;
      currentCell.color = disabledColor;
      // Stop user synth and set user status to off
      toneSynths[state.thisUser.synth].stop();
      state.thisUser.setIsOn(false);
      sendSocketUpdate(state.thisUser);
    }

    function updateThisUserState(cell, hasMoved) {
      state.thisUser.setX(cell.x);
      state.thisUser.setY(cell.y);
      state.thisUser.setIsOn(true); // Tell server user instrument is on
      state.thisUser.setHasMoved(hasMoved);

      // Send updated user position to socket
      sendSocketUpdate(state.thisUser);
    }

    function drawGrid() {
      for (var i = 0; i < columns; i++) {
        for (var j = 0; j < rows; j++) {
          p5.fill(grid[i][j].color)
          p5.stroke(disabledColor);
          p5.rect(i*w, j*w, w-1, w-1);
          grid[i][j].mouseIsOver()
        }
      }
    }

    function drawText() {
      for (var i = 0; i < columns; i++) {
        p5.fill(0);
        p5.text(state.scale[i], (i * w) + w / 2, rows * (w + 2)); // current scale letters
      }
    }

    function handleOnUsers() {
      // For each of clients that have instrument on
      Object.values(state.users).filter(user => user.isOn).forEach(user => {
        // Set the grid for the user's position
        grid[user.x][user.y].setUserOnCell(user);
        if (user.hasMoved) {
          // If user has just clicked or moved to new cell, restart instrument with new params
          toneSynths[user.synth].start(state.scale[user.x], intervals[user.y], user.x);
        }
      });
    }

    function handleOffUsers() {
      // Stop instruments of clients who do no have mouse clicked
      Object.values(state.users).filter(user => !user.isOn).forEach(user => {
        toneSynths[user.synth].stop();
      });
    }
}
const P5 = new p5(sketch);

// TODO: EXPORT THESE FROM AN EXTERNAL
// Callback when socket notifies that there is a new user connected
let userUpdate = (err, userId, userState) => {
  state.users[userId] = userState;
  // if (userState.isOn) {console.log(state.users[userId])};
};

// Remove a user from the list of clients when they disconnect from the socket.
let removeUser = (err, userId) => {
  delete state.users[userId];
};
// Subscribe to socket and pass message callback functions and this user info
subscribe(userUpdate, removeUser, state.thisUser);
