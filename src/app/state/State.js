import Tone from 'tone';

export default class State {
  constructor(thisUser, thisUserSynth, scale) {
    this.thisUser = thisUser;
    this.thisUserSynth = thisUserSynth;
    this.scale = scale;

    this.users = [];
    // this.users = users;
  }

  setBPM(bpm) {
    Tone.Transport.bpm.value = 120;
  }

  setScale(scale) {
    this.scale = scale;
  }

  setThisUserSynth(synth) {
    this.thisUserSynth.deep_dispose();
    this.thisUserSynth = synth;
  }
}
