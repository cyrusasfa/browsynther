import Tone from 'tone';

import {Synth} from './synth';

'use strict'
export class Noise extends Synth {

  constructor() {
    super(true);
    const gain = new Tone.Gain(0.5).toMaster();
    var noiseSynth = new Tone.MetalSynth();
    let synthJSON =  {
    	"frequency"  : 80 ,
    	"envelope"  : {
    		"attack"  : 0.001 ,
    		"decay"  : 0.3 ,
    		"release"  : 0.1
    	},
    	"harmonicity"  : 12 ,
    	"modulationIndex"  : 80 ,
    	"resonance"  : 1000 ,
    	"octaves"  : 1.5
    };

    //  create effects
    this.effect = new Tone.Chorus();
    let chorusJSON = {
    	"frequency": 0.2,
    	"delayTime": 0,
    	"type": "sine",
    	"depth": 1,
    	"feedback": 0.3,
    	"spread": 180,
      "wet": 0.6
    };
    this.effect.set(chorusJSON);

    noiseSynth.set(synthJSON);
    noiseSynth.connect(this.effect);
    this.effect.connect(Tone.Master);
    this.synth = noiseSynth.connect(gain);

    let self = this;
    this.repeatCallback = function(time) {
      // let decay = (self.parameter + 0.1) * 0.08;
      self.synth.set("frequency", self.note);
      self.synth.triggerAttackRelease('16n');
    };
  }
}
