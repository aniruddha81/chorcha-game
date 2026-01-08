// Fun and encouraging feedback messages

export const CORRECT_MESSAGES = [
  "Awesome! 🎉",
  "You're on fire! 🔥",
  "Perfect! Keep going! ✨",
  "Brilliant work! 🌟",
  "You're crushing it! 💪",
  "Unstoppable! 🚀",
  "Amazing streak! ⭐",
  "You're a genius! 🧠",
];

export const WRONG_MESSAGES = [
  "Oops! Try again! 💭",
  "Don't worry, you got this! 💪",
  "Almost there! Keep trying! 🎯",
  "No worries! Give it another shot! 😊",
  "Don't give up! You can do it! 🌈",
  "Stay focused! You're learning! 📚",
  "Keep practicing! You'll get it! ⭐",
  "Mistakes help us learn! Try again! 🌟",
];

/**
 * Get a feedback message based on the streak count
 * @param isCorrect Whether the answer was correct
 * @param streakCount How many consecutive correct/wrong answers (1-indexed)
 * @returns Appropriate feedback message
 */
export function getFeedbackMessage(
  isCorrect: boolean,
  streakCount: number
): string {
  const messages = isCorrect ? CORRECT_MESSAGES : WRONG_MESSAGES;
  // Use modulo to cycle through messages if streak is longer than array
  const index = (streakCount - 1) % messages.length;
  return messages[index];
}
