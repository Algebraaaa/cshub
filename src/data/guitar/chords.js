// Chord shapes: array of 6 fret numbers indexed [high-e, B, G, D, A, low-E]
// 'x' = muted string, 0 = open string
export const GUITAR_CHORDS = {
  Em: {
    name: 'Em',
    fullName: 'E 小调',
    shape: [0, 0, 0, 2, 2, 0],
    fingers: [null, null, null, 2, 1, null],
    desc: '最容易的和弦之一，所有开放弦都可以振动。',
    barreFrom: null,
  },
  Am: {
    name: 'Am',
    fullName: 'A 小调',
    shape: [0, 1, 2, 2, 0, 'x'],
    fingers: [null, 1, 3, 2, null, null],
    desc: '常见于流行、民谣。低音 E 弦不弹。',
    barreFrom: null,
  },
  C: {
    name: 'C',
    fullName: 'C 大调',
    shape: [0, 1, 0, 2, 3, 'x'],
    fingers: [null, 1, null, 2, 3, null],
    desc: '三根手指按三根弦，高音 e 弦开放。',
    barreFrom: null,
  },
  G: {
    name: 'G',
    fullName: 'G 大调',
    shape: [3, 0, 0, 0, 2, 3],
    fingers: [4, null, null, null, 2, 3],
    desc: '六弦都弹响，音色饱满。',
    barreFrom: null,
  },
  D: {
    name: 'D',
    fullName: 'D 大调',
    shape: [2, 3, 2, 0, 'x', 'x'],
    fingers: [1, 3, 2, null, null, null],
    desc: '只弹四根高音弦，低音 E 和 A 弦不弹。',
    barreFrom: null,
  },
  Dm: {
    name: 'Dm',
    fullName: 'D 小调',
    shape: [1, 3, 2, 0, 'x', 'x'],
    fingers: [1, 3, 2, null, null, null],
    desc: '与 D 大调形状相似，第一弦降半音。',
    barreFrom: null,
  },
  E: {
    name: 'E',
    fullName: 'E 大调',
    shape: [0, 0, 1, 2, 2, 0],
    fingers: [null, null, 1, 3, 2, null],
    desc: '六弦全弹，E 和弦是吉他最具特色的开放和弦。',
    barreFrom: null,
  },
  A: {
    name: 'A',
    fullName: 'A 大调',
    shape: [0, 2, 2, 2, 0, 'x'],
    fingers: [null, 1, 2, 3, null, null],
    desc: '三根手指并排按三弦，或用食指小横按。',
    barreFrom: null,
  },
}

export const CHORD_LIST = Object.values(GUITAR_CHORDS)
