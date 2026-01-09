import { MascotFeedback, MascotMood } from "@/components/MascotFeedback";
import { PieTimer } from "@/components/PieTimer";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const TIME_LIMIT = 60;
const BASE_SCORE = 500;

const GAME_COLORS = [
  { name: "Blue", color: "#3b82f6" },
  { name: "Red", color: "#ef4444" },
  { name: "Green", color: "#22c55e" },
  { name: "Orange", color: "#f97316" },
  { name: "Purple", color: "#a855f7" },
  { name: "Yellow", color: "#eab308" },
  { name: "Pink", color: "#ec4899" },
  { name: "Teal", color: "#14b8a6" },
  { name: "Indigo", color: "#6366f1" },
  { name: "Lime", color: "#84cc16" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Magenta", color: "#d946ef" },
];

export default function ColorMatchGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [score, setScore] = useState(0);
  const [lastAdded, setLastAdded] = useState<number | null>(null); // Track last points
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isActive, setIsActive] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [mascotMessage, setMascotMessage] = useState(
    "Does the word of left side match the color of right side?"
  );
  const [mascotMood, setMascotMood] = useState<MascotMood>("explain");
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);

  const [leftCard, setLeftCard] = useState({ text: "", color: "#000" });
  const [rightCard, setRightCard] = useState({ text: "", color: "" });

  const [selectedButton, setSelectedButton] = useState<"yes" | "no" | null>(
    null
  );
  const [buttonColor, setButtonColor] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsActive(false);
      // Show game over alert
      setTimeout(() => {
        Alert.alert("Time's Up!", `Game Over! Your final score: ${score}`, [
          {
            text: "Play Again",
            onPress: () => router.replace("/games/color-match"),
          },
          { text: "Home", onPress: () => router.back() },
        ]);
      }, 100);
      return;
    }
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isActive, score, router]);

  const generateRound = useCallback(() => {
    setButtonColor(null);
    setSelectedButton(null);
    const isMatch = Math.random() > 0.5;
    const meaningIdx = Math.floor(Math.random() * GAME_COLORS.length);
    const meaning = GAME_COLORS[meaningIdx];
    const rightTextIdx = Math.floor(Math.random() * GAME_COLORS.length);
    const rightText = GAME_COLORS[rightTextIdx];

    let inkColor;
    if (isMatch) {
      inkColor = meaning.color;
    } else {
      let randomColorIdx;
      do {
        randomColorIdx = Math.floor(Math.random() * GAME_COLORS.length);
      } while (GAME_COLORS[randomColorIdx].name === meaning.name);
      inkColor = GAME_COLORS[randomColorIdx].color;
    }

    setLeftCard({ text: meaning.name, color: "#000" });
    setRightCard({ text: rightText.name, color: inkColor });
  }, []);

  useEffect(() => {
    generateRound();
  }, []);

  const handleGuess = (userSaysMatch: boolean) => {
    if (!isActive || buttonColor !== null) return; // Prevent multiple clicks during feedback

    const rightColorObj = GAME_COLORS.find((c) => c.color === rightCard.color);
    const isActuallyMatch = leftCard.text === rightColorObj?.name;

    const isCorrect = userSaysMatch === isActuallyMatch;

    // Set which button was pressed
    setSelectedButton(userSaysMatch ? "yes" : "no");

    if (isCorrect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setButtonColor("#22c55e"); // Green for correct
      setScore((s) => s + BASE_SCORE);
      setLastAdded(BASE_SCORE);
      setMascotMood("happy");

      // Update streaks
      setCorrectStreak((prev) => prev + 1);
      setWrongStreak(0);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      setButtonColor("#ef4444"); // Red for incorrect
      setMascotMood("angry");

      // Deduct 300 points only if current score is greater than 300
      if (score > 300) {
        setScore((s) => s - 300);
        setLastAdded(-300);
      } else {
        setLastAdded(0); // Show +0 if score is too low to deduct
      }

      // Update streaks
      setWrongStreak((prev) => prev + 1);
      setCorrectStreak(0);
    }

    setQuestionNumber((prev) => prev + 1);

    // Calculate new streak value for feedback
    const newStreakValue = isCorrect ? correctStreak + 1 : wrongStreak + 1;

    // Show feedback immediately
    const feedbackMsg = getFeedbackMessage(isCorrect, newStreakValue);
    setMascotMessage(feedbackMsg);

    // Calculate typing duration (40ms per char) + buffer
    const typingDuration = feedbackMsg.length * 40;
    const delay = isCorrect ? 800 : Math.max(1500, typingDuration + 300);

    // Wait before generating next round
    setTimeout(() => {
      generateRound();
    }, delay);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.levelText}>Level 2</Text>

        <View style={styles.scoreContainer}>
          {lastAdded !== null && (
            <Animated.Text
              key={`points-${score}-${lastAdded}`} // Key ensures animation re-runs
              entering={FadeInUp}
              style={[
                styles.pointsAdded,
                { color: lastAdded > 0 ? "#50C878" : "#EF4444" }, // Green if positive, Red if negative/zero
              ]}
            >
              {lastAdded > 0 ? `+${lastAdded}` : lastAdded}
            </Animated.Text>
          )}
          <Text style={styles.totalPoints}>{score} pt</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        {/* Timer above cards */}
        <View style={styles.timerContainer}>
          <PieTimer remaining={timeLeft} total={TIME_LIMIT} />
        </View>

        <View style={styles.cardsRow}>
          <Animated.View
            key={`l-${leftCard.text}-${score}`}
            entering={ZoomIn}
            style={styles.card}
          >
            <Text style={[styles.mainText, { color: leftCard.color }]}>
              {leftCard.text}
            </Text>
          </Animated.View>

          <Animated.View
            key={`r-${rightCard.text}-${score}`}
            entering={ZoomIn}
            style={styles.card}
          >
            <Text style={[styles.mainText, { color: rightCard.color }]}>
              {rightCard.text}
            </Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.noButton,
            selectedButton === "no" && buttonColor
              ? { backgroundColor: buttonColor }
              : null,
          ]}
          onPress={() => handleGuess(false)}
        >
          <Text style={styles.buttonText}>No</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.yesButton,
            selectedButton === "yes" && buttonColor
              ? { backgroundColor: buttonColor }
              : null,
          ]}
          onPress={() => handleGuess(true)}
        >
          <Text style={styles.buttonText}>Yes</Text>
        </TouchableOpacity>
      </View>

      {/* Mascot - Fixed at bottom */}
      <View style={[styles.mascotSpace, { paddingBottom: insets.bottom }]}>
        <MascotFeedback text={mascotMessage} mood={mascotMood} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    height: 60,
  },
  levelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  timerWrapper: {
    width: 40,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreContainer: {
    alignItems: "flex-end",
    minWidth: 80, // Prevent jumping
  },
  pointsAdded: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalPoints: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: -4,
  },
  timerContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  gameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 15,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    aspectRatio: 0.78,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  mainText: {
    fontSize: 42, // Adjusted slightly for better fit
    fontWeight: "500",
  },
  controls: {
    flexDirection: "row",
    paddingHorizontal: 25,
    gap: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 75,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  noButton: {
    backgroundColor: "#E0E0E0",
    // borderColor: "#45AD68",
  },
  yesButton: {
    backgroundColor: "#E0E0E0",
  },
  buttonText: {
    fontSize: 32,
    color: "#444",
    fontWeight: "500",
  },
  mascotSpace: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
