export interface SentenceQuestion {
   id: number;
   sentence: string; // Use ____ for the blank
   correctAnswer: string;
   options: string[];
   category: "grammar" | "vocabulary" | "idiom" | "logic";
   difficulty: 1 | 2 | 3;
}

export const SENTENCE_QUESTIONS: SentenceQuestion[] = [
   // Grammar - Easy
   {
      id: 1,
      sentence: "She ____ to the store yesterday.",
      correctAnswer: "went",
      options: ["went", "go", "goes", "going"],
      category: "grammar",
      difficulty: 1,
   },
   {
      id: 2,
      sentence: "The cat ____ on the windowsill.",
      correctAnswer: "sat",
      options: ["sitting", "sit", "sat", "sits"],
      category: "grammar",
      difficulty: 1,
   },
   {
      id: 3,
      sentence: "I have ____ finished my homework.",
      correctAnswer: "already",
      options: ["yet", "already", "still", "never"],
      category: "grammar",
      difficulty: 1,
   },

   // Vocabulary - Easy
   {
      id: 4,
      sentence: "The sun rises in the ____.",
      correctAnswer: "east",
      options: ["west", "east", "north", "south"],
      category: "vocabulary",
      difficulty: 1,
   },
   {
      id: 5,
      sentence: "A group of wolves is called a ____.",
      correctAnswer: "pack",
      options: ["herd", "flock", "pack", "swarm"],
      category: "vocabulary",
      difficulty: 1,
   },

   // Idioms - Medium
   {
      id: 6,
      sentence: "It's raining cats and ____.",
      correctAnswer: "dogs",
      options: ["dogs", "birds", "fish", "mice"],
      category: "idiom",
      difficulty: 2,
   },
   {
      id: 7,
      sentence: "Don't put all your eggs in one ____.",
      correctAnswer: "basket",
      options: ["box", "basket", "bag", "bowl"],
      category: "idiom",
      difficulty: 2,
   },
   {
      id: 8,
      sentence: "A penny saved is a penny ____.",
      correctAnswer: "earned",
      options: ["lost", "earned", "spent", "found"],
      category: "idiom",
      difficulty: 2,
   },

   // Logic - Medium
   {
      id: 9,
      sentence: "If today is Monday, tomorrow is ____.",
      correctAnswer: "Tuesday",
      options: ["Sunday", "Tuesday", "Wednesday", "Monday"],
      category: "logic",
      difficulty: 2,
   },
   {
      id: 10,
      sentence: "Water freezes at ____ degrees Celsius.",
      correctAnswer: "zero",
      options: ["one", "zero", "ten", "hundred"],
      category: "logic",
      difficulty: 2,
   },

   // Grammar - Medium
   {
      id: 11,
      sentence: "Neither the teacher ____ the students were present.",
      correctAnswer: "nor",
      options: ["or", "and", "nor", "but"],
      category: "grammar",
      difficulty: 2,
   },
   {
      id: 12,
      sentence: "The book, ____ I borrowed from the library, was fascinating.",
      correctAnswer: "which",
      options: ["who", "which", "what", "whose"],
      category: "grammar",
      difficulty: 2,
   },

   // Vocabulary - Hard
   {
      id: 13,
      sentence: "The detective's ____ observation solved the case.",
      correctAnswer: "astute",
      options: ["dull", "astute", "careless", "random"],
      category: "vocabulary",
      difficulty: 3,
   },
   {
      id: 14,
      sentence: "Her ____ demeanor made everyone feel welcome.",
      correctAnswer: "affable",
      options: ["hostile", "affable", "indifferent", "anxious"],
      category: "vocabulary",
      difficulty: 3,
   },

   // Idioms - Hard
   {
      id: 15,
      sentence: "The ball is in your ____.",
      correctAnswer: "court",
      options: ["court", "field", "hands", "zone"],
      category: "idiom",
      difficulty: 3,
   },
   {
      id: 16,
      sentence: "She let the cat out of the ____.",
      correctAnswer: "bag",
      options: ["house", "bag", "box", "room"],
      category: "idiom",
      difficulty: 3,
   },

   // Logic - Hard
   {
      id: 17,
      sentence: "A triangle has ____ sides.",
      correctAnswer: "three",
      options: ["two", "three", "four", "five"],
      category: "logic",
      difficulty: 1,
   },
   {
      id: 18,
      sentence: "The opposite of 'ancient' is ____.",
      correctAnswer: "modern",
      options: ["old", "modern", "antique", "vintage"],
      category: "vocabulary",
      difficulty: 2,
   },

   // More Grammar
   {
      id: 19,
      sentence: "If I ____ you, I would accept the offer.",
      correctAnswer: "were",
      options: ["am", "was", "were", "be"],
      category: "grammar",
      difficulty: 3,
   },
   {
      id: 20,
      sentence: "This box is ____ than that one.",
      correctAnswer: "heavier",
      options: ["heavy", "heavier", "heaviest", "heavily"],
      category: "grammar",
      difficulty: 2,
   },
];

export const GAME_COLORS = {
   background: "#09090b",
   card: "#18181b",
   cardHover: "#27272a",
   primary: "#a855f7", // Purple theme for this game
   secondary: "#ec4899", // Pink accent
   success: "#4ade80",
   error: "#f87171",
   warning: "#fbbf24",
   text: "#ffffff",
   textMuted: "#a1a1aa",
   border: "#3f3f46",
};

export const CATEGORY_COLORS: Record<SentenceQuestion["category"], string> = {
   grammar: "#3b82f6", // Blue
   vocabulary: "#8b5cf6", // Purple
   idiom: "#f59e0b", // Amber
   logic: "#06b6d4", // Cyan
};

export const CATEGORY_ICONS: Record<SentenceQuestion["category"], string> = {
   grammar: "📝",
   vocabulary: "📚",
   idiom: "💬",
   logic: "🧠",
};
