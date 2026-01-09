import { GameResult } from "@/components/GameResult";
import Background from "@/components/starfield-animation";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Types
interface Question {
  word: string;
  options: [string, string];
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
const DRIFT_DURATION = 8000; // 8 seconds to reach bottom (was 30s — 4x faster)
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ROCKET_SIZE = 120;

// Rocket vertical position boundaries
const ROCKET_TOP_Y = 10;
const ROCKET_MAX_Y = SCREEN_HEIGHT - 180; // adjust if needed
const ROCKET_MIDDLE_Y = ROCKET_MAX_Y / 2;

// Movement
const CORRECT_ANSWER_BOOST = 140; // More dramatic forward dash
const WRONG_ANSWER_PENALTY = 100; // More punishing backward penalty
const BACKWARD_ANIM_DURATION = 120; // Snappier backward animation
const FORWARD_ANIM_DURATION = 180; // Faster forward dash

export default function RocketSynonymGame() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(TIMER_LIMIT);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [starSpeed, setStarSpeed] = useState(1);
  const [shuffledOptions, setShuffledOptions] = useState<[string, string]>([...DATA[0].options]);

  // Rocket vertical position
  const rocketY = useSharedValue(ROCKET_MIDDLE_Y);

  // Shake animation for wrong answers
  const shakeAnim = useSharedValue(0);
  const wrongFlash = useSharedValue(0);

  // Motion blur effect for forward dash
  const motionBlur = useSharedValue(0);
  const rocketStretch = useSharedValue(1);

  // Guard to prevent multiple loseLife calls (bottom hit / timeout overlap)
  const lifeLock = useSharedValue(false);

  const animatedRocketStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: rocketY.value },
      { translateX: shakeAnim.value },
      { scaleY: rocketStretch.value },
    ],
    opacity: 1 - motionBlur.value * 0.3, // Slight fade during dash
  }));

  // Motion trail style for blur effect
  const motionTrailStyle = useAnimatedStyle(() => ({
    opacity: motionBlur.value,
    transform: [
      { translateY: rocketY.value + 40 },
      { scaleY: 2 + motionBlur.value * 2 },
      { scaleX: 0.8 },
    ],
  }));

  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: wrongFlash.value,
  }));

  // Shuffle options randomly
  const shuffleOptions = useCallback((options: [string, string]): [string, string] => {
    return Math.random() > 0.5 ? options : [options[1], options[0]];
  }, []);

  // Smooth drift (UI thread)
  const startDrift = useCallback(() => {
    cancelAnimation(rocketY);
    rocketY.value = withTiming(ROCKET_MAX_Y, {
      duration: DRIFT_DURATION,
      easing: Easing.linear,
    });
  }, [rocketY]);

  // Next question
  const nextQuestion = useCallback(() => {
    setTimer(TIMER_LIMIT);
    setCurrentIndex((prev) => {
      const nextIdx = (prev + 1) % DATA.length;
      setShuffledOptions(shuffleOptions(DATA[nextIdx].options));
      return nextIdx;
    });
  }, [shuffleOptions]);

  // Reset game
  const resetGame = useCallback(() => {
    setLives(3);
    setScore(0);
    setTimer(TIMER_LIMIT);
    setWrongStreak(0);
    setGameOver(false);
    setShowResult(false);
    setGameOverReason("");

    lifeLock.value = false;
    rocketY.value = ROCKET_MIDDLE_Y;
    shakeAnim.value = 0;
    wrongFlash.value = 0;
    motionBlur.value = 0;
    rocketStretch.value = 1;

    setCurrentIndex(0);
    setShuffledOptions(shuffleOptions(DATA[0].options));
    startDrift(); // important: currentIndex might remain 0, so restart drift here
  }, [
    rocketY,
    startDrift,
    lifeLock,
    shakeAnim,
    wrongFlash,
    motionBlur,
    rocketStretch,
    shuffleOptions,
  ]);

  // End game
  const endGame = useCallback((reason: string) => {
    setGameOver(true);
    setGameOverReason(reason);
    setShowResult(true);
  }, []);

  const animateRocketThenNext = useCallback(
    (targetY: number, isForward: boolean = false) => {
      cancelAnimation(rocketY);

      if (isForward) {
        // Trigger motion blur and stretch for forward dash
        motionBlur.value = withTiming(0.8, { duration: 50 }, () => {
          motionBlur.value = withTiming(0, { duration: 150 });
        });
        rocketStretch.value = withTiming(1.3, { duration: 50 }, () => {
          rocketStretch.value = withTiming(1, { duration: 150 });
        });
      }

      const duration = isForward ? FORWARD_ANIM_DURATION : BACKWARD_ANIM_DURATION;

      rocketY.value = withTiming(targetY, { duration }, (finished) => {
        if (finished) {
          runOnJS(nextQuestion)(); // ✅ go next only AFTER rocket anim finishes
        }
      });
    },
    [rocketY, nextQuestion, motionBlur, rocketStretch],
  );

  const handleWrong = useCallback(() => {
    // Trigger shake animation
    shakeAnim.value = withTiming(-15, { duration: 50 }, () => {
      shakeAnim.value = withTiming(15, { duration: 50 }, () => {
        shakeAnim.value = withTiming(-10, { duration: 50 }, () => {
          shakeAnim.value = withTiming(10, { duration: 50 }, () => {
            shakeAnim.value = withTiming(0, { duration: 50 });
          });
        });
      });
    });

    // Trigger red flash
    wrongFlash.value = withTiming(0.4, { duration: 100 }, () => {
      wrongFlash.value = withTiming(0, { duration: 300 });
    });

    // Decrement life immediately on wrong answer
    let outOfLives = false;
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) outOfLives = true;
      return newLives;
    });

    const newStreak = wrongStreak + 1;
    setWrongStreak(newStreak);

    const targetY = Math.min(ROCKET_MAX_Y, rocketY.value + WRONG_ANSWER_PENALTY);

    // Prevent bottom-hit detection from double-decrementing life
    lifeLock.value = true;

    if (outOfLives) {
      endGame("Out of lives!");
      return;
    }

    // If 3 wrong in a row -> show the fall first, then end game
    if (newStreak >= 3) {
      cancelAnimation(rocketY);
      rocketY.value = withTiming(targetY, { duration: BACKWARD_ANIM_DURATION }, (finished) => {
        if (finished) runOnJS(endGame)("3 wrong answers in a row!");
      });
      return;
    }

    // Otherwise animate down (fast), then next question
    animateRocketThenNext(targetY, false);
  }, [wrongStreak, rocketY, endGame, animateRocketThenNext, lifeLock, shakeAnim, wrongFlash]);

  const handleAnswer = (selected: string) => {
    if (gameOver) return;

    if (selected === DATA[currentIndex].answer) {
      setScore((s) => s + 20);
      setWrongStreak(0);

      const targetY = Math.max(ROCKET_TOP_Y, rocketY.value - CORRECT_ANSWER_BOOST);

      // Animate boost first with motion blur, then next question
      animateRocketThenNext(targetY, true);
    } else {
      handleWrong();
    }
  };

  // Lose a life
  const loseLife = useCallback(() => {
    setLives((prevLives) => {
      const newLives = prevLives - 1;

      if (newLives <= 0) {
        endGame("Out of lives!");
        return 0;
      }

      // continue game
      setTimer(TIMER_LIMIT);
      setWrongStreak(0);

      // reset rocket and continue with next question
      cancelAnimation(rocketY);
      rocketY.value = withTiming(ROCKET_MIDDLE_Y, { duration: 250 });

      nextQuestion(); // triggers startDrift via effect below
      return newLives;
    });
  }, [endGame, nextQuestion, rocketY]);

  // Start drift when question changes (or game resumes)
  useEffect(() => {
    if (gameOver || lives <= 0) return;

    // release lock for next round
    lifeLock.value = false;

    startDrift();
  }, [currentIndex, gameOver, lives, startDrift, lifeLock]);

  // Detect bottom hit smoothly (UI thread → JS)
  useAnimatedReaction(
    () => rocketY.value,
    (y, prev) => {
      const threshold = ROCKET_MAX_Y - 10;

      if (!lifeLock.value && y >= threshold && (prev ?? 0) < threshold) {
        lifeLock.value = true;
        runOnJS(loseLife)();
      }
    },
  );

  // Timer (JS) - timeout loses life
  useEffect(() => {
    if (gameOver || lives <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // lock so bottom-hit doesn't double-trigger
          lifeLock.value = true;
          loseLife();
          return TIMER_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver, lives, loseLife, lifeLock]);

  // Initialize shuffled options on mount
  useEffect(() => {
    setShuffledOptions(shuffleOptions(DATA[0].options));
  }, [shuffleOptions]);

  // Calculate score percentage (based on max possible score)
  const maxPossibleScore = DATA.length * 20; // 20 points per correct answer
  const scorePercentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));

  if (showResult) {
    return (
      <GameResult
        scorePercentage={scorePercentage}
        onRetry={resetGame}
        onHome={() => router.back()}
        mascotMessage={`${gameOverReason} You scored ${score} points!`}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* background */}
      <Background speed={starSpeed} />

      {/* full screen game world */}
      <View style={styles.gameArea}>
        <View style={styles.dangerZone} />

        {/* Motion trail for dash effect */}
        <Animated.View style={[styles.motionTrail, motionTrailStyle]} pointerEvents="none">
          <Image
            source={require("../../assets/images/rocket.png")}
            style={[styles.rocketEmoji, styles.trailImage]}
          />
        </Animated.View>

        <Animated.View style={[styles.rocketContainer, animatedRocketStyle]}>
          <Image source={require("../../assets/images/rocket.png")} style={styles.rocketEmoji} />
        </Animated.View>
      </View>

      {/* Wrong answer flash overlay */}
      <Animated.View style={[styles.wrongFlashOverlay, animatedFlashStyle]} pointerEvents="none" />

      {/* overlay */}
      <View style={styles.overlay} pointerEvents="box-none">
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

        {/* pinned bottom card */}
        <View style={styles.quizCard}>
          <Text style={styles.instructionText}>Find the synonym for:</Text>
          <Text style={styles.targetWord}>{DATA[currentIndex].word}</Text>

          <View style={styles.optionsContainer}>
            {shuffledOptions.map((option) => (
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

          {/* If you want to show timer text */}
          <Text style={styles.timerTextOverlay}>⏱ {timer}s</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

  wrongFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ff0000",
    zIndex: 100,
  },

  gameArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
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
  scoreIcon: { fontSize: 16, marginRight: 6 },
  scoreText: { color: "white", fontSize: 18, fontWeight: "bold" },

  livesContainer: { flexDirection: "row", gap: 4 },
  heart: { fontSize: 20 },

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

  rocketContainer: { alignItems: "center" },
  rocketEmoji: { width: ROCKET_SIZE, height: ROCKET_SIZE },

  motionTrail: {
    position: "absolute",
    alignItems: "center",
  },
  trailImage: {
    tintColor: "#00ffff",
    opacity: 0.5,
  },

  quizCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "rgba(13, 37, 48, 0.6)",
    padding: 25,
    paddingBottom: 50,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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

  optionsContainer: { flexDirection: "row", gap: 12 },

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

  timerTextOverlay: {
    marginTop: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontWeight: "600",
  },
});
