import { GameResult } from "@/components/GameResult";
import { MascotFeedback } from "@/components/MascotFeedback";
import { PieTimer } from "@/components/PieTimer";
import { COLORS } from "@/constants/gameConfig";
import { AVAILABLE_ICONS } from "@/constants/iconMemoryGameIcon";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    FadeIn,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    ZoomIn
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";



type GameStatus = "IDLE" | "PLAYING" | "GAME_OVER" | "SUCCESS";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAME_BOX_SIZE = SCREEN_WIDTH - 40;
const ICON_SIZE = 50;
const TOTAL_LAYERS = 10;
const INITIAL_ICONS = 3; // Start with 3 icons on layer 1

// Icon colors for colorful display
const ICON_COLORS = [
    // "#ef4444", // red
    // "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    // "#22c55e", // green
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#ec4899", // pink
];

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Animated Icon Button Component
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface IconButtonProps {
    iconName: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    delay: number;
    isDisabled: boolean;
    feedbackState: "none" | "correct" | "wrong";
    iconColor: string;
    positionX?: number;
    positionY?: number;
}

const IconButton: React.FC<IconButtonProps> = ({
    iconName,
    onPress,
    delay,
    isDisabled,
    feedbackState,
    iconColor,
    positionX,
    positionY,
}) => {
    const scale = useSharedValue(1);
    const glow = useSharedValue(0);

    // Play light haptic feedback on tap
    const playTapFeedback = useCallback(() => {
        // Light haptic vibration - minimal and subtle
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const handlePress = useCallback(() => {
        playTapFeedback();
        onPress();
    }, [playTapFeedback, onPress]);

    useEffect(() => {
        if (feedbackState === "correct") {
            scale.value = withSequence(
                withSpring(1.2, { damping: 3 }),
                withSpring(1)
            );
            glow.value = withSequence(
                withTiming(1, { duration: 200 }),
                withTiming(0, { duration: 500 })
            );
        } else if (feedbackState === "wrong") {
            scale.value = withSequence(
                withSpring(0.8),
                withRepeat(
                    withSequence(
                        withTiming(0.9, { duration: 50 }),
                        withTiming(1.1, { duration: 50 })
                    ),
                    3
                ),
                withSpring(1)
            );
        }
    }, [feedbackState, scale, glow]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        shadowOpacity: glow.value * 0.8,
        shadowRadius: glow.value * 20,
    }));

    const getBorderColor = () => {
        if (feedbackState === "correct") return COLORS.success;
        if (feedbackState === "wrong") return COLORS.error;
        return "transparent"; // No border for normal state
    };

    const positionStyle = positionX !== undefined && positionY !== undefined
        ? { position: 'absolute' as const, left: positionX, top: positionY }
        : {};

    return (
        <AnimatedTouchable
            entering={FadeInUp.delay(delay).springify()}
            style={[
                styles.iconButton,
                animatedStyle,
                glowStyle,
                positionStyle,
                {
                    borderColor: getBorderColor(),
                    borderWidth: feedbackState !== "none" ? 2 : 0, // Only show border on feedback
                    backgroundColor: '#000',
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    borderRadius: ICON_SIZE / 2,
                    shadowColor: iconColor,
                },
            ]}
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            <Ionicons
                name={iconName}
                size={ICON_SIZE}
                color={
                    feedbackState === "correct"
                        ? COLORS.success
                        : feedbackState === "wrong"
                            ? COLORS.error
                            : iconColor
                }
            />
        </AnimatedTouchable>
    );
};



export default function IconMemoryGame() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [status, setStatus] = useState<GameStatus>("IDLE");
    const [currentLayer, setCurrentLayer] = useState(1);
    const [iconPositions, setIconPositions] = useState<{ x: number; y: number }[]>([]);
    const [displayedIcons, setDisplayedIcons] = useState<
        (keyof typeof Ionicons.glyphMap)[]
    >([]);
    const [clickedIcons, setClickedIcons] = useState<Set<string>>(new Set());
    const [availablePool, setAvailablePool] = useState<
        (keyof typeof Ionicons.glyphMap)[]
    >([]);
    const [feedbackIcon, setFeedbackIcon] = useState<{
        icon: string;
        state: "correct" | "wrong";
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [score, setScore] = useState(1500);
    const [timeRemaining, setTimeRemaining] = useState(100);
    const totalTimeLimit = 100;

    const generatePositions = useCallback((count: number) => {
        const newPositions: { x: number; y: number }[] = [];
        const padding = 20; // Padding from edge

        for (let i = 0; i < count; i++) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const x = Math.random() * (GAME_BOX_SIZE - ICON_SIZE - padding * 2) + padding;
                const y = Math.random() * (GAME_BOX_SIZE - ICON_SIZE - padding * 2) + padding;

                // Check overlap
                let overlap = false;
                for (const pos of newPositions) {
                    const dist = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
                    if (dist < ICON_SIZE * 1.1) { // Ensure some spacing
                        overlap = true;
                        break;
                    }
                }

                if (!overlap) {
                    newPositions.push({ x, y });
                    placed = true;
                }
                attempts++;
            }
            // If failed to place, just place randomly (rare)
            if (!placed) {
                newPositions.push({
                    x: Math.random() * (GAME_BOX_SIZE - ICON_SIZE - padding * 2) + padding,
                    y: Math.random() * (GAME_BOX_SIZE - ICON_SIZE - padding * 2) + padding
                });
            }
        }
        setIconPositions(newPositions);
    }, []);

    // Initialize game
    const initializeGame = useCallback(() => {
        const shuffledIcons = shuffleArray(AVAILABLE_ICONS);
        setAvailablePool(shuffledIcons);
        setClickedIcons(new Set());
        setCurrentLayer(1);
        setFeedbackIcon(null);
        setIsProcessing(false);
        setTimeRemaining(totalTimeLimit);

        // First layer: show INITIAL_ICONS random icons
        const initialIcons = shuffledIcons.slice(0, INITIAL_ICONS);
        setDisplayedIcons(shuffleArray(initialIcons));
        generatePositions(initialIcons.length);
        setStatus("PLAYING");
    }, [generatePositions]);

    // Start game on mount
    useEffect(() => {
        if (status === "IDLE") {
            const timer = setTimeout(initializeGame, 300);
            return () => clearTimeout(timer);
        }
    }, [status, initializeGame]);

    // Timer Logic
    useEffect(() => {
        if (status !== "PLAYING") return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setStatus("GAME_OVER");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [status]);

    // Animation for Shake
    const shake = useSharedValue(0);

    // Handle icon press
    const handleIconPress = useCallback(
        (iconName: keyof typeof Ionicons.glyphMap) => {
            if (isProcessing || status !== "PLAYING") return;

            setIsProcessing(true);

            // Check if this icon was already clicked
            if (clickedIcons.has(iconName)) {
                // FAILURE - clicked a previously selected icon
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setFeedbackIcon({ icon: iconName, state: "wrong" });

                // Trigger Shake Animation
                shake.value = withSequence(
                    withTiming(-10, { duration: 50 }),
                    withRepeat(withTiming(10, { duration: 100 }), 4, true),
                    withTiming(0, { duration: 50 })
                );

                setTimeout(() => {
                    setStatus("GAME_OVER");
                }, 1200); // Increased delay to show error effect
                return;
            }

            // SUCCESS - new icon selected
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setFeedbackIcon({ icon: iconName, state: "correct" });

            // Add to clicked icons
            const newClickedIcons = new Set(clickedIcons);
            newClickedIcons.add(iconName);
            setClickedIcons(newClickedIcons);

            setTimeout(() => {
                // Check if game is won
                if (currentLayer >= TOTAL_LAYERS) {
                    setStatus("SUCCESS");
                    return;
                }

                // Move to next layer
                const nextLayer = currentLayer + 1;
                setCurrentLayer(nextLayer);

                // Add one new icon from the pool
                const usedCount = INITIAL_ICONS + (nextLayer - 1);
                const nextIcon = availablePool[usedCount - 1];

                if (nextIcon) {
                    // Combine all displayed icons with the new one and shuffle positions
                    const newDisplayedIcons = shuffleArray([...displayedIcons, nextIcon]);
                    setDisplayedIcons(newDisplayedIcons);
                    generatePositions(newDisplayedIcons.length);
                }

                setFeedbackIcon(null);
                setIsProcessing(false);
            }, 600);
        },
        [
            isProcessing,
            status,
            clickedIcons,
            currentLayer,
            availablePool,
            displayedIcons,
            generatePositions,
            shake
        ]
    );

    const shakeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shake.value }]
        };
    });

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            {/* Header matching the design: [Level 1] [PieTimer] [1500 pt] */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerLabel}>Level {currentLayer}</Text>
                </View>

                <View style={styles.headerCenter}>
                    <PieTimer remaining={timeRemaining} total={totalTimeLimit} size={32} />
                </View>

                <View style={styles.headerRight}>
                    <Text style={styles.headerLabel}>{score} pt</Text>
                </View>
            </View>

            {/* Game Area */}
            <View style={styles.gameArea}>
                {status === "PLAYING" && (
                    <Animated.View entering={FadeIn} style={styles.gameContent}>
                        {/* Game Box with Image Background */}
                        <Animated.View style={[styles.gameBox, shakeStyle]}>
                            {/* Image Background */}
                            <Animated.View style={styles.bgImageContainer}>
                                <Image
                                    source={feedbackIcon?.state === "wrong"
                                        ? require("../../assets/images/iconbgRed.png")
                                        : require("../../assets/images/iconbgGreen.png")
                                    }
                                    style={{ width: "100%", height: "100%" }}
                                    resizeMode="cover"
                                />
                            </Animated.View>

                            {/* Icons Grid on top of background */}
                            <View style={styles.iconsOverlay}>
                                {displayedIcons.map((iconName, index) => (
                                    <IconButton
                                        key={`${iconName}-${currentLayer}`}
                                        iconName={iconName}
                                        onPress={() => handleIconPress(iconName)}
                                        delay={index * 50}
                                        isDisabled={isProcessing}
                                        feedbackState={
                                            feedbackIcon?.icon === iconName
                                                ? feedbackIcon.state
                                                : "none"
                                        }
                                        iconColor={ICON_COLORS[index % ICON_COLORS.length]}
                                        positionX={iconPositions[index]?.x}
                                        positionY={iconPositions[index]?.y}
                                    />
                                ))}
                            </View>

                            {/* Central Status Icon (Check/X) - Visible on feedback */}
                            {feedbackIcon && (
                                <Animated.View
                                    entering={ZoomIn}
                                    style={styles.statusIconContainer}
                                >
                                    <Ionicons
                                        name={feedbackIcon.state === "correct" ? "checkmark-circle" : "close-circle"}
                                        size={64}
                                        color={feedbackIcon.state === "correct" ? "#03B56A" : "#FA0004"}
                                        style={{
                                            textShadowColor: 'rgba(0,0,0,0.3)',
                                            textShadowOffset: { width: 0, height: 2 },
                                            textShadowRadius: 4
                                        }}
                                    />
                                </Animated.View>
                            )}
                        </Animated.View>

                    </Animated.View>
                )}
            </View>

            {/* Mascot Feedback at Bottom */}
            <View style={styles.mascotContainer}>
                <MascotFeedback
                    text={
                        feedbackIcon?.state === "correct"
                            ? "Nice keep going"
                            : feedbackIcon?.state === "wrong"
                                ? "Woah good luck next time."
                                : "Tap an icon you haven't clicked!"
                    }
                    mood={
                        feedbackIcon?.state === "correct"
                            ? "happy"
                            : feedbackIcon?.state === "wrong"
                                ? "angry"
                                : "explain"
                    }
                />
            </View>

            {(status === "GAME_OVER" || status === "SUCCESS") && (
                <GameResult
                    scorePercentage={Math.round(((currentLayer - 1) / TOTAL_LAYERS) * 100)}
                    onRetry={initializeGame}
                    onHome={() => router.back()}
                    onExit={() => router.back()}
                    mascotMessage={
                        status === "SUCCESS"
                            ? "Perfect memory! You're amazing!"
                            : "Don't give up! Try again!"
                    }
                />
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
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.card,
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    gameTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    layerText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "600",
        marginTop: 2,
    },

    clickedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(74, 222, 128, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    clickedCount: {
        color: COLORS.success,
        fontSize: 14,
        fontWeight: "bold",
    },
    progressWrapper: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    progressContainer: {
        gap: 8,
    },
    progressTrack: {
        height: 6,
        backgroundColor: COLORS.inactive,
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 4,
    },
    progressDots: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.inactive,
    },
    progressDotActive: {
        backgroundColor: COLORS.primary,
    },
    progressDotCurrent: {
        backgroundColor: "#fff",
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    gameArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    gameContent: {
        alignItems: "center",
        width: "100%",
    },
    instruction: {
        color: "#a1a1aa",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 32,
    },
    instructionHighlight: {
        color: "#fff",
        fontWeight: "bold",
    },
    iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 16,
        paddingHorizontal: 8,
    },
    iconButton: {
        width: 76,
        height: 76,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#3f3f46",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0,
        shadowRadius: 12,
    },
    hintContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 32,
        gap: 8,
        backgroundColor: "rgba(113, 113, 122, 0.1)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    hintText: {
        color: "#71717a",
        fontSize: 14,
    },
    endScreen: {
        alignItems: "center",
        paddingHorizontal: 20,
    },
    endIconContainer: {
        marginBottom: 24,
    },
    endIconGradient: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: "center",
        alignItems: "center",
    },
    endTitle: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 12,
    },
    endSubtitle: {
        color: "#a1a1aa",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 32,
    },
    statsContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        gap: 24,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
    },
    statLabel: {
        color: "#71717a",
        fontSize: 12,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#3f3f46",
    },
    endButtons: {
        flexDirection: "row",
        gap: 12,
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: '#22c55e',
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 28,
        gap: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    homeButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.card,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "",
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    footerContent: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 20,
    },
    footerItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    footerText: {
        color: "#a1a1aa",
        fontSize: 14,
    },
    footerDivider: {
        width: 1,
        height: 20,
        backgroundColor: "#3f3f46",
    },
    debugContainer: {
        marginHorizontal: 20,
        marginBottom: 8,
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(245, 158, 11, 0.3)",
        borderStyle: "dashed",
        padding: 10,
    },
    debugHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    debugTitle: {
        color: "#f59e0b",
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    debugIconsScroll: {
        gap: 8,
        paddingRight: 10,
    },
    debugIconItem: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(74, 222, 128, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(74, 222, 128, 0.3)",
    },
    gameBox: {
        width: GAME_BOX_SIZE,
        height: GAME_BOX_SIZE, // Square box
        backgroundColor: '#000',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 2,
        borderColor: '#333',
        shadowColor: '#000',
        alignSelf: 'center', // Center the box horizontally
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },

    iconsOverlay: {
        position: 'relative',
        zIndex: 10,
        padding: 20,
    },
    headerLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    headerLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    bgImageContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        zIndex: -1,
    },
    statusIconContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -32,
        marginTop: -32,
        zIndex: 20,
    },
    mascotContainer: {
        paddingBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
});
