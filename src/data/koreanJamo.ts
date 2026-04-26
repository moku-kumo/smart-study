export interface JamoEntry {
  char: string
  type: 'consonant' | 'vowel'
  name: string
  sound: string
}

export const jamoList: JamoEntry[] = [
  { char: 'ㄱ', type: 'consonant', name: '기역', sound: '그' },
  { char: 'ㄴ', type: 'consonant', name: '니은', sound: '느' },
  { char: 'ㄷ', type: 'consonant', name: '디귿', sound: '드' },
  { char: 'ㄹ', type: 'consonant', name: '리을', sound: '르' },
  { char: 'ㅁ', type: 'consonant', name: '미음', sound: '므' },
  { char: 'ㅂ', type: 'consonant', name: '비읍', sound: '브' },
  { char: 'ㅅ', type: 'consonant', name: '시옷', sound: '스' },
  { char: 'ㅇ', type: 'consonant', name: '이응', sound: '응' },
  { char: 'ㅈ', type: 'consonant', name: '지읒', sound: '즈' },
  { char: 'ㅊ', type: 'consonant', name: '치읓', sound: '츠' },
  { char: 'ㅋ', type: 'consonant', name: '키읔', sound: '크' },
  { char: 'ㅌ', type: 'consonant', name: '티읕', sound: '트' },
  { char: 'ㅍ', type: 'consonant', name: '피읖', sound: '프' },
  { char: 'ㅎ', type: 'consonant', name: '히읗', sound: '흐' },
  { char: 'ㅏ', type: 'vowel', name: '아', sound: '아' },
  { char: 'ㅑ', type: 'vowel', name: '야', sound: '야' },
  { char: 'ㅓ', type: 'vowel', name: '어', sound: '어' },
  { char: 'ㅕ', type: 'vowel', name: '여', sound: '여' },
  { char: 'ㅗ', type: 'vowel', name: '오', sound: '오' },
  { char: 'ㅛ', type: 'vowel', name: '요', sound: '요' },
  { char: 'ㅜ', type: 'vowel', name: '우', sound: '우' },
  { char: 'ㅠ', type: 'vowel', name: '유', sound: '유' },
  { char: 'ㅡ', type: 'vowel', name: '으', sound: '으' },
  { char: 'ㅣ', type: 'vowel', name: '이', sound: '이' },
]
