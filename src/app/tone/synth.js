import Tone from 'tone';

'use strict'
export class Synth {
  constructor() {
    const gain = new Tone.Gain(0.5).toMaster();
    let synth = new Tone.FMSynth();
    var synthJSON = {
        "harmonicity":2,
        "modulationIndex": 2,
        "oscillator" : {
            "type": "sine"
        },
        "envelope": {
            "attack": 0.005,
            "decay": 0.2,
            "sustain": 0,
            "release": 0.001
        },
        "modulation" : {
            "type" : "square"
        },
        "modulationEnvelope" : {
            "attack": 0.005,
            "decay": 0.5,
            "sustain": 0,
            "release": 0.001
        }
    };

    synth.set(synthJSON);

    this.synth = synth.connect(gain);
    self = this;
    this.loop = new Tone.Loop(function(time){
        self.synth.triggerAttackRelease('C4', '8n')
      }, "16n");
  }

  start(interval) {
    this.loop.interval = interval;
    this.loop.start(0);
  }

  setLoopInterval(interval) {
    this.loop.interval = interval;
  }

  stop() {
    this.loop.stop();
  }
}
