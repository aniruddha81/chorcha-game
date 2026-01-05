import { COLORS } from "@/constants/gameConfig";
import { WORD_PAIRS } from "@/constants/wordPairs";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TIME_LIMIT = 60;
const BASE_SCORE = 100;

export default function VocabularyMatchGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [lives, setLives] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  // Current Round Data
  const [spokenWord, setSpokenWord] = useState("");
  const [displayedWord, setDisplayedWord] = useState("");
  const [displayedEmoji, setDisplayedEmoji] = useState("");
  const [isMatch, setIsMatch] = useState(false);

  // Animation
  const micScale = useSharedValue(1);

  const generateRound = useCallback(() => {
    // Pick random word pair
    const randomPair =
      WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];

    // 50% chance of match
    const shouldMatch = Math.random() > 0.5;

    setSpokenWord(randomPair.word);

    if (shouldMatch) {
      setDisplayedWord(randomPair.word);
      setDisplayedEmoji(randomPair.emoji);
      setIsMatch(true);
    } else {
      // Pick random similar word
      const similarWord =
        randomPair.similarWords[
          Math.floor(Math.random() * randomPair.similarWords.length)
        ];
      setDisplayedWord(similarWord.word);
      setDisplayedEmoji(similarWord.emoji);
      setIsMatch(false);
    }

    setHasPlayedAudio(false);
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

  const playAudio = () => {
    if (!isActive) return;

    // Animate mic button
    micScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1)
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Speech.speak(spokenWord, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.8,
    });

    setHasPlayedAudio(true);
  };

  const handleGuess = (userSaysMatch: boolean) => {
    if (!isActive || !hasPlayedAudio) return;

    if (userSaysMatch === isMatch) {
      // Correct
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const streakBonus = Math.floor(streak / 5) * 50;
      setScore((s) => s + BASE_SCORE + streakBonus);
      setStreak((s) => s + 1);
      generateRound();
    } else {
      // Wrong
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLives((l) => l - 1);
      setStreak(0);
      generateRound();
    }
  };

  const micAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: micScale.value }],
    };
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vocabulary Match</Text>
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
          {hasPlayedAudio
            ? "Does the audio match the image?"
            : "Tap the mic to hear the word"}
        </Text>

        {/* Image Display */}
        <Animated.View
          key={`emoji-${score}-${displayedWord}`}
          entering={ZoomIn.springify()}
          style={styles.imageContainer}
        >
          <Text style={styles.emoji}>{displayedEmoji}</Text>
          <Text style={styles.wordLabel}>{displayedWord.toUpperCase()}</Text>
        </Animated.View>

        {/* Microphone Button */}
        <Animated.View style={micAnimatedStyle}>
          <TouchableOpacity
            style={[styles.micButton, !hasPlayedAudio && styles.micButtonPulse]}
            onPress={playAudio}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={64} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Controls */}
      {hasPlayedAudio && (
        <Animated.View entering={FadeIn} style={styles.controls}>
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
        </Animated.View>
      )}
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
    gap: 40,
  },
  instruction: {
    color: "#a1a1aa",
    fontSize: 18,
    textAlign: "center",
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  micButtonPulse: {
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  imageContainer: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#333",
    minWidth: 250,
  },
  emoji: {
    fontSize: 120,
    marginBottom: 20,
  },
  wordLabel: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
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
