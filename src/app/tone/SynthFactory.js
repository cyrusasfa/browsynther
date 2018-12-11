import { Synth, Noise, AMSynth } from './';

export class SynthFactory {

  getSynth(synthType) {
    if (synthType == null) {
      return null;
    }
    if (synthType == "FM") {
       return new Synth();
    } else if (synthType == "NOISE") {
       return new Noise();
    } else if (synthType == "AM") {
       return new AMSynth();
    }
    return null;
  }
}
