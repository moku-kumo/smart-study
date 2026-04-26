export interface PhonicsEntry {
  letter: string    // 'A'
  lower: string     // 'a'
  word: string      // 'apple'
  emoji: string     // '🍎'
  sound: string     // 'æ' (for TTS: "ah")
}

export const phonicsList: PhonicsEntry[] = [
  { letter: 'A', lower: 'a', word: 'apple', emoji: '🍎', sound: 'A says ah, ah, apple' },
  { letter: 'B', lower: 'b', word: 'bear', emoji: '🐻', sound: 'B says buh, buh, bear' },
  { letter: 'C', lower: 'c', word: 'cat', emoji: '🐱', sound: 'C says kuh, kuh, cat' },
  { letter: 'D', lower: 'd', word: 'dog', emoji: '🐶', sound: 'D says duh, duh, dog' },
  { letter: 'E', lower: 'e', word: 'egg', emoji: '🥚', sound: 'E says eh, eh, egg' },
  { letter: 'F', lower: 'f', word: 'fish', emoji: '🐟', sound: 'F says fuh, fuh, fish' },
  { letter: 'G', lower: 'g', word: 'gorilla', emoji: '🦍', sound: 'G says guh, guh, gorilla' },
  { letter: 'H', lower: 'h', word: 'hat', emoji: '🧢', sound: 'H says huh, huh, hat' },
  { letter: 'I', lower: 'i', word: 'igloo', emoji: '🏠', sound: 'I says ih, ih, igloo' },
  { letter: 'J', lower: 'j', word: 'juice', emoji: '🧃', sound: 'J says juh, juh, juice' },
  { letter: 'K', lower: 'k', word: 'kite', emoji: '🪁', sound: 'K says kuh, kuh, kite' },
  { letter: 'L', lower: 'l', word: 'lion', emoji: '🦁', sound: 'L says luh, luh, lion' },
  { letter: 'M', lower: 'm', word: 'moon', emoji: '🌙', sound: 'M says muh, muh, moon' },
  { letter: 'N', lower: 'n', word: 'nose', emoji: '👃', sound: 'N says nuh, nuh, nose' },
  { letter: 'O', lower: 'o', word: 'octopus', emoji: '🐙', sound: 'O says ah, ah, octopus' },
  { letter: 'P', lower: 'p', word: 'pig', emoji: '🐷', sound: 'P says puh, puh, pig' },
  { letter: 'Q', lower: 'q', word: 'queen', emoji: '👸', sound: 'Q says kwuh, kwuh, queen' },
  { letter: 'R', lower: 'r', word: 'rabbit', emoji: '🐰', sound: 'R says ruh, ruh, rabbit' },
  { letter: 'S', lower: 's', word: 'sun', emoji: '☀️', sound: 'S says suh, suh, sun' },
  { letter: 'T', lower: 't', word: 'tiger', emoji: '🐯', sound: 'T says tuh, tuh, tiger' },
  { letter: 'U', lower: 'u', word: 'umbrella', emoji: '☂️', sound: 'U says uh, uh, umbrella' },
  { letter: 'V', lower: 'v', word: 'violin', emoji: '🎻', sound: 'V says vuh, vuh, violin' },
  { letter: 'W', lower: 'w', word: 'whale', emoji: '🐋', sound: 'W says wuh, wuh, whale' },
  { letter: 'X', lower: 'x', word: 'fox', emoji: '🦊', sound: 'X says ks, ks, fox' },
  { letter: 'Y', lower: 'y', word: 'yellow', emoji: '💛', sound: 'Y says yuh, yuh, yellow' },
  { letter: 'Z', lower: 'z', word: 'zebra', emoji: '🦓', sound: 'Z says zuh, zuh, zebra' },
]
