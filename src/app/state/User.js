export default class User {
  constructor(color, synth, isOn) {
    this.color = color;
    this.synth = synth;
    this.isOn = isOn;
    this.hasMoved = true;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  setSynth(synth) {
    this.synth = synth;
  }

  isOn() {
    return this.isOn;
  }

  setIsOn(isOn) {
    this.isOn = isOn;
  }

  setHasMoved(hasMoved) {
    this.hasMoved = hasMoved;
  }
}
