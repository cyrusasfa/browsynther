import * as p5 from "p5/lib/p5.min"
import './css/style.css';
import { Synth, Noise, AMSynth, SynthFactory } from './tone';
import {intervals, scales, synthTypes} from './config';
import { subscribe, sendSocketUpdate } from './api/subscribe';
import Tone from 'tone';
import {State, User} from './state';
import {isEqual} from 'lodash';

var randomColor = require('randomcolor');

const transport = Tone.Transport;
Tone.Transport.bpm.value = 120;
Tone.Transport.start();

const synthFactory = new SynthFactory();
// this user synth;
let thisUser = new User(randomColor(), synthTypes.synth, false);
const state = new State(thisUser, synthFactory.getSynth(synthTypes.synth), scales.minor.f);

let sketch = (p5) => {
    var w;
    var columns;
    var rows;
    var grid;
    var next;
    var currentCell;
    var mouseLocked;
    var buttons = [];

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
              state.thisUserSynth.start(state.scale[this.x], intervals[this.y], this.y);
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

    class Button {
      constructor(text, x, y, w, h) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h
        this.color = disabledColor;
      }

      mouseIsOver() {
        let mouseX = p5.mouseX;
        let mouseY = p5.mouseY;
        return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
      }

      setColor(color) {
        this.color = color;
      }
    }

     p5.setup = () => {
         var cnv = p5.createCanvas(1000, 420);
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

         // Init buttons
         let numSynths = Object.keys(synthTypes).length;
         for (var i = 0; i < numSynths; i++) {
           buttons[i] = new Button(Object.values(synthTypes)[i], columns * (w + 3), (i * w) + w / 2, w * 2, w / 2);
           if (buttons[i].text == thisUser.synth) {
             buttons[i].color = thisUser.color;
           }
         }

         p5.textAlign(p5.CENTER);
     }

    p5.draw = () => {
      p5.background(emptyColor);
      drawGrid();

      drawButtons();

      handleOnUsers();
      handleOffUsers();


      drawText();
    }

    function fillCurrentCell() { // mouseClicked
      mouseLocked = true;
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].mouseIsOver()) {
          buttons[i].setColor(thisUser.color);
          buttons.filter(b => b.y != buttons[i].y).forEach(b => {
            b.setColor(disabledColor);
          });
          handleSynthChanged(Object.keys(synthTypes)[i])
        }
      }
    }

    function unfillCurrentCell() { // mouseReleased
      mouseLocked = false;
      currentCell.color = disabledColor;
      // Stop user synth and set user status to off
      state.thisUserSynth.stop();
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

    function drawButtons() {
      for (var i = 0; i < buttons.length; i++) {
        p5.fill(buttons[i].color);
        p5.text(buttons[i].text, buttons[i].x, buttons[i].y, buttons[i].w, buttons[i].h);
      }
    }

    function drawText() {
      for (var i = 0; i < columns; i++) {
        p5.fill(0);
        p5.text(state.scale[i], (i * w) + w / 2, rows * (w + 2)); // current scale letters
      }
      for (var j = 0; j < rows; j++) {
        p5.fill(0);
        p5.text(j + 1, columns * (w + 1), (j * w) + w / 2); // y axis values letters
      }
    }

    function handleOnUsers() {
      // For each of clients that have instrument on
      Object.values(state.users).filter(user => user.userState.isOn).forEach(user => {
        // Set the grid for the user's position
        grid[user.userState.x][user.userState.y].setUserOnCell(user.userState);
        if (user.userState.hasMoved) {
          // If user has just clicked or moved to new cell, restart instrument with new params
          user.userSynth.start(state.scale[user.userState.x], intervals[user.userState.y], user.userState.x);
        }
      });
    }

    function handleOffUsers() {
      // Stop instruments of clients who do no have mouse clicked
      Object.values(state.users).filter(user => !user.userState.isOn).forEach(user => {
        user.userSynth.stop();
      });
    }

    function handleSynthChanged(synth) {
      thisUser.setSynth(synth);
      state.setThisUserSynth(synthFactory.getSynth(synth))
    }
}
const P5 = new p5(sketch);

// TODO: EXPORT THESE FROM AN EXTERNAL
// Callback when socket notifies that there is a new user connected or state changed
let userUpdate = (err, userId, userState) => {
  let prevSynth;
  if (state.users[userId] == undefined) {
    state.users[userId] = {};
    prevSynth == undefined;
  } else {
    prevSynth = state.users[userId].userState.synth;
  }
  state.users[userId] = {...state.users[userId], userState: userState};

  // Init user instrument
  if (state.users[userId].userSynth == undefined) {
    state.users[userId] = {...state.users[userId], userSynth: synthFactory.getSynth(userState.synth)};
  }

  if (prevSynth != userState.synth && prevSynth != undefined) {
    state.users[userId].userSynth.deep_dispose();
    state.users[userId] = {...state.users[userId], userSynth: synthFactory.getSynth(userState.synth)};
  }
  // if user synth has changed kill old one and init new
  // if (state.users[userId].userSynth != undefined && state.users[userId.userSynth] != null) {
  //   state.users[userId].userSynth.deep_dispose();
  // }
};

// Remove a user from the list of clients when they disconnect from the socket.
let removeUser = (err, userId) => {
  if (state.users[userId].userSynth != undefined) {
    state.users[userId].userSynth.deep_dispose();
  }
  delete state.users[userId];
};
// Subscribe to socket and pass message callback functions and this user info
subscribe(userUpdate, removeUser, state.thisUser);
