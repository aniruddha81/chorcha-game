export type Subject = "math" | "gk" | "vocab" | "english";

export interface Question {
  id: string;
  type: Subject;
  text: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  difficulty: "easy" | "medium" | "hard";
}

export const WORDS = [
  { scrambled: "PLEAP", original: "APPLE", hint: "A red fruit" },
  { scrambled: "NAAABN", original: "BANANA", hint: "A yellow fruit" },
  { scrambled: "OHUSE", original: "HOUSE", hint: "Where you live" },
  { scrambled: "RTEWA", original: "WATER", hint: "You drink this" },
  { scrambled: "DORNU", original: "ROUND", hint: "Shape of a ball" },
  { scrambled: "HAPYC", original: "HAPPY", hint: "Opposite of sad" },
  { scrambled: "TRAST", original: "START", hint: "Opposite of stop" },
  { scrambled: "LOHOCS", original: "SCHOOL", hint: "Place to learn" },
];

export const QUESTIONS: Question[] = [
  // --- MATH ---
  {
    id: "m1",
    type: "math",
    text: "What is 5 + 7?",
    options: ["10", "11", "12", "13"],
    correctAnswerIndex: 2,
    difficulty: "easy",
  },
  {
    id: "m2",
    type: "math",
    text: "What is 15 - 6?",
    options: ["8", "9", "10", "7"],
    correctAnswerIndex: 1,
    difficulty: "easy",
  },
  {
    id: "m3",
    type: "math",
    text: "What is 8 x 4?",
    options: ["24", "30", "32", "36"],
    correctAnswerIndex: 2,
    difficulty: "medium",
  },
  {
    id: "m4",
    type: "math",
    text: "What is 100 / 5?",
    options: ["20", "25", "10", "50"],
    correctAnswerIndex: 0,
    difficulty: "medium",
  },
  {
    id: "m5",
    type: "math",
    text: "What is the next number: 2, 4, 6, 8, ...?",
    options: ["9", "10", "11", "12"],
    correctAnswerIndex: 1,
    difficulty: "easy",
  },

  // --- GK (General Knowledge) ---
  {
    id: "gk1",
    type: "gk",
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    correctAnswerIndex: 2,
    difficulty: "easy",
  },
  {
    id: "gk2",
    type: "gk",
    text: "What is the capital of France?",
    options: ["London", "Berlin", "Madrid", "Paris"],
    correctAnswerIndex: 3,
    difficulty: "easy",
  },
  {
    id: "gk3",
    type: "gk",
    text: "Which animal is known as the King of the Jungle?",
    options: ["Tiger", "Elephant", "Lion", "Giraffe"],
    correctAnswerIndex: 2,
    difficulty: "easy",
  },
  {
    id: "gk4",
    type: "gk",
    text: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    correctAnswerIndex: 2,
    difficulty: "medium",
  },
  {
    id: "gk5",
    type: "gk",
    text: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Silver"],
    correctAnswerIndex: 2,
    difficulty: "medium",
  },

  // --- VOCABULARY ---
  {
    id: "v1",
    type: "vocab",
    text: 'What is a synonym for "Happy"?',
    options: ["Sad", "Joyful", "Angry", "Tired"],
    correctAnswerIndex: 1,
    difficulty: "easy",
  },
  {
    id: "v2",
    type: "vocab",
    text: 'What is the opposite of "Hot"?',
    options: ["Warm", "Cold", "Spicy", "Dry"],
    correctAnswerIndex: 1,
    difficulty: "easy",
  },
  {
    id: "v3",
    type: "vocab",
    text: 'Which word means "very big"?',
    options: ["Tiny", "Huge", "Small", "Little"],
    correctAnswerIndex: 1,
    difficulty: "easy",
  },
  {
    id: "v4",
    type: "vocab",
    text: 'What is a synonym for "Smart"?',
    options: ["Intelligent", "Funny", "Kind", "Slow"],
    correctAnswerIndex: 0,
    difficulty: "medium",
  },
  {
    id: "v5",
    type: "vocab",
    text: 'What is the opposite of "Ancient"?',
    options: ["Old", "Modern", "Historic", "Past"],
    correctAnswerIndex: 1,
    difficulty: "medium",
  },

  // --- ENGLISH ---
  {
    id: "e1",
    type: "english",
    text: "Choose the correct spelling:",
    options: ["Recieve", "Receive", "Receve", "Riceive"],
    correctAnswerIndex: 1,
    difficulty: "medium",
  },
  {
    id: "e2",
    type: "english",
    text: "I ___ to the store yesterday.",
    options: ["go", "gone", "went", "going"],
    correctAnswerIndex: 2,
    difficulty: "easy",
  },
  {
    id: "e3",
    type: "english",
    text: "She ___ playing football.",
    options: ["is", "are", "am", "be"],
    correctAnswerIndex: 0,
    difficulty: "easy",
  },
  {
    id: "e4",
    type: "english",
    text: 'Identify the noun: "The cat runs fast."',
    options: ["The", "cat", "runs", "fast"],
    correctAnswerIndex: 1,
    difficulty: "medium",
  },
  {
    id: "e5",
    type: "english",
    text: "Which one is a vowel?",
    options: ["B", "C", "O", "T"],
    correctAnswerIndex: 2,
    difficulty: "easy",
  },
];
