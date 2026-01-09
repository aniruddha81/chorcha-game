/**
 * Word Polarity Game
 * A fast-paced vocabulary game where players swipe words as Positive (right) or Negative (left)
 * 100 seconds timer, with explanation modal on wrong answers
 */
import { GameResult } from "@/components/GameResult";
import { POLARITY_COLORS, POLARITY_WORDS, type PolarityWord } from "@/constants/polarityWords";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    FadeIn,
    FadeInUp,
    FadeOut,
    interpolate,
    runOnJS,
    SlideInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    ZoomIn
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Game constants
const GAME_DURATION = 100; // seconds
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width to trigger action
const MAX_ROTATION = 15; // degrees

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WRONG ANSWER MODAL COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface WrongAnswerModalProps {
    word: PolarityWord;
    selectedAnswer: "positive" | "negative";
    onContinue: () => void;
}

const WrongAnswerModal = ({ word, selectedAnswer, onContinue }: WrongAnswerModalProps) => {
    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.modalOverlay}
        >
            <Animated.View
                entering={SlideInDown.springify().damping(15)}
                style={styles.modalContent}
            >
                {/* Header with X icon */}
                <View style={styles.modalHeader}>
                    <View style={styles.wrongIconContainer}>
                        <Ionicons name="close" size={32} color={POLARITY_COLORS.negative} />
                    </View>
                    <Text style={styles.modalTitle}>Incorrect!</Text>
                </View>

                {/* Word Display */}
                <View style={styles.modalWordContainer}>
                    <Text style={styles.modalWord}>{word.word}</Text>
                    <View style={[
                        styles.polarityBadge,
                        { backgroundColor: word.polarity === "positive" ? POLARITY_COLORS.positive : POLARITY_COLORS.negative }
                    ]}>
                        <Text style={styles.polarityBadgeText}>
                            {word.polarity === "positive" ? "Positive" : "Negative"}
                        </Text>
                    </View>
                </View>

                {/* Definition */}
                <View style={styles.definitionContainer}>
                    <Text style={styles.definitionLabel}>Definition:</Text>
                    <Text style={styles.definitionText}>{word.definition}</Text>
                </View>

                {/* Explanation */}
                <View style={styles.explanationContainer}>
                    <Text style={styles.explanationLabel}>Why it's {word.polarity}:</Text>
                    <Text style={styles.explanationText}>{word.explanation}</Text>
                </View>

                {/* Your Answer vs Correct */}
                <View style={styles.answerComparisonContainer}>
                    <View style={styles.answerRow}>
                        <Text style={styles.answerLabel}>Your answer:</Text>
                        <View style={[styles.answerBadge, styles.wrongAnswerBadge]}>
                            <Text style={styles.answerBadgeText}>{selectedAnswer}</Text>
                        </View>
                    </View>
                    <View style={styles.answerRow}>
                        <Text style={styles.answerLabel}>Correct answer:</Text>
                        <View style={[styles.answerBadge, styles.correctAnswerBadge]}>
                            <Text style={styles.answerBadgeText}>{word.polarity}</Text>
                        </View>
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={onContinue}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color={POLARITY_COLORS.textLight} />
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SWIPEABLE WORD CARD COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SwipeableWordCardProps {
    word: string;
    onSwipe: (direction: "positive" | "negative") => void;
    disabled: boolean;
}

const SwipeableWordCard = ({ word, onSwipe, disabled }: SwipeableWordCardProps) => {
    const translateX = useSharedValue(0);
    const cardScale = useSharedValue(1);

    const handleSwipeComplete = useCallback((direction: "positive" | "negative") => {
        onSwipe(direction);
    }, [onSwipe]);

    const resetCard = useCallback(() => {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        cardScale.value = withSpring(1);
    }, [translateX, cardScale]);

    const panGesture = Gesture.Pan()
        .enabled(!disabled)
        .onUpdate((event) => {
            translateX.value = event.translationX;
            // Slight scale down when dragging
            cardScale.value = interpolate(
                Math.abs(event.translationX),
                [0, SWIPE_THRESHOLD],
                [1, 0.95]
            );
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                // Swiped right = Positive
                translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => {
                    runOnJS(handleSwipeComplete)("positive");
                });
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                // Swiped left = Negative
                translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 200 }, () => {
                    runOnJS(handleSwipeComplete)("negative");
                });
            } else {
                // Snap back
                runOnJS(resetCard)();
            }
        });

    const cardAnimatedStyle = useAnimatedStyle(() => {
        const rotation = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-MAX_ROTATION, 0, MAX_ROTATION]
        );

        return {
            transform: [
                { translateX: translateX.value },
                { rotate: `${rotation}deg` },
                { scale: cardScale.value },
            ],
        };
    });

    // Positive indicator opacity (right side)
    const positiveIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD],
            [0, 1]
        );
        return { opacity: Math.max(0, opacity) };
    });

    // Negative indicator opacity (left side)
    const negativeIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, -SWIPE_THRESHOLD],
            [0, 1]
        );
        return { opacity: Math.max(0, opacity) };
    });

    // Card border color based on swipe direction
    const cardBorderStyle = useAnimatedStyle(() => {
        const positiveProgress = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD],
            [0, 1]
        );
        const negativeProgress = interpolate(
            translateX.value,
            [0, -SWIPE_THRESHOLD],
            [0, 1]
        );

        // Determine border color and width
        if (translateX.value > 0) {
            return {
                borderColor: POLARITY_COLORS.positive,
                borderWidth: interpolate(positiveProgress, [0, 1], [0, 4]),
            };
        } else if (translateX.value < 0) {
            return {
                borderColor: POLARITY_COLORS.negative,
                borderWidth: interpolate(negativeProgress, [0, 1], [0, 4]),
            };
        }
        return { borderColor: "transparent", borderWidth: 0 };
    });

    return (
        <View style={styles.swipeContainer}>
            {/* Background Labels */}
            <View style={styles.swipeLabelsContainer}>
                {/* Left Label - Negative */}
                <Animated.View style={[styles.swipeLabel, styles.negativeLabelBg, negativeIndicatorStyle]}>
                    <Ionicons name="remove-circle" size={40} color={POLARITY_COLORS.negative} />
                    <Text style={[styles.swipeLabelText, { color: POLARITY_COLORS.negative }]}>NEGATIVE</Text>
                </Animated.View>

                {/* Right Label - Positive */}
                <Animated.View style={[styles.swipeLabel, styles.positiveLabelBg, positiveIndicatorStyle]}>
                    <Ionicons name="add-circle" size={40} color={POLARITY_COLORS.positive} />
                    <Text style={[styles.swipeLabelText, { color: POLARITY_COLORS.positive }]}>POSITIVE</Text>
                </Animated.View>
            </View>

            {/* Swipeable Card */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    key={word}
                    entering={ZoomIn.springify().damping(12)}
                    style={[styles.wordCard, cardAnimatedStyle, cardBorderStyle]}
                >
                    {/* Swipe direction indicators on card */}
                    <Animated.View style={[styles.cardIndicator, styles.cardIndicatorLeft, negativeIndicatorStyle]}>
                        <View style={[styles.indicatorBadge, { backgroundColor: POLARITY_COLORS.negativeLight }]}>
                            <Ionicons name="close" size={24} color={POLARITY_COLORS.negative} />
                        </View>
                    </Animated.View>

                    <Animated.View style={[styles.cardIndicator, styles.cardIndicatorRight, positiveIndicatorStyle]}>
                        <View style={[styles.indicatorBadge, { backgroundColor: POLARITY_COLORS.positiveLight }]}>
                            <Ionicons name="checkmark" size={24} color={POLARITY_COLORS.positive} />
                        </View>
                    </Animated.View>

                    {/* Word */}
                    <Text style={styles.wordText}>{word}</Text>

                    {/* Swipe hint */}
                    <View style={styles.swipeHintContainer}>
                        <View style={styles.swipeHintRow}>
                            <Ionicons name="arrow-back" size={16} color={POLARITY_COLORS.negative} />
                            <Text style={[styles.swipeHintText, { color: POLARITY_COLORS.negative }]}>Negative</Text>
                        </View>
                        <View style={styles.swipeHintDivider} />
                        <View style={styles.swipeHintRow}>
                            <Text style={[styles.swipeHintText, { color: POLARITY_COLORS.positive }]}>Positive</Text>
                            <Ionicons name="arrow-forward" size={16} color={POLARITY_COLORS.positive} />
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORE DISPLAY COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ScoreDisplayProps {
    score: number;
    lastChange: number | null;
}

const ScoreDisplay = ({ score, lastChange }: ScoreDisplayProps) => {
    return (
        <View style={styles.scoreContainer}>
            {lastChange !== null && (
                <Animated.Text
                    key={`change-${score}`}
                    entering={FadeInUp.duration(200)}
                    style={[
                        styles.scoreChange,
                        { color: lastChange > 0 ? POLARITY_COLORS.positive : POLARITY_COLORS.negative }
                    ]}
                >
                    {lastChange > 0 ? `+${lastChange}` : lastChange}
                </Animated.Text>
            )}
            <Text style={styles.scoreText}>{score}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
        </View>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LINEAR TIMER COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface LinearTimerProps {
    timeLeft: number;
    totalTime: number;
    isPaused: boolean;
}

const LinearTimer = ({ timeLeft, totalTime, isPaused }: LinearTimerProps) => {
    const progress = Math.max(0, Math.min(1, timeLeft / totalTime));
    const isLowTime = timeLeft <= 20;

    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (isLowTime && !isPaused) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );
        } else {
            pulseScale.value = withTiming(1);
        }
    }, [isLowTime, isPaused, pulseScale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    return (
        <Animated.View style={[styles.timerContainer, animatedStyle]}>
            <View style={styles.timerBackground}>
                <View
                    style={[
                        styles.timerFill,
                        {
                            width: `${progress * 100}%`,
                            backgroundColor: isLowTime ? POLARITY_COLORS.timerLow : POLARITY_COLORS.timer,
                        }
                    ]}
                />
            </View>
            <View style={styles.timerTextContainer}>
                <Ionicons
                    name="time-outline"
                    size={18}
                    color={isLowTime ? POLARITY_COLORS.timerLow : POLARITY_COLORS.text}
                />
                <Text style={[
                    styles.timerText,
                    isLowTime && styles.timerTextLow
                ]}>
                    {timeLeft}s
                </Text>
                {isPaused && (
                    <Text style={styles.pausedText}>(Paused)</Text>
                )}
            </View>
        </Animated.View>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN GAME COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function WordPolarityGame() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Game State
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [isPaused, setIsPaused] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [lastScoreChange, setLastScoreChange] = useState<number | null>(null);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    // Modal State
    const [showWrongModal, setShowWrongModal] = useState(false);
    const [wrongWord, setWrongWord] = useState<PolarityWord | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<"positive" | "negative">("positive");

    // Card key for re-mounting
    const [cardKey, setCardKey] = useState(0);

    // Shuffle words for this session
    const shuffledWords = useMemo(() => {
        return [...POLARITY_WORDS].sort(() => Math.random() - 0.5);
    }, []);

    const currentWord = shuffledWords[currentWordIndex];

    // Timer logic
    useEffect(() => {
        if (isGameOver || isPaused || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isGameOver, isPaused, timeLeft]);

    // Play success feedback
    const playCorrectFeedback = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    // Play wrong feedback
    const playWrongFeedback = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, []);

    // Handle swipe
    const handleSwipe = useCallback((direction: "positive" | "negative") => {
        if (isGameOver || isPaused || !currentWord) return;

        setTotalAttempts((prev) => prev + 1);

        const isCorrect = direction === currentWord.polarity;

        if (isCorrect) {
            // Correct answer
            playCorrectFeedback();
            setScore((prev) => prev + 1);
            setCorrectAnswers((prev) => prev + 1);
            setLastScoreChange(1);

            // Move to next word
            setTimeout(() => {
                if (currentWordIndex < shuffledWords.length - 1) {
                    setCurrentWordIndex((prev) => prev + 1);
                    setCardKey((prev) => prev + 1);
                } else {
                    setIsGameOver(true);
                }
            }, 100);
        } else {
            // Wrong answer
            playWrongFeedback();

            // Pause timer and show modal
            setIsPaused(true);
            setWrongWord(currentWord);
            setSelectedAnswer(direction);
            setShowWrongModal(true);
        }
    }, [isGameOver, isPaused, currentWord, currentWordIndex, shuffledWords.length, playCorrectFeedback, playWrongFeedback]);

    // Handle modal continue
    const handleModalContinue = useCallback(() => {
        setShowWrongModal(false);
        setWrongWord(null);
        setIsPaused(false);

        // Move to next word
        if (currentWordIndex < shuffledWords.length - 1) {
            setCurrentWordIndex((prev) => prev + 1);
            setCardKey((prev) => prev + 1);
        } else {
            setIsGameOver(true);
        }
    }, [currentWordIndex, shuffledWords.length]);

    // Restart game
    const restartGame = useCallback(() => {
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setIsPaused(false);
        setIsGameOver(false);
        setCurrentWordIndex(0);
        setLastScoreChange(null);
        setTotalAttempts(0);
        setCorrectAnswers(0);
        setShowWrongModal(false);
        setWrongWord(null);
        setCardKey(0);
    }, []);

    // Calculate accuracy percentage for GameResult
    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

    // Show game result when game is over
    if (isGameOver) {
        return (
            <GameResult
                scorePercentage={accuracy}
                onRetry={restartGame}
                onHome={() => router.back()}
                averageScore={50}
            />
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar style="dark" />

                {/* Header */}
                <View style={styles.header}>
                    {/* Timer */}
                    <LinearTimer timeLeft={timeLeft} totalTime={GAME_DURATION} isPaused={isPaused} />

                    {/* Score */}
                    <ScoreDisplay score={score} lastChange={lastScoreChange} />
                </View>

                {/* Game Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.gameTitle}>Word Polarity</Text>
                    <Text style={styles.gameSubtitle}>Swipe to classify the word</Text>
                </View>

                {/* Main Game Area */}
                <View style={styles.gameArea}>
                    {currentWord && (
                        <SwipeableWordCard
                            key={cardKey}
                            word={currentWord.word}
                            onSwipe={handleSwipe}
                            disabled={isPaused}
                        />
                    )}
                </View>

                {/* Direction Legend */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendIcon, { backgroundColor: POLARITY_COLORS.negativeLight }]}>
                            <Ionicons name="arrow-back" size={20} color={POLARITY_COLORS.negative} />
                        </View>
                        <Text style={styles.legendText}>Swipe Left</Text>
                        <Text style={[styles.legendLabel, { color: POLARITY_COLORS.negative }]}>Negative</Text>
                    </View>

                    <View style={styles.legendDivider} />

                    <View style={styles.legendItem}>
                        <View style={[styles.legendIcon, { backgroundColor: POLARITY_COLORS.positiveLight }]}>
                            <Ionicons name="arrow-forward" size={20} color={POLARITY_COLORS.positive} />
                        </View>
                        <Text style={styles.legendText}>Swipe Right</Text>
                        <Text style={[styles.legendLabel, { color: POLARITY_COLORS.positive }]}>Positive</Text>
                    </View>
                </View>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Words</Text>
                        <Text style={styles.statValue}>{currentWordIndex + 1}/{shuffledWords.length}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Accuracy</Text>
                        <Text style={styles.statValue}>{accuracy}%</Text>
                    </View>
                </View>

                {/* Wrong Answer Modal */}
                {showWrongModal && wrongWord && (
                    <WrongAnswerModal
                        word={wrongWord}
                        selectedAnswer={selectedAnswer}
                        onContinue={handleModalContinue}
                    />
                )}
            </View>
        </GestureHandlerRootView>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: POLARITY_COLORS.background,
    },

    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 8,
    },

    // Title
    titleContainer: {
        alignItems: "center",
        paddingVertical: 8,
    },
    gameTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
    },
    gameSubtitle: {
        fontSize: 14,
        color: POLARITY_COLORS.textMuted,
        marginTop: 2,
    },

    // Timer
    timerContainer: {
        flex: 1,
        marginRight: 16,
    },
    timerBackground: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
    },
    timerFill: {
        height: "100%",
        borderRadius: 4,
    },
    timerTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: 4,
    },
    timerText: {
        fontSize: 14,
        fontWeight: "600",
        color: POLARITY_COLORS.text,
    },
    timerTextLow: {
        color: POLARITY_COLORS.timerLow,
    },
    pausedText: {
        fontSize: 12,
        color: POLARITY_COLORS.textMuted,
        fontStyle: "italic",
    },

    // Score
    scoreContainer: {
        alignItems: "flex-end",
    },
    scoreChange: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 2,
    },
    scoreText: {
        fontSize: 28,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
    },
    scoreLabel: {
        fontSize: 12,
        color: POLARITY_COLORS.textMuted,
        marginTop: -2,
    },

    // Game Area
    gameArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },

    // Swipe Container
    swipeContainer: {
        width: "100%",
        height: 200,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },

    // Background Labels
    swipeLabelsContainer: {
        position: "absolute",
        width: "100%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    swipeLabel: {
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 16,
    },
    negativeLabelBg: {
        backgroundColor: POLARITY_COLORS.negativeLight,
    },
    positiveLabelBg: {
        backgroundColor: POLARITY_COLORS.positiveLight,
    },
    swipeLabelText: {
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 4,
        letterSpacing: 1,
    },

    // Word Card
    wordCard: {
        width: SCREEN_WIDTH - 120,
        backgroundColor: POLARITY_COLORS.card,
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        minHeight: 160,
    },
    wordText: {
        fontSize: 32,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
        textAlign: "center",
        letterSpacing: -0.5,
    },

    // Card Indicators
    cardIndicator: {
        position: "absolute",
        top: 16,
    },
    cardIndicatorLeft: {
        left: 16,
    },
    cardIndicatorRight: {
        right: 16,
    },
    indicatorBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },

    // Swipe Hint on Card
    swipeHintContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    swipeHintRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    swipeHintText: {
        fontSize: 12,
        fontWeight: "600",
    },
    swipeHintDivider: {
        width: 1,
        height: 16,
        backgroundColor: "#E5E7EB",
        marginHorizontal: 16,
    },

    // Legend
    legendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 24,
    },
    legendItem: {
        alignItems: "center",
        gap: 4,
    },
    legendIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    legendText: {
        fontSize: 11,
        color: POLARITY_COLORS.textMuted,
    },
    legendLabel: {
        fontSize: 13,
        fontWeight: "bold",
    },
    legendDivider: {
        width: 1,
        height: 50,
        backgroundColor: "#E5E7EB",
    },

    // Stats Bar
    statsBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 40,
        paddingBottom: 24,
        paddingTop: 8,
    },
    statItem: {
        alignItems: "center",
    },
    statLabel: {
        fontSize: 12,
        color: POLARITY_COLORS.textMuted,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "600",
        color: POLARITY_COLORS.text,
    },

    // Modal
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: POLARITY_COLORS.modalOverlay,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        zIndex: 1000,
    },
    modalContent: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: POLARITY_COLORS.card,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
    },
    modalHeader: {
        alignItems: "center",
        marginBottom: 20,
    },
    wrongIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: POLARITY_COLORS.negativeLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: POLARITY_COLORS.negative,
    },
    modalWordContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    modalWord: {
        fontSize: 32,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
        marginBottom: 8,
    },
    polarityBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    polarityBadgeText: {
        fontSize: 14,
        fontWeight: "600",
        color: POLARITY_COLORS.textLight,
    },
    definitionContainer: {
        width: "100%",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    definitionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: POLARITY_COLORS.textMuted,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    definitionText: {
        fontSize: 15,
        color: POLARITY_COLORS.text,
        lineHeight: 22,
    },
    explanationContainer: {
        width: "100%",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    explanationLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: POLARITY_COLORS.textMuted,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    explanationText: {
        fontSize: 15,
        color: POLARITY_COLORS.text,
        lineHeight: 22,
    },
    answerComparisonContainer: {
        width: "100%",
        marginBottom: 20,
        gap: 8,
    },
    answerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    answerLabel: {
        fontSize: 14,
        color: POLARITY_COLORS.textMuted,
    },
    answerBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    wrongAnswerBadge: {
        backgroundColor: POLARITY_COLORS.negativeLight,
    },
    correctAnswerBadge: {
        backgroundColor: POLARITY_COLORS.positiveLight,
    },
    answerBadgeText: {
        fontSize: 14,
        fontWeight: "600",
        color: POLARITY_COLORS.text,
        textTransform: "capitalize",
    },
    continueButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 52,
        backgroundColor: POLARITY_COLORS.positive,
        borderRadius: 14,
        gap: 8,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: POLARITY_COLORS.textLight,
    },
});
