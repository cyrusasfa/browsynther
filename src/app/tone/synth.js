import Tone from 'tone';

const gain = new Tone.Gain(0.5).toMaster();
var synth = new Tone.Synth().connect(gain);

export { synth };
