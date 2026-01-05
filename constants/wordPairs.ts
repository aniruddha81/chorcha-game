export interface WordPair {
  word: string;
  emoji: string;
  similarWords: { word: string; emoji: string }[];
}

export const WORD_PAIRS: WordPair[] = [
  {
    word: "bat",
    emoji: "🦇",
    similarWords: [
      { word: "cat", emoji: "🐱" },
      { word: "hat", emoji: "🎩" },
      { word: "rat", emoji: "🐀" },
    ],
  },
  {
    word: "cat",
    emoji: "🐱",
    similarWords: [
      { word: "bat", emoji: "🦇" },
      { word: "hat", emoji: "🎩" },
      { word: "rat", emoji: "🐀" },
    ],
  },
  {
    word: "dog",
    emoji: "🐕",
    similarWords: [
      { word: "fog", emoji: "🌫️" },
      { word: "log", emoji: "🪵" },
      { word: "hog", emoji: "🐗" },
    ],
  },
  {
    word: "bee",
    emoji: "🐝",
    similarWords: [
      { word: "tree", emoji: "🌳" },
      { word: "key", emoji: "🔑" },
      { word: "sea", emoji: "🌊" },
    ],
  },
  {
    word: "rain",
    emoji: "🌧️",
    similarWords: [
      { word: "train", emoji: "🚂" },
      { word: "plane", emoji: "✈️" },
      { word: "chain", emoji: "⛓️" },
    ],
  },
  {
    word: "bear",
    emoji: "🐻",
    similarWords: [
      { word: "pear", emoji: "🍐" },
      { word: "chair", emoji: "🪑" },
      { word: "hair", emoji: "💇" },
    ],
  },
  {
    word: "sun",
    emoji: "☀️",
    similarWords: [
      { word: "run", emoji: "🏃" },
      { word: "bun", emoji: "🍔" },
      { word: "gun", emoji: "🔫" },
    ],
  },
  {
    word: "star",
    emoji: "⭐",
    similarWords: [
      { word: "car", emoji: "🚗" },
      { word: "jar", emoji: "🫙" },
      { word: "guitar", emoji: "🎸" },
    ],
  },
  {
    word: "moon",
    emoji: "🌙",
    similarWords: [
      { word: "spoon", emoji: "🥄" },
      { word: "balloon", emoji: "🎈" },
      { word: "soon", emoji: "⏰" },
    ],
  },
  {
    word: "fish",
    emoji: "🐟",
    similarWords: [
      { word: "dish", emoji: "🍽️" },
      { word: "wish", emoji: "🌠" },
    ],
  },
];
