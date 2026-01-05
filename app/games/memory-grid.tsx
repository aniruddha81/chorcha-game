import { Grid } from "@/components/Grid";
import { COLORS, LEVELS } from "@/constants/gameConfig";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
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

  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [validatedCells, setValidatedCells] = useState<
    { id: number; correct: boolean }[]
  >([]);

  const currentLevelConfig = LEVELS[currentLevelIndex];

  // Start Level
  const startLevel = useCallback(() => {
    setStatus("SHOWING_PATTERN");
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
        setUserSelection((prev) => [...prev, id]);
      }
    }
  };

  const submitGuess = () => {
    if (userSelection.length === 0) return;

    setStatus("VALIDATING");

    // Validate
    const correctGuesses = userSelection.filter((id) => pattern.includes(id));
    const wrongGuesses = userSelection.filter((id) => !pattern.includes(id));
    const missedFn = pattern.filter((id) => !userSelection.includes(id));

    const validationResults = [
      ...correctGuesses.map((id) => ({ id, correct: true })),
      ...wrongGuesses.map((id) => ({ id, correct: false })),
      // Optionally show missed ones? For now, let's just show what user clicked
    ];

    setValidatedCells(validationResults);

    const isPerfect =
      correctGuesses.length === pattern.length && wrongGuesses.length === 0;

    if (isPerfect) {
      // Success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore((s) => s + currentLevelConfig.level * 100); // Points logic
      setTimeout(() => {
        if (currentLevelIndex + 1 < LEVELS.length) {
          setStatus("LEVEL_COMPLETE"); // Or just go next immediately
          setCurrentLevelIndex((prev) => prev + 1);
          setStatus("IDLE"); // This triggers the useEffect to start next level
        } else {
          Alert.alert("Victory!", "You completed all levels!", [
            { text: "Home", onPress: () => router.back() },
          ]);
        }
      }, 1000);
    } else {
      // Failure
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLives((l) => l - 1);

      // Show the actual pattern then reset or game over
      // For now, simple delay then retry or game over
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
                setStatus("IDLE");
              },
            },
            { text: "Home", onPress: () => router.back() },
          ]);
        } else {
          // Retry same level with NEW pattern
          setStatus("IDLE");
        }
      }, 1500);
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

      {/* Footer / Controls */}
      <View style={styles.footer}>
        {status === "WAITING_INPUT" && (
          <Animated.View entering={SlideInDown.duration(300)}>
            <TouchableOpacity
              style={[
                styles.button,
                userSelection.length !== currentLevelConfig.activeCells &&
                  styles.buttonDisabled,
              ]}
              onPress={submitGuess}
              disabled={userSelection.length !== currentLevelConfig.activeCells}
            >
              <Text style={styles.buttonText}>
                {userSelection.length === currentLevelConfig.activeCells
                  ? "Submit Guess"
                  : `Select ${currentLevelConfig.activeCells - userSelection.length} more`}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {status === "SHOWING_PATTERN" && (
          <Animated.Text entering={FadeIn} style={styles.instructionText}>
            Watch the pattern...
          </Animated.Text>
        )}
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
  },
  footer: {
    padding: 20,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: COLORS.inactive,
    shadowOpacity: 0,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
  instructionText: {
    color: "#fff",
    fontSize: 18,
    fontStyle: "italic",
  },
});
