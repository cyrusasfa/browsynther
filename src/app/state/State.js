import Tone from 'tone';

export default class State {
  constructor(thisUser, scale, users) {
    this.thisUser = thisUser;
    this.scale = scale;

    this.users = users;
  }

  setBPM(bpm) {
    Tone.Transport.bpm.value = 120;
  }

  setScale(scale) {
    this.scale = scale;
  }

  updateUser() {

  }

  addUser() {

  }
}
