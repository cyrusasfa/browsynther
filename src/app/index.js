import * as p5 from "p5/lib/p5.min"
import './css/style.css';
import { Synth } from './tone';
import { subscribeToTimer } from './api/subscribe';
import Tone from 'tone';

const transport = Tone.Transport;
Tone.Transport.bpm.value = 120;
Tone.Transport.start();

const synth = new Synth();

const intervals = ['1n', '2n', '4n', '8n', '8t', '16n', '32n', '64n'];
const cMinor = ['C3', 'D3', 'Eb3', 'F3', 'G3', 'Ab3', 'Bb3', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5']

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
        if (mouseX > this.x && mouseX < this.x + w && mouseY > this.y && mouseY < this.y + w ) {
          let prevCell = currentCell;
          currentCell = this;
          if (!mouseLocked)  {
            this.color = disabledColor;
          } else {
            if (prevCell != currentCell) {
              synth.start(cMinor[currentCell.x / w], intervals[currentCell.y / w]);
            }
            this.color = 0;
            // synth.setLoopInterval(intervals[currentCell.y / w]);
          }
        } else {
          this.color = 255;
        }
      }
    }

     // p5.translate(window.innerWidth/2,window.innerHeight/2);
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
          grid[i][j].mouseIsOver()
        }
      }
    }

    function fillCurrentCell() {
      currentCell.color = 0;
      mouseLocked = true;
      synth.start(cMinor[currentCell.x / w], intervals[currentCell.y / w]);
    }

    function unfillCurrentCell() {
      mouseLocked = false;
      currentCell.color = disabledColor;
      synth.stop();
    }

}
const P5 = new p5(sketch);

subscribeToTimer((err, timestamp) => {
  var messageDiv = document.getElementById('message');
  messageDiv.innerHTML = timestamp;
});
