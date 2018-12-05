import Tone from 'tone';

import Synth from './synth'

'use strict'
export class Noise extends Synth {

  constructor() {
    const gain = new Tone.Gain(0.5).toMaster();
    let synth = new Tone.NoiseSynth();
    let synthJSON = {
        "noise": {
            "type": "pink",
            "playbackRate" : 1
        },
        "envelope": {
            "attack": 0.001,
            "decay": 0.5,
            "sustain": 0,
            "release": 0.1
        }
    };

    // create effects
    // this.chorus = new Tone.Chorus();
    // let chorusJSON = {
    // 	"frequency": 0.2,
    // 	"delayTime": 10,
    // 	"type": "sine",
    // 	"depth": 1,
    // 	"feedback": 0.45,
    // 	"spread": 180,
    //   "wet": 0.8
    // };
    // this.chorus.set(chorusJSON);

    synth.set(synthJSON);
    // noiseSynth.connect(this.chorus);
    // this.chorus.connect(Tone.Master);
    this.synth = synth.connect(gain);

    this.repeatCallback = function(time){
      let decay = self.parameter
      self.noiseSynth.triggerAttackRelease('16n', '4n');
    };
  }
}
