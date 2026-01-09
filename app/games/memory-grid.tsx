import { GameResult } from "@/components/GameResult";
import { Grid } from "@/components/Grid";
import { MascotFeedback, MascotMood } from "@/components/MascotFeedback";
import { COLORS, LEVELS, MAX_GRID_SIZE } from "@/constants/gameConfig";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Game States
type GameStatus =
  | "IDLE"
  | "SHOWING_PATTERN"
  | "WAITING_INPUT"
  | "VALIDATING"
  | "GAME_OVER"
  | "LEVEL_COMPLETE";

export default function GameScreen() {
  const screenWidth = Dimensions.get("window").width;

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>("IDLE");
  const [mascotMessage, setMascotMessage] = useState("");
  const [mascotMood, setMascotMood] = useState<MascotMood>("explain");
  const [showResult, setShowResult] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);

  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [validatedCells, setValidatedCells] = useState<{ id: number; correct: boolean }[]>([]);

  const currentLevelConfig = LEVELS[Math.min(currentLevelIndex, LEVELS.length - 1)];

  // Calculate max possible score (sum of level * 100 for all levels completed)
  const calculateMaxScore = (levelIndex: number) => {
    let max = 0;
    for (let i = 0; i <= levelIndex; i++) {
      max += LEVELS[i].level * 100;
    }
    return max;
  };

  // Calculate score percentage
  const getScorePercentage = () => {
    const maxScore = calculateMaxScore(currentLevelIndex);
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  };

  // Reset game state
  const resetGame = () => {
    setLives(3);
    setScore(0);
    setCurrentLevelIndex(0);
    setValidatedCells([]);
    setUserSelection([]);
    setPattern([]);
    setMascotMessage("");
    setShowResult(false);
    setIsVictory(false);
    setStatus("IDLE");
  };

  // Start Level
  const startLevel = useCallback(() => {
    setStatus("SHOWING_PATTERN");
    // Only show tutorial message on first level
    if (currentLevelIndex === 0) {
      setMascotMessage("Remember the green tiles");
    } else {
      setMascotMessage("");
    }
    setUserSelection([]);
    setValidatedCells([]);

    // Generate Random Pattern
    const totalCells = currentLevelConfig.rows * currentLevelConfig.cols;
    const newPattern: number[] = [];
    while (newPattern.length < currentLevelConfig.activeCells) {
      const randomIndex = Math.floor(Math.random() * totalCells);
      if (!newPattern.includes(randomIndex)) {
        newPattern.push(randomIndex);
      }
    }
    setPattern(newPattern);

    // Hide Pattern after duration
    setTimeout(() => {
      setStatus("WAITING_INPUT");
      // Only show tutorial message on first level
      if (currentLevelIndex === 0) {
        setMascotMessage("Do you remember them?");
      } else {
        setMascotMessage("");
      }
    }, currentLevelConfig.showDuration);
  }, [currentLevelConfig, currentLevelIndex]);

  // Initial Start
  useEffect(() => {
    if (status === "IDLE") {
      // Small delay before starting
      setTimeout(startLevel, 500);
    }
  }, [status, startLevel]);

  const handleCellPress = (id: number) => {
    if (status !== "WAITING_INPUT") return;

    // Prevent pressing already validated cells
    if (validatedCells.some((v) => v.id === id)) return;

    const isCorrect = pattern.includes(id);

    if (isCorrect) {
      // Mark as correct immediately
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newValidated = [...validatedCells, { id, correct: true }];
      setValidatedCells(newValidated);

      // Check if all pattern cells have been found
      const correctCount = newValidated.filter((v) => v.correct).length;
      if (correctCount === pattern.length) {
        // Level Complete!
        setScore((s) => s + currentLevelConfig.level * 100);
        setMascotMood("happy");
        setCorrectStreak((prev) => prev + 1);
        setWrongStreak(0);

        const feedbackMsg = currentLevelIndex > 0 ? getFeedbackMessage(true, correctStreak + 1) : "";
        if (feedbackMsg) setMascotMessage(feedbackMsg);

        const typingDuration = feedbackMsg.length * 40;
        const delay = Math.max(800, typingDuration + 300);

        setStatus("VALIDATING");

        setTimeout(() => {
          if (currentLevelIndex + 1 < LEVELS.length) {
            setValidatedCells([]);
            setUserSelection([]);
            setPattern([]);
            setCurrentLevelIndex((prev) => prev + 1);
            setStatus("IDLE");
          } else {
            setIsVictory(true);
            setShowResult(true);
          }
        }, delay);
      }
    } else {
      // Wrong answer - mark as incorrect, show feedback, then restart level
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setValidatedCells((prev) => [...prev, { id, correct: false }]);
      setLives((l) => l - 1);
      setMascotMood("angry");
      setWrongStreak((prev) => prev + 1);
      setCorrectStreak(0);

      setStatus("VALIDATING");

      const feedbackMsg = currentLevelIndex > 0 ? getFeedbackMessage(false, wrongStreak + 1) : "";
      if (feedbackMsg) setMascotMessage(feedbackMsg);

      // Show the correct pattern after wrong answer
      const missedCells = pattern.filter(
        (pId) => !validatedCells.some((v) => v.id === pId)
      );
      setTimeout(() => {
        setValidatedCells((prev) => [
          ...prev,
          ...missedCells.map((pId) => ({ id: pId, correct: true })),
        ]);
      }, 300);

      const typingDuration = feedbackMsg.length * 40;
      const delay = Math.max(1500, typingDuration + 500);

      setTimeout(() => {
        if (lives - 1 <= 0) {
          setStatus("GAME_OVER");
          setIsVictory(false);
          setShowResult(true);
        } else {
          // Retry same level with new pattern
          setValidatedCells([]);
          setUserSelection([]);
          setPattern([]);
          setMascotMessage("");
          setStatus("IDLE");
        }
      }, delay);
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.levelText}>Level {currentLevelConfig.level}</Text>
          <Text style={styles.subText}>Memorize {currentLevelConfig.activeCells} blocks</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.livesText}>Lives: {lives}</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>

      {/* Grid Area - Centered */}
      <View style={styles.gridWrapper}>
        <View style={styles.gridContainer}>
          <Grid
            rows={currentLevelConfig.rows}
            cols={currentLevelConfig.cols}
            activeCells={pattern}
            selectedCells={userSelection}
            validatedCells={validatedCells}
            onCellPress={handleCellPress}
            isInteractionEnabled={status === "WAITING_INPUT"}
            isShowingPattern={status === "SHOWING_PATTERN"}
            width={Math.min(screenWidth - 48, MAX_GRID_SIZE)}
          />
        </View>
      </View>

      {/* Mascot - Always visible */}
      <View style={styles.mascotContainer}>
        <MascotFeedback text={mascotMessage} mood={mascotMood} />
      </View>

      {/* Game Result Overlay */}
      {showResult && (
        <GameResult
          scorePercentage={getScorePercentage()}
          onRetry={resetGame}
          averageScore={isVictory ? 50 : 70}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Assuming this is a light color
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20, // Add some top padding below the safe area/nav bar
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Align to top to handle multi-line text better
  },
  levelText: {
    color: "#1F2937", // Dark gray (Tailwind gray-800 equivalent) for better visibility
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subText: {
    color: "#6B7280", // Gray-500
    fontSize: 15,
    fontWeight: "500",
  },
  stats: {
    alignItems: "flex-end",
    backgroundColor: "#F3F4F6", // Slight background for stats pill? Optional. removing for now to keep it clean
    borderRadius: 12,
  },
  livesText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  gridWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  gridContainer: {
    // Removed the border and large white box for a cleaner look
    // If a card look is desired, we can add shadow here instead:
    // backgroundColor: 'white',
    // borderRadius: 20,
    // padding: 20,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    // elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 10,
  },
});
