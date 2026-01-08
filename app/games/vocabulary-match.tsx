import { MascotFeedback } from "@/components/MascotFeedback";
import { PieTimer } from "@/components/PieTimer";
import { WORD_PAIRS } from "@/constants/wordPairs";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TIME_LIMIT = 60;
const BASE_SCORE = 500;
const PENALTY = 300;

export default function VocabularyMatchGame() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [score, setScore] = useState(0);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isActive, setIsActive] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [mascotMessage, setMascotMessage] = useState("");
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

  useEffect(() => {
    generateRound();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsActive(false);
      // Show game over alert
      setTimeout(() => {
        Alert.alert("Time's Up!", `Game Over! Your final score: ${score}`, [
          {
            text: "Play Again",
            onPress: () => router.replace("/games/vocabulary-match"),
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

    const isCorrect = userSaysMatch === isMatch;

    if (isCorrect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setScore((s) => s + BASE_SCORE);
      setLastAdded(BASE_SCORE);

      // Update mascot message for first 2 questions
      if (questionNumber < 2) {
        setMascotMessage("Wow you got it fast!");
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Deduct 300 points only if current score is greater than 300
      if (score > PENALTY) {
        setScore((s) => s - PENALTY);
        setLastAdded(-PENALTY);
      } else {
        setLastAdded(0); // Show 0 if score is too low to deduct
      }

      // Update mascot message for first 2 questions
      if (questionNumber < 2) {
        setMascotMessage("Oops! Listen carefully!");
      }
    }

    setQuestionNumber((prev) => prev + 1);
    generateRound();
  };

  const micAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: micScale.value }],
    };
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.levelText}>Level 1</Text>

        <PieTimer remaining={timeLeft} total={TIME_LIMIT} />

        <View style={styles.scoreContainer}>
          {lastAdded !== null && (
            <Animated.Text
              key={`points-${score}-${lastAdded}`}
              entering={FadeInUp}
              style={[
                styles.pointsAdded,
                { color: lastAdded > 0 ? "#50C878" : "#EF4444" },
              ]}
            >
              {lastAdded > 0 ? `+${lastAdded}` : lastAdded}
            </Animated.Text>
          )}
          <Text style={styles.totalPoints}>{score} pt</Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        <Animated.View
          key={`card-${score}-${displayedWord}`}
          entering={ZoomIn}
          style={styles.card}
        >
          {/* Emoji Display */}
          <Text style={styles.emoji}>{displayedEmoji}</Text>

          {/* Audio Button */}
          <Animated.View style={micAnimatedStyle}>
            <TouchableOpacity
              style={styles.micButton}
              onPress={playAudio}
              activeOpacity={0.8}
            >
              <Ionicons name="volume-high" size={32} color="#50C878" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.actionButton, styles.noButton]}
          onPress={() => handleGuess(false)}
          disabled={!hasPlayedAudio}
        >
          <Text style={styles.buttonText}>No</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.yesButton]}
          onPress={() => handleGuess(true)}
          disabled={!hasPlayedAudio}
        >
          <Text style={styles.buttonText}>Yes</Text>
        </TouchableOpacity>
      </View>

      {/* Mascot - Only show for first 2 questions */}
      {questionNumber < 2 && (
        <View style={styles.mascotSpace}>
          <MascotFeedback text={mascotMessage} />
        </View>
      )}
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
  scoreContainer: {
    alignItems: "flex-end",
    minWidth: 80,
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
  gameArea: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    aspectRatio: 1,
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
    gap: 30,
  },
  emoji: {
    fontSize: 140,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
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
  },
  yesButton: {
    backgroundColor: "#50C878",
    borderColor: "#45AD68",
  },
  buttonText: {
    fontSize: 32,
    color: "#444",
    fontWeight: "500",
  },
  mascotSpace: {
    flex: 1.5,
  },
});
