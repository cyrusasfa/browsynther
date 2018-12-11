const intervals = ['1n', '2n', '4n', '8n', '8t', '16n', '32n', '64n'];

const scales = {
  minor: {
    c: ['C3', 'D3', 'Eb3', 'F3', 'G3', 'Ab3', 'B3', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'B4', 'C5'],
    d: ['D3', 'E3', 'F3', 'G3', 'A3', 'Bb3', 'C#4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C#5', 'D5'],
    e: ['E3', 'F#3', 'G3', 'A3', 'B3', 'C3', 'D3', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C4', 'D4', 'E5'],
    f: ['F3', 'G3', 'Ab3', 'Bb3', 'C4', 'Db4', 'E4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'E5', 'F5'],
  },
  major: {

  }
}

const synthTypes = {synth: "FM", noise: "NOISE", am: "AM"};

export {scales, intervals, synthTypes}
