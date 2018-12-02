import Tone from 'tone';

function createFMSynth() {
  // create synth
  var instrument = new Tone.FMSynth();
  var synthJSON = {
      "harmonicity":2,
      "modulationIndex": 1,
      "oscillator" : {
          "type": "sine"
      },
      "envelope": {
          "attack": 0.00,
          "decay": 0.2,
          "sustain": 0.1,
          "release": 0.1
      },
      "modulation" : {
          "type" : "sine"
      },
      "modulationEnvelope" : {
          "attack": 0.00,
          "decay": 0.2,
          "sustain": 0,
          "release": 0.1
      }
  };

  instrument.set(synthJSON);

  var effect1, effect2, effect3;

  // create effects
  var effect1 = new Tone.Phaser();
  effect1JSON = {
  	"frequency": 4,
  	"octaves": 0.4,
  	"Q": 20,
  	"baseFrequency": 800,
      "wet": 0.5
  };
  effect1.set(effect1JSON);


  // make connections
  instrument.connect(effect1);
  effect1.connect(Tone.Master);

  // define deep dispose function
  function deep_dispose() {
      if(effect1 != undefined && effect1 != null) {
          effect1.dispose();
          effect1 = null;
      }
      if(effect2 != undefined && effect2 != null) {
          effect2.dispose();
          effect2 = null;
      }
      if(effect3 != undefined && effect3 != null) {
          effect3.dispose();
          effect3 = null;
      }
      if(instrument != undefined && instrument != null) {
          instrument.dispose();
          instrument = null;
      }
  }

  return {
      instrument: instrument,
      deep_dispose: deep_dispose
  };

}

export { createFMSynth };
