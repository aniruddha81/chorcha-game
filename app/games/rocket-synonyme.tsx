import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Types
interface Question {
  word: string;
  options: [string, string]; // Only 2 options
  answer: string;
}

const DATA: Question[] = [
  { word: "impair", options: ["damage", "mend"], answer: "damage" },
  { word: "domesticate", options: ["tame", "release"], answer: "tame" },
  { word: "reconcile", options: ["resolve", "alienate"], answer: "resolve" },
  {
    word: "reinforce",
    options: ["strengthen", "weaken"],
    answer: "strengthen",
  },
  {
    word: "infamous",
    options: ["notorious", "respectable"],
    answer: "notorious",
  },
  { word: "cease", options: ["stop", "continue"], answer: "stop" },
  { word: "diligent", options: ["hardworking", "lazy"], answer: "hardworking" },
  { word: "melancholy", options: ["sad", "happy"], answer: "sad" },
  { word: "abundant", options: ["plentiful", "scarce"], answer: "plentiful" },
  { word: "tranquil", options: ["peaceful", "chaotic"], answer: "peaceful" },
];

const TIMER_LIMIT = 30;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Rocket vertical position boundaries

const ROCKET_TOP_Y = 10; // Top position (boost limit)
const ROCKET_MAX_Y = SCREEN_HEIGHT - 120; // keep some room so it doesn't go under the quiz
// Maximum fall position (bottom of game area)

const ROCKET_MIDDLE_Y = ROCKET_MAX_Y / 2; // Middle of game area (starting position)

// Movement speeds
const DRIFT_DOWN_SPEED = (ROCKET_MAX_Y - 10 - ROCKET_MIDDLE_Y) / TIMER_LIMIT; // pixels per second to drift down
const CORRECT_ANSWER_BOOST = 50; // pixels up on correct
const WRONG_ANSWER_PENALTY = 60; // pixels down on wrong

export default function RocketSynonymGame() {
  // State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(TIMER_LIMIT);
  const [wrongStreak, setWrongStreak] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Rocket vertical position (moves up/down)
  const rocketY = useSharedValue(ROCKET_MIDDLE_Y);

  const animatedRocketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rocketY.value }],
  }));

  // Reset game
  const resetGame = useCallback(() => {
    setLives(3);
    setScore(0);
    setTimer(TIMER_LIMIT);
    setWrongStreak(0);
    setGameOver(false);
    rocketY.value = ROCKET_MIDDLE_Y;
    setCurrentIndex(0);
  }, [rocketY]);

  // End game
  const endGame = useCallback(
    (reason: string) => {
      setGameOver(true);
      Alert.alert("Game Over", `${reason}\nFinal Score: ${score}`, [
        { text: "Try Again", onPress: resetGame },
      ]);
    },
    [score, resetGame]
  );

  // Next question
  const nextQuestion = useCallback(() => {
    setTimer(TIMER_LIMIT);
    setCurrentIndex((prev) => (prev + 1) % DATA.length);
  }, []);

  // Handle wrong answer
  const handleWrong = useCallback(() => {
    const newStreak = wrongStreak + 1;
    setWrongStreak(newStreak);

    // Rocket falls down (but don't lose life here, only on bottom hit or timeout)
    const newY = Math.min(ROCKET_MAX_Y, rocketY.value + WRONG_ANSWER_PENALTY);
    rocketY.value = withTiming(newY, { duration: 300 });

    if (newStreak >= 3) {
      endGame("3 wrong answers in a row!");
    } else {
      nextQuestion();
    }
  }, [wrongStreak, endGame, nextQuestion, rocketY]);

  // Lose a life (called when rocket hits bottom or timeout)
  const loseLife = useCallback(() => {
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      endGame("Out of lives!");
    } else {
      // Reset rocket to middle and continue
      rocketY.value = withTiming(ROCKET_MIDDLE_Y, { duration: 300 });
      setTimer(TIMER_LIMIT);
      nextQuestion();
    }
  }, [lives, endGame, nextQuestion, rocketY]);

  // Timer + Drift Effect (rocket drifts down over time)
  useEffect(() => {
    if (gameOver || lives <= 0) return;

    const interval = setInterval(() => {
      // Drift rocket downward slowly
      const newY = Math.min(ROCKET_MAX_Y, rocketY.value + DRIFT_DOWN_SPEED);
      rocketY.value = newY;

      // Check if rocket hit the danger zone (bottom)
      if (newY >= ROCKET_MAX_Y - 10) {
        loseLife();
        return;
      }

      setTimer((prev) => {
        if (prev <= 1) {
          loseLife(); // Timeout = lose a life
          return TIMER_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, lives, gameOver, loseLife, rocketY]);

  // Handle answer selection
  const handleAnswer = (selected: string) => {
    if (gameOver) return;

    if (selected === DATA[currentIndex].answer) {
      setScore((s) => s + 20);
      setWrongStreak(0); // Reset wrong streak

      // Rocket boosts up
      const newY = Math.max(ROCKET_TOP_Y, rocketY.value - CORRECT_ANSWER_BOOST);
      rocketY.value = withTiming(newY, { duration: 300 });

      nextQuestion();
    } else {
      handleWrong();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Full-screen Game Area (behind everything) */}
      <View style={styles.gameArea}>
        <View style={styles.dangerZone} />

        <Animated.View style={[styles.rocketContainer, animatedRocketStyle]}>
          <Image
            source={require("../../assets/images/rocket.png")}
            style={styles.rocketEmoji}
          />
        </Animated.View>
      </View>

      {/* UI Overlay (on top of the game area) */}
      <View style={styles.overlay}>
        {/* Header - Score, Lives */}
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreIcon}>🏆</Text>
            <Text style={styles.scoreText}>{score}</Text>
          </View>

          <View style={styles.livesContainer}>
            {[...Array(3)].map((_, i) => (
              <Text key={i} style={styles.heart}>
                {i < lives ? "❤️" : "🖤"}
              </Text>
            ))}
          </View>
        </View>

        {/* Spacer pushes quizCard to bottom */}
        <View style={{ flex: 1 }} />

        {/* Question Card */}
        <View style={styles.quizCard}>
          <Text style={styles.instructionText}>Find the synonym for:</Text>
          <Text style={styles.targetWord}>{DATA[currentIndex].word}</Text>

          <View style={styles.optionsContainer}>
            {DATA[currentIndex].options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionBtn}
                onPress={() => handleAnswer(option)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a3a4a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  scoreText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  livesContainer: {
    flexDirection: "row",
    gap: 4,
  },
  heart: {
    fontSize: 20,
  },
  timerContainer: {
    marginHorizontal: 20,
    height: 24,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },
  timerBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
  },
  timerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  gameArea: {
    ...StyleSheet.absoluteFillObject, // <-- full screen
    justifyContent: "flex-start",
    alignItems: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dangerZone: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderTopWidth: 2,
    borderTopColor: "rgba(255, 0, 0, 0.5)",
  },
  rocketContainer: {
    alignItems: "center",
  },
  rocketEmoji: {
    width: 60,
    height: 60,
  },
  quizCard: {
    backgroundColor: "rgba(13, 37, 48, 0.75)", // 👈 transparency
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    backdropFilter: "blur(6px)", // ❌ web only (ignore in RN)
  },

  instructionText: {
    color: "#8aa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  targetWord: {
    color: "#FFD700",
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  optionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: "#2c4a5a",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a5a6a",
  },
  optionText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
