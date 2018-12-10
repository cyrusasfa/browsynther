import { Synth, Noise, AMSynth } from './';

export class SynthFactory {

  getSynth(synthType) {
    if (synthType == null) {
      return null;
    }
    if (synthType == "synth") {
       return new Synth();
    } else if (synthType == "noise") {
       return new Noise();
    } else if (synthType == "am") {
       return new AMSynth();
    }
    return null;
  }
}
