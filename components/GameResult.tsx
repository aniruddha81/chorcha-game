/**
 * GameResult Component
 * Full-screen result overlay that pops up after game ends
 * Matches the design with score circle, action buttons, and mascot feedback
 */
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Easing,
    FadeIn,
    FadeInUp,
    SlideInDown,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
    ZoomIn
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Colors matching the design
const COLORS = {
    primary: "#22C55E",       // Green
    primaryDark: "#16A34A",
    success: "#22C55E",
    error: "#EF4444",         // Red
    white: "#FFFFFF",
    black: "#1C1C1E",
    yellow: "#FFD93D",
    orange: "#FFA500",
};

// Score circle size
const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 14;

interface GameResultProps {
    /** Score percentage (0-100) */
    scorePercentage: number;
    /** Callback when retry button is pressed */
    onRetry: () => void;
    /** Callback when home button is pressed (optional - defaults to router.back()) */
    onHome?: () => void;
    /** Callback when exit button is pressed (optional) */
    onExit?: () => void;
    /** Average score to compare against (default: 50) */
    averageScore?: number;
    /** Custom mascot message (optional - auto-generated based on score) */
    mascotMessage?: string;
}

// Animated SVG Circle for progress
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Score Circle Component
const ScoreCircle = ({ percentage }: { percentage: number }) => {
    const progress = useSharedValue(0);
    const scale = useSharedValue(0.5);

    const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = CIRCLE_SIZE / 2;

    const isGoodScore = percentage >= 50;

    useEffect(() => {
        // Animate the progress arc
        progress.value = withDelay(
            300,
            withTiming(percentage / 100, {
                duration: 1200,
                easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
            })
        );
        // Animate scale in
        scale.value = withDelay(
            100,
            withSpring(1, { damping: 12, stiffness: 100 })
        );
    }, [percentage]);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View
            entering={ZoomIn.delay(100).springify()}
            style={[styles.scoreCircleContainer, containerStyle]}
        >
            {/* Star badge for good scores */}
            {isGoodScore && (
                <Animated.View
                    entering={ZoomIn.delay(800).springify()}
                    style={styles.starContainer}
                >
                    <View style={styles.starBadge}>
                        <Ionicons name="star" size={16} color={COLORS.yellow} />
                    </View>
                </Animated.View>
            )}

            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                {/* Background green circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill={COLORS.primary}
                />

                {/* Inner shadow effect */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius - STROKE_WIDTH / 2}
                    fill="rgba(0,0,0,0.05)"
                />

                {/* Progress arc (white) */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius - STROKE_WIDTH / 2}
                    stroke={COLORS.white}
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedCircleProps}
                    rotation={-90}
                    origin={`${center}, ${center}`}
                />
            </Svg>

            {/* Score Text */}
            <View style={styles.scoreTextContainer}>
                <Text style={styles.scoreLabel}>Your score higher than</Text>
                <AnimatedPercentageText percentage={percentage} />
                <Text style={styles.scoreSubLabel}>of people.</Text>
            </View>
        </Animated.View>
    );
};

// Animated percentage text that counts up
const AnimatedPercentageText = ({ percentage }: { percentage: number }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const duration = 1200;
        const startDelay = 300;

        const timeout = setTimeout(() => {
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplayValue(Math.round(percentage * eased));

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                }
            };
            animate();
        }, startDelay);

        return () => {
            clearTimeout(timeout);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [percentage]);

    return (
        <Text style={styles.scorePercentage}>{displayValue}%</Text>
    );
};

// Action Button Component
const ActionButton = ({
    icon,
    onPress,
    delay = 0,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    delay?: number;
}) => {
    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [onPress]);

    return (
        <Animated.View entering={FadeInUp.delay(delay).springify()}>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Ionicons name={icon} size={24} color={COLORS.primary} />
            </TouchableOpacity>
        </Animated.View>
    );
};

// Mascot with Speech Bubble Component
const MascotWithBubble = ({
    isAboveAverage,
}: {
    isAboveAverage: boolean;
}) => {
    return (
        <Animated.View
            entering={SlideInDown.delay(400).springify()}
            style={styles.mascotSection}
        >
            {/* Speech Bubble */}
            <Animated.View
                entering={ZoomIn.delay(700).springify()}
                style={[
                    styles.speechBubble,
                    isAboveAverage ? styles.speechBubbleRight : styles.speechBubbleLeft,
                ]}
            >
                {/* Arrow indicator */}
                <View style={[
                    styles.arrowIndicator,
                    isAboveAverage ? styles.arrowRight : styles.arrowLeft,
                ]}>
                    <Ionicons
                        name={isAboveAverage ? "trending-up" : "trending-down"}
                        size={14}
                        color={isAboveAverage ? COLORS.success : COLORS.error}
                    />
                </View>

                <Text style={styles.bubbleText}>
                    Your score was{"\n"}
                    <Text style={[
                        styles.bubbleHighlight,
                        { color: isAboveAverage ? COLORS.success : COLORS.error }
                    ]}>
                        {isAboveAverage ? "above" : "below"}
                    </Text>
                    {" "}average
                </Text>

                {/* Speech Bubble Tail */}
                <View style={[
                    styles.bubbleTail,
                    isAboveAverage ? styles.bubbleTailRight : styles.bubbleTailLeft,
                ]} />
            </Animated.View>

            {/* Mascot Image */}
            <View style={[
                styles.mascotImageContainer,
                isAboveAverage ? styles.mascotRight : styles.mascotLeft,
            ]}>
                <Image
                    source={require("../assets/images/chorcha-mascot.png")}
                    style={styles.mascotImage}
                    resizeMode="contain"
                />
            </View>
        </Animated.View>
    );
};

export const GameResult = ({
    scorePercentage,
    onRetry,
    onHome,
    onExit,
    averageScore = 50,
}: GameResultProps) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const isAboveAverage = scorePercentage >= averageScore;

    const handleHome = useCallback(() => {
        if (onHome) {
            onHome();
        } else {
            router.back();
        }
    }, [onHome, router]);

    const handleExit = useCallback(() => {
        if (onExit) {
            onExit();
        } else {
            router.replace("/");
        }
    }, [onExit, router]);

    // Play celebratory haptic for good scores
    useEffect(() => {
        if (isAboveAverage) {
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 400);
        } else {
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }, 400);
        }
    }, [isAboveAverage]);

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.overlay}
        >
            <StatusBar style="dark" />

            {/* Background Image */}
            <ImageBackground
                source={require("../assets/images/resultBG.png")}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                {/* Safe Area Content */}
                <View style={[styles.content, { paddingTop: insets.top + 30 }]}>
                    {/* Score Circle */}
                    <View style={styles.scoreSection}>
                        <ScoreCircle percentage={scorePercentage} />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                        <ActionButton
                            icon="refresh"
                            onPress={onRetry}
                            delay={500}
                        />
                        <ActionButton
                            icon="home"
                            onPress={handleHome}
                            delay={600}
                        />
                        <ActionButton
                            icon="exit-outline"
                            onPress={handleExit}
                            delay={700}
                        />
                    </View>

                    {/* Spacer to push mascot to bottom */}
                    <View style={styles.spacer} />

                    {/* Mascot Section */}
                    <MascotWithBubble isAboveAverage={isAboveAverage} />
                </View>
            </ImageBackground>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
    },
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    scoreSection: {
        marginTop: 20,
    },
    scoreCircleContainer: {
        position: "relative",
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    starContainer: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 10,
    },
    starBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    scoreTextContainer: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    scoreLabel: {
        fontSize: 11,
        color: COLORS.white,
        fontWeight: "500",
        textAlign: "center",
        marginBottom: 2,
        opacity: 0.95,
    },
    scorePercentage: {
        fontSize: 52,
        fontWeight: "bold",
        color: COLORS.white,
        textAlign: "center",
        letterSpacing: -2,
    },
    scoreSubLabel: {
        fontSize: 11,
        color: COLORS.white,
        fontWeight: "400",
        textAlign: "center",
        marginTop: 0,
        opacity: 0.9,
    },
    actionButtonsRow: {
        flexDirection: "row",
        gap: 14,
        marginTop: 28,
    },
    actionButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    spacer: {
        flex: 1,
    },
    mascotSection: {
        width: "100%",
        height: 300,
        position: "relative",
    },
    speechBubble: {
        position: "absolute",
        backgroundColor: COLORS.black,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 18,
        minWidth: 140,
        maxWidth: 180,
        zIndex: 10,
        top: 10,
    },
    speechBubbleLeft: {
        left: 10,
    },
    speechBubbleRight: {
        right: 10,
    },
    bubbleText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "500",
        lineHeight: 20,
    },
    bubbleHighlight: {
        fontWeight: "700",
    },
    bubbleTail: {
        position: "absolute",
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderLeftColor: "transparent",
        borderRightWidth: 10,
        borderRightColor: "transparent",
        borderTopWidth: 14,
        borderTopColor: COLORS.black,
        bottom: -12,
    },
    bubbleTailLeft: {
        left: 25,
        transform: [{ rotate: "-15deg" }],
    },
    bubbleTailRight: {
        right: 25,
        transform: [{ rotate: "15deg" }],
    },
    arrowIndicator: {
        position: "absolute",
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
        top: -8,
    },
    arrowLeft: {
        left: -6,
    },
    arrowRight: {
        right: -6,
    },
    mascotImageContainer: {
        position: "absolute",
        bottom: 0,
        width: 220,
        height: 220,
    },
    mascotLeft: {
        left: -30,
    },
    mascotRight: {
        right: -30,
    },
    mascotImage: {
        width: "100%",
        height: "100%",
    },
});

export default GameResult;
