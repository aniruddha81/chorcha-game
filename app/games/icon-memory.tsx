import { COLORS } from "@/constants/gameConfig";
import { AVAILABLE_ICONS } from "@/constants/iconMemoryGameIcon";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeOut,
    SlideInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";



type GameStatus = "IDLE" | "PLAYING" | "GAME_OVER" | "SUCCESS";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_LAYERS = 10;
const INITIAL_ICONS = 3; // Start with 3 icons on layer 1

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
}

const IconButton: React.FC<IconButtonProps> = ({
    iconName,
    onPress,
    delay,
    isDisabled,
    feedbackState,
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
        return "#3f3f46";
    };

    const getBackgroundColor = () => {
        if (feedbackState === "correct") return "rgba(74, 222, 128, 0.15)";
        if (feedbackState === "wrong") return "rgba(248, 113, 113, 0.15)";
        return COLORS.card;
    };

    return (
        <AnimatedTouchable
            entering={FadeInUp.delay(delay).springify()}
            style={[
                styles.iconButton,
                animatedStyle,
                glowStyle,
                {
                    borderColor: getBorderColor(),
                    backgroundColor: getBackgroundColor(),
                    shadowColor:
                        feedbackState === "correct" ? COLORS.success : COLORS.primary,
                },
            ]}
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            <Ionicons
                name={iconName}
                size={36}
                color={
                    feedbackState === "correct"
                        ? COLORS.success
                        : feedbackState === "wrong"
                            ? COLORS.error
                            : "#fff"
                }
            />
        </AnimatedTouchable>
    );
};

// Progress Bar Component
const ProgressBar: React.FC<{ currentLayer: number; totalLayers: number }> = ({
    currentLayer,
    totalLayers,
}) => {
    const progress = currentLayer / totalLayers;

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
                <Animated.View
                    entering={FadeIn}
                    style={[
                        styles.progressFill,
                        { width: `${progress * 100}%` },
                    ]}
                />
            </View>
            <View style={styles.progressDots}>
                {Array.from({ length: totalLayers }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.progressDot,
                            index < currentLayer && styles.progressDotActive,
                            index === currentLayer - 1 && styles.progressDotCurrent,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

export default function IconMemoryGame() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [status, setStatus] = useState<GameStatus>("IDLE");
    const [currentLayer, setCurrentLayer] = useState(1);
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

    // Initialize game
    const initializeGame = useCallback(() => {
        const shuffledIcons = shuffleArray(AVAILABLE_ICONS);
        setAvailablePool(shuffledIcons);
        setClickedIcons(new Set());
        setCurrentLayer(1);
        setFeedbackIcon(null);
        setIsProcessing(false);

        // First layer: show INITIAL_ICONS random icons
        const initialIcons = shuffledIcons.slice(0, INITIAL_ICONS);
        setDisplayedIcons(shuffleArray(initialIcons));
        setStatus("PLAYING");
    }, []);

    // Start game on mount
    useEffect(() => {
        if (status === "IDLE") {
            const timer = setTimeout(initializeGame, 300);
            return () => clearTimeout(timer);
        }
    }, [status, initializeGame]);

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

                setTimeout(() => {
                    setStatus("GAME_OVER");
                }, 800);
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
        ]
    );

    // Calculate grid layout
    const iconCount = displayedIcons.length;
    const columns = iconCount <= 4 ? 2 : iconCount <= 9 ? 3 : 4;
    const iconSize = Math.min(
        (SCREEN_WIDTH - 80 - (columns - 1) * 16) / columns,
        80
    );

    // Memoized grid style
    const gridStyle = useMemo(
        () => ({
            ...styles.iconGrid,
            maxWidth: columns * (iconSize + 16),
        }),
        [columns, iconSize]
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.gameTitle}>Icon Memory</Text>
                    <Text style={styles.layerText}>
                        Layer {currentLayer} of {TOTAL_LAYERS}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.clickedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.clickedCount}>{clickedIcons.size}</Text>
                    </View>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressWrapper}>
                <ProgressBar currentLayer={currentLayer} totalLayers={TOTAL_LAYERS} />
            </View>

            {/* Debug Preview - Clicked Icons */}
            {status === "PLAYING" && clickedIcons.size > 0 && (
                <View style={styles.debugContainer}>
                    <View style={styles.debugHeader}>
                        <Ionicons name="bug" size={14} color="#f59e0b" />
                        <Text style={styles.debugTitle}>DEBUG: Clicked Icons ({clickedIcons.size})</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.debugIconsScroll}
                    >
                        {Array.from(clickedIcons).map((iconName, index) => (
                            <Animated.View
                                key={iconName}
                                entering={FadeIn.delay(index * 50)}
                                style={styles.debugIconItem}
                            >
                                <Ionicons
                                    name={iconName as keyof typeof Ionicons.glyphMap}
                                    size={20}
                                    color={COLORS.success}
                                />
                            </Animated.View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Game Area */}
            <View style={styles.gameArea}>
                {status === "PLAYING" && (
                    <Animated.View entering={FadeIn} style={styles.gameContent}>
                        <Text style={styles.instruction}>
                            Tap an icon you{" "}
                            <Text style={styles.instructionHighlight}>haven't</Text> selected
                            before
                        </Text>

                        <View style={gridStyle}>
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
                                />
                            ))}
                        </View>

                        <View style={styles.hintContainer}>
                            <Ionicons
                                name="information-circle-outline"
                                size={18}
                                color="#71717a"
                            />
                            <Text style={styles.hintText}>
                                {currentLayer === 1
                                    ? "Pick any icon to start"
                                    : `${displayedIcons.length - clickedIcons.size} safe choice${displayedIcons.length - clickedIcons.size !== 1 ? "s" : ""} remaining`}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Game Over Screen */}
                {status === "GAME_OVER" && (
                    <Animated.View
                        entering={FadeInDown.springify()}
                        style={styles.endScreen}
                    >
                        <View style={styles.endIconContainer}>
                            <LinearGradient
                                colors={["rgba(248, 113, 113, 0.2)", "rgba(248, 113, 113, 0.05)"]}
                                style={styles.endIconGradient}
                            >
                                <Ionicons name="close-circle" size={80} color={COLORS.error} />
                            </LinearGradient>
                        </View>
                        <Text style={styles.endTitle}>Game Over!</Text>
                        <Text style={styles.endSubtitle}>
                            You repeated an icon on Layer {currentLayer}
                        </Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{currentLayer - 1}</Text>
                                <Text style={styles.statLabel}>Layers Cleared</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{clickedIcons.size}</Text>
                                <Text style={styles.statLabel}>Icons Selected</Text>
                            </View>
                        </View>
                        <View style={styles.endButtons}>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={initializeGame}
                            >
                                <Ionicons name="refresh" size={22} color="#fff" />
                                <Text style={styles.retryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.homeButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="home" size={22} color="#a1a1aa" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                {/* Success Screen */}
                {status === "SUCCESS" && (
                    <Animated.View
                        entering={FadeInDown.springify()}
                        style={styles.endScreen}
                    >
                        <View style={styles.endIconContainer}>
                            <LinearGradient
                                colors={["rgba(74, 222, 128, 0.2)", "rgba(74, 222, 128, 0.05)"]}
                                style={styles.endIconGradient}
                            >
                                <Ionicons name="trophy" size={80} color={COLORS.success} />
                            </LinearGradient>
                        </View>
                        <Text style={[styles.endTitle, { color: COLORS.success }]}>
                            Perfect Memory!
                        </Text>
                        <Text style={styles.endSubtitle}>
                            You completed all {TOTAL_LAYERS} layers without repeating!
                        </Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: COLORS.success }]}>
                                    {TOTAL_LAYERS}
                                </Text>
                                <Text style={styles.statLabel}>Layers Completed</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: COLORS.success }]}>
                                    {clickedIcons.size}
                                </Text>
                                <Text style={styles.statLabel}>Unique Icons</Text>
                            </View>
                        </View>
                        <View style={styles.endButtons}>
                            <TouchableOpacity
                                style={[styles.retryButton, { backgroundColor: COLORS.success }]}
                                onPress={initializeGame}
                            >
                                <Ionicons name="refresh" size={22} color="#000" />
                                <Text style={[styles.retryButtonText, { color: "#000" }]}>
                                    Play Again
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.homeButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="home" size={22} color="#a1a1aa" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </View>

            {/* Footer Info */}
            {status === "PLAYING" && (
                <Animated.View
                    entering={SlideInDown.delay(500)}
                    exiting={FadeOut}
                    style={styles.footer}
                >
                    <View style={styles.footerContent}>
                        <View style={styles.footerItem}>
                            <Ionicons name="apps" size={18} color={COLORS.primary} />
                            <Text style={styles.footerText}>
                                {displayedIcons.length} icons shown
                            </Text>
                        </View>
                        <View style={styles.footerDivider} />
                        <View style={styles.footerItem}>
                            <Ionicons name="eye-off" size={18} color="#f59e0b" />
                            <Text style={styles.footerText}>
                                {clickedIcons.size} memorized
                            </Text>
                        </View>
                    </View>
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
    headerRight: {
        width: 44,
        alignItems: "flex-end",
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
        backgroundColor: COLORS.primary,
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
        borderColor: "#3f3f46",
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
});
