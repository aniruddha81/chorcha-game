import { COLORS } from "@/constants/gameConfig";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Game Constants
const TIME_LIMIT = 60; // 60 seconds
const BASE_SCORE = 100;

// Colors for the game
const GAME_COLORS = [
  { name: "RED", color: "#ef4444" }, // red-500
  { name: "BLUE", color: "#3b82f6" }, // blue-500
  { name: "GREEN", color: "#22c55e" }, // green-500
  { name: "YELLOW", color: "#eab308" }, // yellow-500
  { name: "BLACK", color: "#ffffff" }, // Use white for "Black" in dark mode for visibility, or actual black if background allows. Let's use White for contrast but call it "White" or "Black"?
  // The Stroop test usually uses White Background.
  // On Dark Mode, "BLACK" text should probably be White color if the word is "WHITE"?
  // Let's stick to visible colors on dark bg.
  { name: "PURPLE", color: "#a855f7" }, // purple-500
  { name: "ORANGE", color: "#f97316" }, // orange-500
];

export default function ColorMatchGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [lives, setLives] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [streak, setStreak] = useState(0);

  // Card State
  const [leftCard, setLeftCard] = useState({ text: "", color: "" }); // Meaning
  const [rightCard, setRightCard] = useState({ text: "", color: "" }); // Ink Color

  // Logic: Match if Left.text (Meaning) === Right.color (Ink's Name)
  // Wait, standard Stroop:
  // "Does the Text on the Left match the Color on the Right?"
  // User Prompt: "Meaning matches Color?"

  // Implementation:
  // Left Card: Shows text "RED" (in white color)
  // Right Card: Shows text "black" (in RED color)
  // Result: MATCH (Left says RED, Right is RED)

  const generateRound = useCallback(() => {
    // 50% chance of match
    const isMatch = Math.random() > 0.5;

    // Pick random meaning for Left
    const meaningIdx = Math.floor(Math.random() * GAME_COLORS.length);
    const meaning = GAME_COLORS[meaningIdx];

    // Pick random text for Right (doesn't matter much, just distraction)
    const rightTextIdx = Math.floor(Math.random() * GAME_COLORS.length);
    const rightText = GAME_COLORS[rightTextIdx];

    let inkColor;
    if (isMatch) {
      // Ink must match Left Meaning
      inkColor = meaning.color;
    } else {
      // Ink must NOT match Left Meaning
      // Pick random color until it's different
      let randomColorIdx;
      do {
        randomColorIdx = Math.floor(Math.random() * GAME_COLORS.length);
      } while (GAME_COLORS[randomColorIdx].name === meaning.name);
      inkColor = GAME_COLORS[randomColorIdx].color;
    }

    setLeftCard({ text: meaning.name, color: "#ffffff" }); // Left is just text (Meaning)
    setRightCard({ text: rightText.name, color: inkColor }); // Right is colored text
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(TIME_LIMIT);
    setIsActive(true);
    setStreak(0);
    generateRound();
  };

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0 || lives <= 0) {
      setIsActive(false);
      Alert.alert("Game Over", `Score: ${score}\nBest Streak: ${streak}`, [
        { text: "Try Again", onPress: startGame },
        { text: "Menu", onPress: () => router.back() },
      ]);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, lives]);

  const handleGuess = (userSaysMatch: boolean) => {
    if (!isActive) return;

    // Check actual match
    // Left Text (Meaning) vs Right Color (Ink)
    // We need to find the COLOR NAME of the Right Card's Color
    const rightColorName = GAME_COLORS.find(
      (c) => c.color === rightCard.color
    )?.name;
    const isActuallyMatch = leftCard.text === rightColorName;

    if (userSaysMatch === isActuallyMatch) {
      // Correct
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const streakBonus = Math.floor(streak / 5) * 50;
      setScore((s) => s + BASE_SCORE + streakBonus);
      setStreak((s) => s + 1);
      generateRound();
    } else {
      // Wrong
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLives((l) => l - 1);
      setStreak(0);
      generateRound(); // Still New Round? Yes
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Color Match</Text>
          <Text style={styles.subText}>
            {timeLeft}s | Lives: {lives}
          </Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.streakText}>Streak: {streak}</Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        <Text style={styles.instruction}>
          Does the meaning match the color?
        </Text>

        <View style={styles.cardsContainer}>
          {/* Left Card - Meaning */}
          <Animated.View
            key={`left-${score}`}
            entering={ZoomIn}
            style={[styles.card, styles.leftCard]}
          >
            <Text style={styles.cardLabel}>MEANING</Text>
            <Text style={[styles.cardText, { color: "#fff" }]}>
              {leftCard.text}
            </Text>
          </Animated.View>

          {/* Right Card - Color */}
          <Animated.View
            key={`right-${score}`}
            entering={ZoomIn.delay(50)}
            style={[styles.card, styles.rightCard]}
          >
            <Text style={styles.cardLabel}>COLOR</Text>
            <Text style={[styles.cardText, { color: rightCard.color }]}>
              {rightCard.text}
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.noButton]}
          onPress={() => handleGuess(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>NO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.yesButton]}
          onPress={() => handleGuess(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>YES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  subText: {
    color: "#a1a1aa",
    marginTop: 4,
  },
  stats: {
    alignItems: "flex-end",
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "bold",
  },
  streakText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: "bold",
  },
  gameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  instruction: {
    color: "#a1a1aa",
    fontSize: 18,
    marginBottom: 40,
  },
  cardsContainer: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
    justifyContent: "space-around",
  },
  card: {
    backgroundColor: COLORS.card,
    width: "45%",
    aspectRatio: 0.8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
    padding: 10,
  },
  leftCard: {
    borderColor: COLORS.primary,
  },
  rightCard: {
    borderColor: COLORS.error, // or just differentiate
  },
  cardLabel: {
    color: "#555",
    fontSize: 12,
    fontWeight: "bold",
    position: "absolute",
    top: 15,
    letterSpacing: 2,
  },
  cardText: {
    fontSize: 32,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  controls: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 40,
    gap: 20,
    height: 140,
  },
  button: {
    flex: 1,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  noButton: {
    backgroundColor: COLORS.error,
  },
  yesButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
  },
});
