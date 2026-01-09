/**
 * GameResult Component
 * A premium popup-style result screen with smooth animations and polished UI.
 */
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
    ZoomIn
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Premium Color Palette
const COLORS = {
    primary: "#10B981",       // Vibrant Green
    primaryDark: "#059669",
    secondary: "#F59E0B",     // Amber/Gold
    background: "#FFFFFF",
    text: "#1F2937",
    textLight: "#6B7280",
    white: "#FFFFFF",
    overlay: "rgba(0,0,0,0.6)", // Darker, premium backdrop
    success: "#10B981",
    error: "#EF4444",
};

const CIRCLE_SIZE = 160;
const STROKE_WIDTH = 12;

interface GameResultProps {
    scorePercentage: number;
    onRetry: () => void;
    onHome?: () => void;
    onExit?: () => void;
    averageScore?: number;
    mascotMessage?: string;
}

// Animated SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ScoreCircle = ({ percentage }: { percentage: number }) => {
    const progress = useSharedValue(0);
    const scale = useSharedValue(0);

    const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = CIRCLE_SIZE / 2;
    const arcRadius = radius - STROKE_WIDTH / 2;

    // Star Position Logic (Clockwise from Bottom)
    // 90deg offset so 0 is bottom.
    const thetaDegrees = 90 + (percentage / 100) * 360;
    const thetaRadians = thetaDegrees * (Math.PI / 180);
    const starX = center + arcRadius * Math.cos(thetaRadians);
    const starY = center + arcRadius * Math.sin(thetaRadians);

    useEffect(() => {
        progress.value = withDelay(500, withTiming(percentage / 100, { duration: 1500, easing: Easing.out(Easing.exp) }));
        scale.value = withDelay(200, withSpring(1));
    }, [percentage]);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.scoreCircleContainer, style]}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                <Circle cx={center} cy={center} r={radius} stroke="#E5E7EB" strokeWidth={STROKE_WIDTH} fill="transparent" />
                <AnimatedCircle
                    cx={center} cy={center} r={radius}
                    stroke={COLORS.primary}
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedCircleProps}
                    rotation={90}
                    origin={`${center}, ${center}`}
                />
            </Svg>

            {/* Centered Score Text */}
            <View style={styles.innerScoreContainer}>
                <Text style={styles.scoreLabel}>Accuracy</Text>
                <AnimatedPercentageText percentage={percentage} />
            </View>

            {/* Floating Star */}
            <Animated.View
                style={[styles.floatingStar, { left: starX - 16, top: starY - 16 }]}
                entering={ZoomIn.delay(1800).springify()}
            >
                <View style={styles.starBadge}>
                    <Ionicons name="star" size={18} color={COLORS.white} />
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const AnimatedPercentageText = ({ percentage }: { percentage: number }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const startTime = Date.now();

        const timer = setInterval(() => {
            const timePassed = Date.now() - startTime;
            if (timePassed >= duration) {
                setDisplayValue(percentage);
                clearInterval(timer);
                return;
            }
            const progress = timePassed / duration;
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);
            setDisplayValue(Math.floor(percentage * ease));
        }, 16);
        return () => clearInterval(timer);
    }, [percentage]);

    return <Text style={styles.percentageText}>{displayValue}%</Text>;
};

const ActionButton = ({ icon, onPress, delay }: any) => {
    return (
        <Animated.View entering={FadeInUp.delay(delay).springify()}>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPress(); }}
                activeOpacity={0.8}
            >
                <Ionicons name={icon} size={32} color={COLORS.secondary} />
            </TouchableOpacity>
        </Animated.View>
    )
}

export const GameResult = ({ scorePercentage, onRetry, onHome = () => { }, onExit, averageScore = 50 }: GameResultProps) => {
    const router = useRouter();
    const isHighScale = scorePercentage >= averageScore;

    return (
        <View style={styles.overlay}>
            <StatusBar style="light" />
            <View style={styles.backdropOverlay} />

            {/* Main Popup Wrapper (allows mascot overflow) */}
            <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.popupWrapper}>

                {/* Inner Card (Clips Background) */}
                <View style={styles.innerCard}>
                    {/* Background Image for Card */}
                    <Image
                        source={require("../assets/images/resultBG.png")}
                        style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
                        resizeMode="stretch"
                    />

                    {/* Main Content */}
                    <View style={styles.cardContent}>
                        {/* Title */}
                        <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
                            {isHighScale ? "Great Job!" : "Completed!"}
                        </Animated.Text>
                        <Animated.Text entering={FadeInDown.delay(300)} style={styles.subtitle}>
                            {isHighScale ? "You're doing amazing! Keep it up." : "Nice try! Practice makes perfect."}
                        </Animated.Text>

                        {/* Score */}
                        <View style={styles.scoreWrapper}>
                            <ScoreCircle percentage={scorePercentage} />
                        </View>

                        <View style={styles.actionsContainer}>
                            <ActionButton icon="refresh" onPress={onRetry} delay={600} />
                            <ActionButton icon="home" onPress={() => router.back()} delay={700} />
                            <ActionButton icon="log-out" onPress={onExit || (() => router.back())} delay={800} />
                        </View>
                    </View>
                </View>
                <Animated.View
                    entering={FadeInUp.delay(900).springify()}
                    style={styles.mascotContainer}
                >
                    <Image
                        source={require("../assets/images/chorcha-mascot.png")}
                        style={styles.mascotImage}
                        resizeMode="contain"
                    />
                    <View style={[styles.bubble, isHighScale ? styles.bubbleHappy : styles.bubbleSad]}>
                        <Text style={styles.bubbleText}>
                            {isHighScale ? "Wow!" : "Oops!"}
                        </Text>
                        <View style={[styles.bubbleArrow, isHighScale ? styles.arrowHappy : styles.arrowSad]} />
                    </View>
                </Animated.View>

            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    popupWrapper: {
        width: '100%',
        height: '90%',
        maxWidth: 400,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        position: 'relative',
    },
    innerCard: {
        borderRadius: 32,
        overflow: 'hidden',
        width: '100%',
        height: '100%', // Fill wrapper height
    },
    cardContent: {
        // flex: 1, 
        marginVertical: 20,
        paddingVertical: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'space-between', // Distribute elements
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 32,
    },
    scoreWrapper: {
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreCircleContainer: {
        position: 'relative',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
    },
    innerScoreContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    percentageText: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.text,
    },
    floatingStar: {
        position: 'absolute',
        width: 32,
        height: 32,
    },
    starBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingVertical: 12,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E5E7EB',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20, // More spacing
        width: '100%',
        marginBottom: 20
    },
    iconButton: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    mascotContainer: {
        position: 'absolute',
        bottom: 50, // Adjusted for larger size
        right: 30,  // Adjusted for larger size
        width: 160,  // Increased from 120
        height: 160, // Increased from 120
    },
    mascotImage: {
        width: '100%',
        height: '100%',
    },
    bubble: {
        position: 'absolute',
        top: -10,
        left: -30,
        backgroundColor: COLORS.text,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    bubbleHappy: { backgroundColor: COLORS.success },
    bubbleSad: { backgroundColor: COLORS.secondary },
    bubbleText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    bubbleArrow: {
        position: 'absolute',
        bottom: -6,
        right: 12,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderLeftColor: 'transparent',
        borderRightWidth: 6,
        borderRightColor: 'transparent',
        borderTopWidth: 6,
    },
    arrowHappy: { borderTopColor: COLORS.success },
    arrowSad: { borderTopColor: COLORS.secondary },
});

export default GameResult;
