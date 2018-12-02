import * as p5 from "p5/lib/p5.min"
import './css/style.css';
import {synth} from './tone';
import { subscribeToTimer } from './api/subscribe';

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

      mouseIsOver(color) {
        let mouseX = p5.mouseX;
        let mouseY = p5.mouseY;
        if (mouseX > this.x && mouseX < this.x + w && mouseY > this.y && mouseY < this.y + w ) {
          currentCell = this;
          if (!mouseLocked)  {
            this.color = color;
          } else {
            this.color = 0;
          }
        } else {
          this.color = 255;
        }
      }
    }

     // p5.translate(window.innerWidth/2,window.innerHeight/2);
     p5.setup = () => {
         p5.createCanvas(850, 420);
         w = 50;
         columns = 16;
         rows = 8;

         grid = new Array(columns);
         for (var i = 0; i < columns; i++) {
           grid[i] = new Array(rows);
         }
         for ( var i = 0; i < columns;i++) {
           for ( var j = 0; j < rows;j++) {
             grid[i][j] = new Cell(255, null, i*w, j*w);
           }
         }
     }

    p5.draw = () => {
      p5.background(255);
      for ( var i = 0; i < columns;i++) {
        for ( var j = 0; j < rows;j++) {
          p5.fill(grid[i][j].color)
          p5.stroke(209);
          p5.rect(i*w, j*w, w-1, w-1);
          grid[i][j].mouseIsOver(disabledColor)
        }
      }
    }

    p5.mousePressed = () => {
      currentCell.color = 0;
      mouseLocked = true;
    }

    p5.mouseReleased = () => {
      mouseLocked = false;
      currentCell.color = disabledColor;
    }

}
const P5 = new p5(sketch);

subscribeToTimer((err, timestamp) => {
  console.log(timestamp);
  var messageDiv = document.getElementById('message');
  messageDiv.innerHTML = timestamp;
});

document.getElementById('note').addEventListener('click', function(e) {
    synth.triggerAttackRelease('C4', '8n')
});
