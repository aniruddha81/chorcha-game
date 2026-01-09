export interface SentenceQuestion {
   id: number;
   sentence: string; // Use ____ for the blank
   correctAnswer: string;
   options: string[];
   category: "grammar" | "vocabulary" | "idiom" | "logic";
   difficulty: 1 | 2 | 3;
}

export const SENTENCE_QUESTIONS: SentenceQuestion[] = [
   // Vocabulary
   {
      id: 1,
      sentence: "The company decided to ____ the product launch until they fixed the software bugs.",
      correctAnswer: "postpone",
      options: ["cancel", "postpone", "refuse", "prevent"],
      category: "vocabulary",
      difficulty: 2,
   },
   {
      id: 2,
      sentence: "I'm afraid I can't give you a ____ answer until I've consulted with my supervisor.",
      correctAnswer: "definite",
      options: ["definite", "loud", "bitter", "vast"],
      category: "vocabulary",
      difficulty: 2,
   },
   {
      id: 3,
      sentence: "To stay healthy, you should try to ____ a balance between work and exercise.",
      correctAnswer: "strike",
      options: ["do", "make", "strike", "take"],
      category: "vocabulary",
      difficulty: 2,
   },
   {
      id: 4,
      sentence: "The witness provided a ____ description of the suspect, helping the police make an arrest.",
      correctAnswer: "vivid",
      options: ["shallow", "vivid", "blunt", "mild"],
      category: "vocabulary",
      difficulty: 2,
   },
   {
      id: 5,
      sentence: "He has a very ____ schedule this week, so he might not be able to meet for lunch.",
      correctAnswer: "tight",
      options: ["heavy", "thick", "tight", "hard"],
      category: "vocabulary",
      difficulty: 2,
   },

   // Grammar
   {
      id: 6,
      sentence: "If I ____ more time, I would have finished the report yesterday.",
      correctAnswer: "had had",
      options: ["have", "had", "had had", "would have"],
      category: "grammar",
      difficulty: 3,
   },
   {
      id: 7,
      sentence: "Neither the manager nor the employees ____ aware of the schedule change.",
      correctAnswer: "were",
      options: ["was", "were", "is", "has been"],
      category: "grammar",
      difficulty: 2,
   },
   {
      id: 8,
      sentence: "She is very good ____ explaining complex mathematical theories to beginners.",
      correctAnswer: "at",
      options: ["at", "in", "with", "about"],
      category: "grammar",
      difficulty: 2,
   },
   {
      id: 9,
      sentence: "By the time we arrived at the cinema, the movie ____ already started.",
      correctAnswer: "had",
      options: ["has", "was", "had", "would"],
      category: "grammar",
      difficulty: 2,
   },
   {
      id: 10,
      sentence: "I look forward to ____ you at the conference next month.",
      correctAnswer: "meeting",
      options: ["meet", "meeting", "met", "be meeting"],
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
