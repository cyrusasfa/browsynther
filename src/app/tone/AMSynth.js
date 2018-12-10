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
            "decay": 1,
            "sustain": 0.8,
            "release": 0.3
        },
        "modulation" : {
          	"volume" : 12,
            "type": "square6"
        },
        "modulationEnvelope" : {
            "attack": 0.2,
            "decay": 0.5,
            "sustain": 0.7,
            "release": 0.2
        }
    };

    am.set(synthJSON);

    //  create effects
    this.effect = new Tone.Vibrato();
    let vibratoJSON = {
    	"frequency": 5,
    	"depth": 0.8,
    	"type": "sine",
        "wet": 0.7
    };
    this.effect.set(vibratoJSON);

    // create effects
    this.effect1 = new Tone.Chorus();
    let chorusJSON = {
    	"frequency": 0.3,
    	"delayTime": 8,
    	"type": "sawtooth",
    	"depth": 0.8,
    	"feedback": 0.4,
    	"spread": 180,
        "wet": 0.6
    };
    this.effect1.set(chorusJSON);

    am.connect(this.effect);
    am.connect(this.effect1);
    this.effect.connect(Tone.Master);
    this.effect1.connect(Tone.Master);
    this.synth = am.connect(gain);

    let self = this;
    this.repeatCallback = function(time) {
      self.effect.set("frequency", self.parameter + 1);
      self.synth.triggerAttackRelease(self.note, '2n');
    };
  }

  schedule() {
    return Tone.Transport.schedule(this.repeatCallback);
  }
}
