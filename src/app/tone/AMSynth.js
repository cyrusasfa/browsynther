import Tone from 'tone';

import {Synth} from './synth';

'use strict'
export class AMSynth extends Synth {

  constructor() {
    super(true);
    const gain = new Tone.Gain(0.5).toMaster();
    var am = new Tone.AMSynth();;
    let synthJSON = {
        "harmonicity": 6,
        "oscillator": {
            "type": "square"
        },
        "envelope": {
            "attack": 0.2,
            "decay": 0.3,
            "sustain": 0.8,
            "release": 0.5
        },
        "modulation" : {
          	"volume" : 12,
            "type": "square6"
        },
        "modulationEnvelope" : {
            "attack": 0.2,
            "decay": 1.5,
            "sustain": 0.8,
            "release": 0.5
        }
    };

    am.set(synthJSON);

    //  create effects
    this.effect = new Tone.Vibrato();
    let vibratoJSON = {
    	"frequency": 5,
    	"depth": 0.5,
    	"type": "sine",
        "wet": 0.5
    };
    this.effect.set(vibratoJSON);

    am.connect(this.effect);
    this.effect.connect(Tone.Master);
    this.synth = am.connect(gain);

    let self = this;
    this.repeatCallback = function(time) {
      // let decay = (self.parameter + 0.1) * 0.08;
      // self.synth.set("frequency", self.note);
      self.synth.triggerAttackRelease(self.note, '1n');
    };
  }

  schedule() {
    return Tone.Transport.schedule(this.repeatCallback);
  }
}
