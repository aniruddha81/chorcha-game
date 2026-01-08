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
      { word: "mat", emoji: "🧘" },
    ],
  },
  {
    word: "cat",
    emoji: "🐱",
    similarWords: [
      { word: "bat", emoji: "🦇" },
      { word: "hat", emoji: "🎩" },
      { word: "rat", emoji: "🐀" },
      { word: "mat", emoji: "🧘" },
    ],
  },
  {
    word: "bee",
    emoji: "🐝",
    similarWords: [
      { word: "tree", emoji: "🌳" },
      { word: "key", emoji: "🔑" },
      { word: "pea", emoji: "🫛" },
    ],
  },
  {
    word: "rain",
    emoji: "🌧️",
    similarWords: [
      { word: "train", emoji: "🚂" },
      { word: "plane", emoji: "✈️" },
      { word: "chain", emoji: "⛓️" },
      { word: "brain", emoji: "🧠" },
    ],
  },
  {
    word: "bear",
    emoji: "🐻",
    similarWords: [
      { word: "pear", emoji: "🍐" },
      { word: "chair", emoji: "🪑" },
      { word: "hair", emoji: "💇" },
      { word: "air", emoji: "💨" },
    ],
  },
  {
    word: "sun",
    emoji: "☀️",
    similarWords: [
      { word: "run", emoji: "🏃" },
      { word: "bun", emoji: "🍞" },
      { word: "fun", emoji: "🎉" },
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
      { word: "noon", emoji: "🕛" },
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
  {
    word: "snake",
    emoji: "🐍",
    similarWords: [
      { word: "cake", emoji: "🎂" },
      { word: "lake", emoji: "🏞️" },
      { word: "rake", emoji: "🍂" },
    ],
  },
  {
    word: "boat",
    emoji: "⛵",
    similarWords: [
      { word: "coat", emoji: "🧥" },
      { word: "goat", emoji: "🐐" },
      { word: "throat", emoji: "😷" },
    ],
  },
  {
    word: "clock",
    emoji: "🕐",
    similarWords: [
      { word: "block", emoji: "🧱" },
      { word: "rock", emoji: "🪨" },
      { word: "sock", emoji: "🧦" },
    ],
  },
  {
    word: "light",
    emoji: "💡",
    similarWords: [
      { word: "night", emoji: "🌃" },
      { word: "kite", emoji: "🪁" },
      { word: "fight", emoji: "🥊" },
    ],
  },
  {
    word: "sheep",
    emoji: "🐑",
    similarWords: [
      { word: "sleep", emoji: "😴" },
      { word: "deep", emoji: "🌊" },
      { word: "jeep", emoji: "🚙" },
    ],
  },
  {
    word: "flower",
    emoji: "🌸",
    similarWords: [
      { word: "tower", emoji: "🗼" },
      { word: "power", emoji: "⚡" },
      { word: "shower", emoji: "🚿" },
    ],
  },
  {
    word: "bell",
    emoji: "🔔",
    similarWords: [
      { word: "shell", emoji: "🐚" },
      { word: "smell", emoji: "👃" },
      { word: "well", emoji: "🪣" },
    ],
  },
  {
    word: "crown",
    emoji: "👑",
    similarWords: [
      { word: "clown", emoji: "🤡" },
      { word: "town", emoji: "🏘️" },
      { word: "brown", emoji: "🟤" },
    ],
  },
  {
    word: "whale",
    emoji: "🐋",
    similarWords: [
      { word: "tail", emoji: "🐕" },
      { word: "nail", emoji: "💅" },
      { word: "sail", emoji: "⛵" },
    ],
  },
  {
    word: "phone",
    emoji: "📱",
    similarWords: [
      { word: "bone", emoji: "🦴" },
      { word: "cone", emoji: "🍦" },
      { word: "stone", emoji: "🪨" },
    ],
  },
  {
    word: "watch",
    emoji: "⌚",
    similarWords: [
      { word: "catch", emoji: "🥎" },
      { word: "match", emoji: "🔥" },
      { word: "patch", emoji: "🩹" },
    ],
  },
  {
    word: "grape",
    emoji: "🍇",
    similarWords: [
      { word: "tape", emoji: "📼" },
      { word: "cape", emoji: "🦸" },
      { word: "shape", emoji: "⭕" },
    ],
  },
  {
    word: "bread",
    emoji: "🍞",
    similarWords: [
      { word: "bed", emoji: "🛏️" },
      { word: "thread", emoji: "🧵" },
      { word: "head", emoji: "🗣️" },
    ],
  },
  {
    word: "bird",
    emoji: "🐦",
    similarWords: [
      { word: "word", emoji: "📝" },
      { word: "heard", emoji: "👂" },
      { word: "third", emoji: "🥉" },
    ],
  },
  {
    word: "house",
    emoji: "🏠",
    similarWords: [
      { word: "mouse", emoji: "🐭" },
      { word: "blouse", emoji: "👚" },
    ],
  },
  {
    word: "throne",
    emoji: "👑",
    similarWords: [
      { word: "phone", emoji: "📱" },
      { word: "stone", emoji: "🪨" },
      { word: "bone", emoji: "🦴" },
    ],
  },
  {
    word: "castle",
    emoji: "🏰",
    similarWords: [
      { word: "battle", emoji: "⚔️" },
      { word: "rattle", emoji: "🍼" },
      { word: "cattle", emoji: "🐄" },
    ],
  },
  {
    word: "sword",
    emoji: "⚔️",
    similarWords: [
      { word: "board", emoji: "🛹" },
      { word: "cord", emoji: "🔌" },
      { word: "lord", emoji: "🤴" },
    ],
  },
  {
    word: "shield",
    emoji: "🛡️",
    similarWords: [
      { word: "field", emoji: "🌾" },
      { word: "yield", emoji: "🚦" },
    ],
  },
  {
    word: "temple",
    emoji: "🛕",
    similarWords: [
      { word: "simple", emoji: "✅" },
      { word: "dimple", emoji: "😊" },
    ],
  },
  {
    word: "pyramid",
    emoji: "🔺",
    similarWords: [
      { word: "lid", emoji: "🍲" },
      { word: "kid", emoji: "👶" },
    ],
  },
  {
    word: "scroll",
    emoji: "📜",
    similarWords: [
      { word: "bowl", emoji: "🥣" },
      { word: "goal", emoji: "⚽" },
      { word: "hole", emoji: "⛳" },
    ],
  },
  {
    word: "king",
    emoji: "🤴",
    similarWords: [
      { word: "ring", emoji: "💍" },
      { word: "wing", emoji: "🦅" },
      { word: "spring", emoji: "🌸" },
    ],
  },
  {
    word: "queen",
    emoji: "👸",
    similarWords: [
      { word: "green", emoji: "🟢" },
      { word: "bean", emoji: "🫘" },
      { word: "screen", emoji: "📺" },
    ],
  },
  {
    word: "armor",
    emoji: "🦾",
    similarWords: [
      { word: "farmer", emoji: "👨‍🌾" },
      { word: "hammer", emoji: "🔨" },
    ],
  },
  {
    word: "statue",
    emoji: "🗿",
    similarWords: [
      { word: "value", emoji: "💰" },
      { word: "rescue", emoji: "🆘" },
    ],
  },
  {
    word: "torch",
    emoji: "🔦",
    similarWords: [
      { word: "porch", emoji: "🏡" },
      { word: "march", emoji: "🚶" },
    ],
  },
  {
    word: "palace",
    emoji: "🏛️",
    similarWords: [
      { word: "callus", emoji: "🦶" },
      { word: "chalice", emoji: "🍷" },
    ],
  },
  {
    word: "tomb",
    emoji: "⚰️",
    similarWords: [
      { word: "room", emoji: "🚪" },
      { word: "boom", emoji: "💥" },
      { word: "broom", emoji: "🧹" },
    ],
  },
];
