import Tone from 'tone';

import {Synth} from './synth';

'use strict'
export class Noise extends Synth {

  constructor() {
    super();
    const gain = new Tone.Gain(0.5).toMaster();
    var noiseSynth = new Tone.MetalSynth();
    let synthJSON =  {
    	"frequency"  : 45 ,
    	"envelope"  : {
    		"attack"  : 0.001 ,
    		"decay"  : 0.2 ,
    		"release"  : 0.1
    	},
    	"harmonicity"  : 12 ,
    	"modulationIndex"  : 40 ,
    	"resonance"  : 1000 ,
    	"octaves"  : 1.5
    };

    //  create effects
    this.chorus = new Tone.Chorus();
    let chorusJSON = {
    	"frequency": 0.2,
    	"delayTime": 10,
    	"type": "sine",
    	"depth": 1,
    	"feedback": 0.6,
    	"spread": 180,
      "wet": 0.6
    };
    this.chorus.set(chorusJSON);

    noiseSynth.set(synthJSON);
    noiseSynth.connect(this.chorus);
    this.chorus.connect(Tone.Master);
    this.synth = noiseSynth.connect(gain);

    this.repeatCallback = function(time){
      let decay = (self.parameter + 0.1) * 0.2;
      self.synth.set("envelope.decay", decay);
      self.synth.triggerAttackRelease('16n');
    };
  }
}
