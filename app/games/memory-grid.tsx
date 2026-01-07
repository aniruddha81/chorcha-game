import { Grid } from "@/components/Grid";
import { MascotFeedback } from "@/components/MascotFeedback"; // Import
import { COLORS, LEVELS } from "@/constants/gameConfig";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Game States
type GameStatus =
  | "IDLE"
  | "SHOWING_PATTERN"
  | "WAITING_INPUT"
  | "VALIDATING"
  | "GAME_OVER"
  | "LEVEL_COMPLETE";

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>("IDLE");
  const [mascotMessage, setMascotMessage] = useState("");

  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [validatedCells, setValidatedCells] = useState<
    { id: number; correct: boolean }[]
  >([]);

  const currentLevelConfig = LEVELS[currentLevelIndex];

  // Start Level
  const startLevel = useCallback(() => {
    setStatus("SHOWING_PATTERN");
    setMascotMessage("Remember the green tiles"); // Set message here
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
      setMascotMessage("Do you remember them?"); // Update message
    }, currentLevelConfig.showDuration);
  }, [currentLevelConfig]);

  // Initial Start
  useEffect(() => {
    if (status === "IDLE") {
      // Small delay before starting
      setTimeout(startLevel, 500);
    }
  }, [status, startLevel]);

  const handleCellPress = (id: number) => {
    if (status !== "WAITING_INPUT") return;

    // Toggle selection
    if (userSelection.includes(id)) {
      setUserSelection((prev) => prev.filter((item) => item !== id));
    } else {
      if (userSelection.length < currentLevelConfig.activeCells) {
        const newSelection = [...userSelection, id];
        setUserSelection(newSelection);

        // Auto-submit when user completes selection
        if (newSelection.length === currentLevelConfig.activeCells) {
          setTimeout(() => validateGuess(newSelection), 300);
        }
      }
    }
  };

  const validateGuess = (selection: number[]) => {
    if (selection.length === 0) return;

    setStatus("VALIDATING");

    // Validate
    const correctGuesses = selection.filter((id) => pattern.includes(id));
    const wrongGuesses = selection.filter((id) => !pattern.includes(id));
    const missedCells = pattern.filter((id) => !selection.includes(id));

    const validationResults = [
      ...correctGuesses.map((id) => ({ id, correct: true })),
      ...wrongGuesses.map((id) => ({ id, correct: false })),
      // Show missed cells as correct (they were part of the pattern)
      ...missedCells.map((id) => ({ id, correct: true })),
    ];

    setValidatedCells(validationResults);

    const isPerfect =
      correctGuesses.length === pattern.length && wrongGuesses.length === 0;

    if (isPerfect) {
      // Success - Add points only if all correct
      setMascotMessage("Wow, nice.. you are awesome");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore((s) => s + currentLevelConfig.level * 100);
      setTimeout(() => {
        if (currentLevelIndex + 1 < LEVELS.length) {
          // Reset grid state immediately before level transition
          setValidatedCells([]);
          setUserSelection([]);
          setPattern([]);

          setStatus("LEVEL_COMPLETE");
          setCurrentLevelIndex((prev) => prev + 1);
          setStatus("IDLE"); // This triggers the useEffect to start next level
        } else {
          Alert.alert("Victory!", "You completed all levels!", [
            { text: "Home", onPress: () => router.back() },
          ]);
        }
      }, 1000);
    } else {
      // Failure - Show correct answer but no points added
      setMascotMessage("Oh no let me show you again");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLives((l) => l - 1);

      // Show the correct pattern for 2 seconds then proceed
      setTimeout(() => {
        if (lives - 1 <= 0) {
          setStatus("GAME_OVER");
          Alert.alert("Game Over", `Score: ${score}`, [
            {
              text: "Try Again",
              onPress: () => {
                // Reset Game
                setLives(3);
                setScore(0);
                setCurrentLevelIndex(0);
                setValidatedCells([]);
                setUserSelection([]);
                setPattern([]);
                setMascotMessage(""); // Clear message
                setStatus("IDLE");
              },
            },
            { text: "Home", onPress: () => router.back() },
          ]);
        } else {
          // Retry same level with NEW pattern
          setValidatedCells([]);
          setUserSelection([]);
          setPattern([]);
          setMascotMessage(""); // Clear message
          setStatus("IDLE");
        }
      }, 2000);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.levelText}>Level {currentLevelConfig.level}</Text>
          <Text style={styles.subText}>
            Memorize {currentLevelConfig.activeCells} blocks
          </Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.livesText}>Lives: {lives}</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>

      {/* Grid Area */}
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
          width={Math.min(screenWidth - 40, currentLevelConfig.gridSize + 40)} // Max width constraint
        />
      </View>

      {/* Mascot / Footer */}
      <View style={styles.mascotContainer}>
        <MascotFeedback text={mascotMessage} />
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
  levelText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  subText: {
    color: "#a1a1aa",
    fontSize: 14,
  },
  stats: {
    alignItems: "flex-end",
  },
  livesText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "bold",
  },
  scoreText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  gridContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 10,
    marginVertical: 40,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(157, 157, 157, 0.4)",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "flex-end",
  },
  mascotContainer: {
    width: "100%",
    alignItems: "center",
  },
  // removed unused instructionText styles as we use mascot now
});
