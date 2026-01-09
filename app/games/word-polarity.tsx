import { GameResult } from "@/components/GameResult";
import { MascotFeedback, MascotMood } from "@/components/MascotFeedback";
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
    interpolate,
    runOnJS,
    SlideInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    ZoomIn,
    ZoomInEasyDown
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Game constants
const GAME_DURATION = 100; // seconds total
const WORDS_PER_LEVEL = 5; // words to complete each level
const TOTAL_LEVELS = 4; // total number of levels
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const MAX_ROTATION = 15;

// Level colors for visual distinction
const LEVEL_COLORS = [
    { primary: "#10B981", light: "#D1FAE5" }, // Green
    { primary: "#3B82F6", light: "#DBEAFE" }, // Blue
    { primary: "#8B5CF6", light: "#EDE9FE" }, // Purple
    { primary: "#F59E0B", light: "#FEF3C7" }, // Amber
];

interface LevelCompleteProps {
    level: number;
    levelScore: number;
    onContinue: () => void;
}

const LevelComplete = ({ level, levelScore, onContinue }: LevelCompleteProps) => {
    const levelColor = LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];

    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Auto-continue after 2 seconds
        const timer = setTimeout(() => {
            onContinue();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onContinue]);

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.levelCompleteOverlay}
        >
            <Animated.View
                entering={ZoomInEasyDown.springify().damping(50).stiffness(500)}
                style={styles.levelCompleteContent}
            >
                {/* Star burst effect */}
                <Animated.View
                    entering={ZoomIn.delay(200).springify()}
                    style={[styles.levelCompleteBadge, { backgroundColor: levelColor.primary }]}
                >
                    <Ionicons name="checkmark" size={48} color="#FFF" />
                </Animated.View>

                <Animated.Text
                    entering={FadeInUp.delay(300)}
                    style={styles.levelCompleteTitle}
                >
                    Level {level} Complete!
                </Animated.Text>

                <Animated.View
                    entering={FadeInUp.delay(400)}
                    style={styles.levelScoreContainer}
                >
                    <Text style={styles.levelScoreLabel}>Words Correct</Text>
                    <Text style={[styles.levelScoreValue, { color: levelColor.primary }]}>
                        {levelScore}/{WORDS_PER_LEVEL}
                    </Text>
                </Animated.View>

                {level < TOTAL_LEVELS && (
                    <Animated.Text
                        entering={FadeInUp.delay(600)}
                        style={styles.nextLevelText}
                    >
                        Next: Level {level + 1}
                    </Animated.Text>
                )}

                {/* Progress dots */}
                <Animated.View
                    entering={FadeInUp.delay(500)}
                    style={styles.levelDotsContainer}
                >
                    {Array.from({ length: TOTAL_LEVELS }).map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.levelDot,
                                idx < level
                                    ? { backgroundColor: levelColor.primary }
                                    : { backgroundColor: "#E5E7EB" }
                            ]}
                        />
                    ))}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};

interface WrongAnswerModalProps {
    word: PolarityWord;
    selectedAnswer: "positive" | "negative";
    onContinue: () => void;
}

const WrongAnswerModal = ({ word, selectedAnswer, onContinue }: WrongAnswerModalProps) => {
    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.modalOverlay}
        >
            <Animated.View
                entering={SlideInDown.springify().damping(50).stiffness(500)}
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
                    <Text style={styles.explanationLabel}>Why it&apos;s {word.polarity}:</Text>
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

interface SwipeableWordCardProps {
    word: string;
    onSwipe: (direction: "positive" | "negative") => void;
    disabled: boolean;
    levelColor: { primary: string; light: string };
}

const SwipeableWordCard = ({ word, onSwipe, disabled, levelColor }: SwipeableWordCardProps) => {
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
            cardScale.value = interpolate(
                Math.abs(event.translationX),
                [0, SWIPE_THRESHOLD],
                [1, 0.95]
            );
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => {
                    runOnJS(handleSwipeComplete)("positive");
                });
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 200 }, () => {
                    runOnJS(handleSwipeComplete)("negative");
                });
            } else {
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

    const positiveIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]);
        return { opacity: Math.max(0, opacity) };
    });

    const negativeIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 1]);
        return { opacity: Math.max(0, opacity) };
    });

    const cardBorderStyle = useAnimatedStyle(() => {
        const positiveProgress = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]);
        const negativeProgress = interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 1]);

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
                <Animated.View style={[styles.swipeLabel, styles.negativeLabelBg, negativeIndicatorStyle]}>
                    <Ionicons name="remove-circle" size={32} color={POLARITY_COLORS.negative} />
                    <Text style={[styles.swipeLabelText, { color: POLARITY_COLORS.negative }]}>NEGATIVE</Text>
                </Animated.View>

                <Animated.View style={[styles.swipeLabel, styles.positiveLabelBg, positiveIndicatorStyle]}>
                    <Ionicons name="add-circle" size={32} color={POLARITY_COLORS.positive} />
                    <Text style={[styles.swipeLabelText, { color: POLARITY_COLORS.positive }]}>POSITIVE</Text>
                </Animated.View>
            </View>

            {/* Swipeable Card */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    key={word}
                    entering={ZoomIn.duration(250)}
                    style={[styles.wordCard, cardAnimatedStyle, cardBorderStyle]}
                >
                    <Animated.View style={[styles.cardIndicator, styles.cardIndicatorLeft, negativeIndicatorStyle]}>
                        <View style={[styles.indicatorBadge, { backgroundColor: POLARITY_COLORS.negativeLight }]}>
                            <Ionicons name="close" size={20} color={POLARITY_COLORS.negative} />
                        </View>
                    </Animated.View>

                    <Animated.View style={[styles.cardIndicator, styles.cardIndicatorRight, positiveIndicatorStyle]}>
                        <View style={[styles.indicatorBadge, { backgroundColor: POLARITY_COLORS.positiveLight }]}>
                            <Ionicons name="checkmark" size={20} color={POLARITY_COLORS.positive} />
                        </View>
                    </Animated.View>

                    <Text style={styles.wordText}>{word}</Text>

                    <View style={styles.swipeHintContainer}>
                        <View style={styles.swipeHintRow}>
                            <Ionicons name="arrow-back" size={14} color={POLARITY_COLORS.negative} />
                            <Text style={[styles.swipeHintText, { color: POLARITY_COLORS.negative }]}>Negative</Text>
                        </View>
                        <View style={styles.swipeHintDivider} />
                        <View style={styles.swipeHintRow}>
                            <Text style={[styles.swipeHintText, { color: POLARITY_COLORS.positive }]}>Positive</Text>
                            <Ionicons name="arrow-forward" size={14} color={POLARITY_COLORS.positive} />
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

interface LevelProgressProps {
    currentLevel: number;
    wordsInLevel: number;
    levelColor: { primary: string; light: string };
}

const LevelProgress = ({ currentLevel, wordsInLevel, levelColor }: LevelProgressProps) => {
    return (
        <View style={styles.levelProgressContainer}>
            <View style={styles.levelBadge}>
                <Text style={[styles.levelBadgeText, { color: levelColor.primary }]}>
                    Level {currentLevel}
                </Text>
            </View>
            <View style={styles.levelProgressBar}>
                {Array.from({ length: WORDS_PER_LEVEL }).map((_, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.levelProgressDot,
                            idx < wordsInLevel
                                ? { backgroundColor: levelColor.primary }
                                : { backgroundColor: "#E5E7EB" }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

interface TimerProps {
    timeLeft: number;
    totalTime: number;
    isPaused: boolean;
}

const Timer = ({ timeLeft, totalTime, isPaused }: TimerProps) => {
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
                    size={16}
                    color={isLowTime ? POLARITY_COLORS.timerLow : POLARITY_COLORS.text}
                />
                <Text style={[styles.timerText, isLowTime && styles.timerTextLow]}>
                    {timeLeft}s
                </Text>
                {isPaused && <Text style={styles.pausedText}>(Paused)</Text>}
            </View>
        </Animated.View>
    );
};

export default function WordPolarityGame() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Game State
    const [currentLevel, setCurrentLevel] = useState(1);
    const [wordsInLevel, setWordsInLevel] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [isPaused, setIsPaused] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    // Stats
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [levelCorrect, setLevelCorrect] = useState(0);

    // UI State
    const [showWrongModal, setShowWrongModal] = useState(false);
    const [showLevelComplete, setShowLevelComplete] = useState(false);
    const [wrongWord, setWrongWord] = useState<PolarityWord | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<"positive" | "negative">("positive");
    const [mascotMessage, setMascotMessage] = useState("");
    const [mascotMood, setMascotMood] = useState<MascotMood>("explain");
    const [cardKey, setCardKey] = useState(0);

    // Shuffle words for this session
    const shuffledWords = useMemo(() => {
        return [...POLARITY_WORDS].sort(() => Math.random() - 0.5);
    }, []);

    const currentWord = shuffledWords[currentWordIndex];
    const levelColor = LEVEL_COLORS[(currentLevel - 1) % LEVEL_COLORS.length];

    // Timer logic
    useEffect(() => {
        if (isGameOver || isPaused || showLevelComplete || timeLeft <= 0) return;

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
    }, [isGameOver, isPaused, showLevelComplete, timeLeft]);

    // Initial mascot message
    useEffect(() => {
        setMascotMessage("Swipe right for positive, left for negative!");
        setMascotMood("explain");
    }, []);

    // Handle swipe
    const handleSwipe = useCallback((direction: "positive" | "negative") => {
        if (isGameOver || isPaused || !currentWord) return;

        setTotalAttempts((prev) => prev + 1);
        const isCorrect = direction === currentWord.polarity;

        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTotalCorrect((prev) => prev + 1);
            setLevelCorrect((prev) => prev + 1);
            setMascotMessage("Great job! Keep going!");
            setMascotMood("happy");

            const newWordsInLevel = wordsInLevel + 1;
            setWordsInLevel(newWordsInLevel);

            // Check if level complete
            if (newWordsInLevel >= WORDS_PER_LEVEL) {
                if (currentLevel >= TOTAL_LEVELS) {
                    // Game complete!
                    setTimeout(() => setIsGameOver(true), 300);
                } else {
                    // Show level complete animation
                    setIsPaused(true);
                    setTimeout(() => setShowLevelComplete(true), 300);
                }
            } else {
                // Next word
                setTimeout(() => {
                    if (currentWordIndex < shuffledWords.length - 1) {
                        setCurrentWordIndex((prev) => prev + 1);
                        setCardKey((prev) => prev + 1);
                    } else {
                        setIsGameOver(true);
                    }
                }, 100);
            }
        } else {
            // Wrong answer
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsPaused(true);
            setWrongWord(currentWord);
            setSelectedAnswer(direction);
            setMascotMessage("Oops! Let's learn this one.");
            setMascotMood("angry");
            setShowWrongModal(true);
        }
    }, [isGameOver, isPaused, currentWord, currentWordIndex, shuffledWords.length, wordsInLevel, currentLevel]);

    // Handle modal continue
    const handleModalContinue = useCallback(() => {
        setShowWrongModal(false);
        setWrongWord(null);
        setIsPaused(false);

        // Move to next word (wrong answers still progress)
        const newWordsInLevel = wordsInLevel + 1;
        setWordsInLevel(newWordsInLevel);

        if (newWordsInLevel >= WORDS_PER_LEVEL) {
            if (currentLevel >= TOTAL_LEVELS) {
                setIsGameOver(true);
            } else {
                setShowLevelComplete(true);
            }
        } else {
            if (currentWordIndex < shuffledWords.length - 1) {
                setCurrentWordIndex((prev) => prev + 1);
                setCardKey((prev) => prev + 1);
            } else {
                setIsGameOver(true);
            }
        }
    }, [currentWordIndex, shuffledWords.length, wordsInLevel, currentLevel]);

    // Handle level complete continue
    const handleLevelContinue = useCallback(() => {
        setShowLevelComplete(false);
        setCurrentLevel((prev) => prev + 1);
        setWordsInLevel(0);
        setLevelCorrect(0);
        setIsPaused(false);

        if (currentWordIndex < shuffledWords.length - 1) {
            setCurrentWordIndex((prev) => prev + 1);
            setCardKey((prev) => prev + 1);
        } else {
            setIsGameOver(true);
        }
    }, [currentWordIndex, shuffledWords.length]);

    // Restart game
    const restartGame = useCallback(() => {
        setCurrentLevel(1);
        setWordsInLevel(0);
        setCurrentWordIndex(0);
        setTimeLeft(GAME_DURATION);
        setIsPaused(false);
        setIsGameOver(false);
        setTotalCorrect(0);
        setTotalAttempts(0);
        setLevelCorrect(0);
        setShowWrongModal(false);
        setShowLevelComplete(false);
        setWrongWord(null);
        setCardKey(0);
    }, []);

    // Calculate accuracy
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    // Show game result
    if (isGameOver) {
        return (
            <GameResult
                scorePercentage={accuracy}
                onRetry={restartGame}
                onHome={() => router.back()}
                onExit={() => router.back()}
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
                    <Timer timeLeft={timeLeft} totalTime={GAME_DURATION} isPaused={isPaused || showLevelComplete} />

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>{totalCorrect}</Text>
                        <Text style={styles.scoreLabel}>Correct</Text>
                    </View>
                </View>

                {/* Level Progress */}
                <LevelProgress
                    currentLevel={currentLevel}
                    wordsInLevel={wordsInLevel}
                    levelColor={levelColor}
                />

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
                            disabled={isPaused || showLevelComplete}
                            levelColor={levelColor}
                        />
                    )}
                </View>

                {/* Mascot Overlay - Fixed at bottom */}
                <View style={styles.mascotOverlay}>
                    <MascotFeedback text={mascotMessage} mood={mascotMood} />
                </View>

                {/* Wrong Answer Modal */}
                {showWrongModal && wrongWord && (
                    <WrongAnswerModal
                        word={wrongWord}
                        selectedAnswer={selectedAnswer}
                        onContinue={handleModalContinue}
                    />
                )}

                {/* Level Complete Animation */}
                {showLevelComplete && (
                    <LevelComplete
                        level={currentLevel}
                        levelScore={levelCorrect}
                        onContinue={handleLevelContinue}
                    />
                )}
            </View>
        </GestureHandlerRootView>
    );
}

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

    // Timer
    timerContainer: {
        flex: 1,
        marginRight: 16,
    },
    timerBackground: {
        height: 6,
        backgroundColor: "#E5E7EB",
        borderRadius: 3,
        overflow: "hidden",
    },
    timerFill: {
        height: "100%",
        borderRadius: 3,
    },
    timerTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: 4,
    },
    timerText: {
        fontSize: 13,
        fontWeight: "600",
        color: POLARITY_COLORS.text,
    },
    timerTextLow: {
        color: POLARITY_COLORS.timerLow,
    },
    pausedText: {
        fontSize: 11,
        color: POLARITY_COLORS.textMuted,
        fontStyle: "italic",
    },

    // Score
    scoreContainer: {
        alignItems: "flex-end",
    },
    scoreText: {
        fontSize: 24,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
    },
    scoreLabel: {
        fontSize: 11,
        color: POLARITY_COLORS.textMuted,
        marginTop: -2,
    },

    // Level Progress
    levelProgressContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 12,
    },
    levelBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
    },
    levelBadgeText: {
        fontSize: 13,
        fontWeight: "bold",
    },
    levelProgressBar: {
        flex: 1,
        flexDirection: "row",
        gap: 6,
    },
    levelProgressDot: {
        flex: 1,
        height: 8,
        borderRadius: 4,
    },

    // Title
    titleContainer: {
        alignItems: "center",
        paddingVertical: 6,
    },
    gameTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
    },
    gameSubtitle: {
        fontSize: 13,
        color: POLARITY_COLORS.textMuted,
        marginTop: 2,
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
        height: 180,
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
        paddingHorizontal: 16,
    },
    swipeLabel: {
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 12,
    },
    negativeLabelBg: {
        backgroundColor: POLARITY_COLORS.negativeLight,
    },
    positiveLabelBg: {
        backgroundColor: POLARITY_COLORS.positiveLight,
    },
    swipeLabelText: {
        fontSize: 10,
        fontWeight: "bold",
        marginTop: 2,
        letterSpacing: 0.5,
    },

    // Word Card
    wordCard: {
        width: SCREEN_WIDTH - 80,
        backgroundColor: POLARITY_COLORS.card,
        borderRadius: 24,
        padding: 32,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        minHeight: 220,
    },
    wordText: {
        fontSize: 36,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
        textAlign: "center",
        letterSpacing: -0.5,
    },

    // Card Indicators
    cardIndicator: {
        position: "absolute",
        top: 12,
    },
    cardIndicatorLeft: {
        left: 12,
    },
    cardIndicatorRight: {
        right: 12,
    },
    indicatorBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },

    // Swipe Hint
    swipeHintContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    swipeHintRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    swipeHintText: {
        fontSize: 11,
        fontWeight: "600",
    },
    swipeHintDivider: {
        width: 1,
        height: 12,
        backgroundColor: "#E5E7EB",
        marginHorizontal: 12,
    },

    // Mascot Overlay
    mascotOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
    },

    // Level Complete Overlay
    levelCompleteOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    levelCompleteContent: {
        alignItems: "center",
        padding: 32,
    },
    levelCompleteBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    levelCompleteTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
        marginBottom: 12,
    },
    levelScoreContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    levelScoreLabel: {
        fontSize: 14,
        color: POLARITY_COLORS.textMuted,
    },
    levelScoreValue: {
        fontSize: 32,
        fontWeight: "bold",
    },
    nextLevelText: {
        fontSize: 16,
        color: POLARITY_COLORS.textMuted,
        marginBottom: 16,
    },
    levelDotsContainer: {
        flexDirection: "row",
        gap: 8,
    },
    levelDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
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
        maxWidth: 340,
        backgroundColor: POLARITY_COLORS.card,
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
    },
    modalHeader: {
        alignItems: "center",
        marginBottom: 16,
    },
    wrongIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: POLARITY_COLORS.negativeLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: POLARITY_COLORS.negative,
    },
    modalWordContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    modalWord: {
        fontSize: 28,
        fontWeight: "bold",
        color: POLARITY_COLORS.text,
        marginBottom: 8,
    },
    polarityBadge: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 14,
    },
    polarityBadgeText: {
        fontSize: 13,
        fontWeight: "600",
        color: POLARITY_COLORS.textLight,
    },
    definitionContainer: {
        width: "100%",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
    },
    definitionLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: POLARITY_COLORS.textMuted,
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    definitionText: {
        fontSize: 14,
        color: POLARITY_COLORS.text,
        lineHeight: 20,
    },
    explanationContainer: {
        width: "100%",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        padding: 14,
        marginBottom: 14,
    },
    explanationLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: POLARITY_COLORS.textMuted,
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    explanationText: {
        fontSize: 14,
        color: POLARITY_COLORS.text,
        lineHeight: 20,
    },
    answerComparisonContainer: {
        width: "100%",
        marginBottom: 16,
        gap: 6,
    },
    answerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    answerLabel: {
        fontSize: 13,
        color: POLARITY_COLORS.textMuted,
    },
    answerBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    wrongAnswerBadge: {
        backgroundColor: POLARITY_COLORS.negativeLight,
    },
    correctAnswerBadge: {
        backgroundColor: POLARITY_COLORS.positiveLight,
    },
    answerBadgeText: {
        fontSize: 13,
        fontWeight: "600",
        color: POLARITY_COLORS.text,
        textTransform: "capitalize",
    },
    continueButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 48,
        backgroundColor: POLARITY_COLORS.positive,
        borderRadius: 12,
        gap: 6,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: POLARITY_COLORS.textLight,
    },
});
