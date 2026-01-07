/**
 * Weight Balance Game
 * Educational puzzle game where players balance a scale using weighted blocks
 */
import {
    BlockData,
    DraggableBlock,
    GameStatus,
    LayoutRect,
    PAN_WIDTH,
    Scale
} from "@/components/weight-balance";
import { getRandomDecimalBlockSet } from "@/constants/balancedBlockSets";
import { COLORS } from "@/constants/gameConfig";
import { WEIGHT_BALANCE_LEVELS } from "@/constants/weightBalanceConfig";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WeightBalanceGame() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Game state
    const [currentLevel, setCurrentLevel] = useState(0);
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [status, setStatus] = useState<GameStatus>("PLAYING");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [targetPerSide, setTargetPerSide] = useState(0);

    const levelConfig = WEIGHT_BALANCE_LEVELS[currentLevel];

    // Layout state for drop zones
    const [leftPanLayout, setLeftPanLayout] = useState<LayoutRect>({
        x: 0,
        y: 0,
        width: PAN_WIDTH,
        height: 120,
    });
    const [rightPanLayout, setRightPanLayout] = useState<LayoutRect>({
        x: SCREEN_WIDTH - PAN_WIDTH - 30,
        y: 0,
        width: PAN_WIDTH,
        height: 120,
    });
    const [availableLayout] = useState<LayoutRect>({
        x: 0,
        y: 400,
        width: SCREEN_WIDTH,
        height: 200,
    });

    // Initialize level
    const initializeLevel = useCallback(() => {
        const config = WEIGHT_BALANCE_LEVELS[currentLevel];
        const useEightBlocks = config.level <= 5;
        const { blocks: generatedBlocks, targetPerSide: target } =
            getRandomDecimalBlockSet(config.level, useEightBlocks);

        const blockData: BlockData[] = generatedBlocks.map((weight, index) => ({
            id: `block-${index}-${Date.now()}`,
            weight,
            position: "available",
        }));

        setBlocks(blockData);
        setTargetPerSide(target);
        setStatus("PLAYING");
        setTimeLeft(config.timeLimit);
    }, [currentLevel]);

    // Initialize on mount and level change
    useEffect(() => {
        initializeLevel();
    }, [initializeLevel]);

    // Timer
    useEffect(() => {
        if (status !== "PLAYING" || levelConfig.timeLimit === 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatus("LOSE");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, levelConfig.timeLimit]);

    // Memoized block groups
    const leftBlocks = useMemo(
        () => blocks.filter((b) => b.position === "left"),
        [blocks]
    );
    const rightBlocks = useMemo(
        () => blocks.filter((b) => b.position === "right"),
        [blocks]
    );
    const availableBlocks = useMemo(
        () => blocks.filter((b) => b.position === "available"),
        [blocks]
    );

    // Weight calculations
    const leftWeight = useMemo(
        () => leftBlocks.reduce((sum, b) => sum + b.weight, 0),
        [leftBlocks]
    );
    const rightWeight = useMemo(
        () => rightBlocks.reduce((sum, b) => sum + b.weight, 0),
        [rightBlocks]
    );

    // Balance checks
    const isBalanced = Math.abs(leftWeight - rightWeight) < 0.01 && leftWeight > 0;
    const allBlocksUsed = availableBlocks.length === 0;

    // Handle block drop
    const handleBlockDrop = useCallback(
        (blockId: string, zone: "left" | "right" | "available") => {
            if (status !== "PLAYING") return;

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === blockId ? { ...block, position: zone } : block
                )
            );
        },
        [status]
    );

    // Check balance - win requires: all blocks used AND both sides equal
    const checkBalance = useCallback(() => {
        setStatus("CHECKING");

        if (allBlocksUsed && isBalanced) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStatus("WIN");
            const timeBonus = levelConfig.timeLimit > 0 ? timeLeft * 10 : 0;
            const levelPoints = levelConfig.level * 100;
            setScore((prev) => prev + levelPoints + timeBonus);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsShaking(true);
            setTimeout(() => {
                setIsShaking(false);
                setStatus("LOSE");
            }, 500);
        }
    }, [allBlocksUsed, isBalanced, levelConfig, timeLeft]);

    // Next level
    const nextLevel = useCallback(() => {
        if (currentLevel < WEIGHT_BALANCE_LEVELS.length - 1) {
            setCurrentLevel((prev) => prev + 1);
        } else {
            setCurrentLevel(0);
            setScore(0);
        }
    }, [currentLevel]);

    // Retry level
    const retryLevel = useCallback(() => {
        initializeLevel();
    }, [initializeLevel]);

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
                    <Text style={styles.gameTitle}>Weight Balance</Text>
                    <Text style={styles.levelText}>
                        Level {levelConfig.level}: {levelConfig.description}
                    </Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>{score}</Text>
                    <Text style={styles.scoreLabel}>pts</Text>
                </View>
            </View>

            {/* Timer */}
            {levelConfig.timeLimit > 0 && status === "PLAYING" && (
                <Animated.View entering={FadeIn} style={styles.timerContainer}>
                    <Ionicons
                        name="time"
                        size={18}
                        color={timeLeft <= 10 ? COLORS.error : COLORS.primary}
                    />
                    <Text
                        style={[
                            styles.timerText,
                            timeLeft <= 10 && { color: COLORS.error },
                        ]}
                    >
                        {timeLeft}s
                    </Text>
                </Animated.View>
            )}

            {/* Target Weight Display */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.targetCard}>
                <LinearGradient
                    colors={["rgba(34, 211, 238, 0.2)", "rgba(34, 211, 238, 0.05)"]}
                    style={styles.targetGradient}
                >
                    <Text style={styles.targetLabel}>TARGET PER SIDE</Text>
                    <View style={styles.targetValueContainer}>
                        <Text style={styles.targetValue}>
                            {targetPerSide.toFixed(1)}
                        </Text>
                        <Text style={styles.targetUnit}>kg</Text>
                    </View>
                    <Text style={styles.targetHint}>
                        Use ALL {blocks.length} blocks • {blocks.length / 2} per side
                    </Text>
                </LinearGradient>
            </Animated.View>

            {/* Scale */}
            <View
                style={styles.scaleSection}
                onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    setLeftPanLayout((prev) => ({ ...prev, y: y + 100, x: 30 }));
                    setRightPanLayout((prev) => ({
                        ...prev,
                        y: y + 100,
                        x: SCREEN_WIDTH - PAN_WIDTH - 30,
                    }));
                }}
            >
                <Scale
                    leftWeight={leftWeight}
                    rightWeight={rightWeight}
                    isBalanced={isBalanced && leftWeight > 0}
                    isShaking={isShaking}
                />
            </View>

            {/* Blocks on Pans Display */}
            <View style={styles.blocksOnPans}>
                <View style={styles.panBlocks}>
                    <Text style={styles.panBlocksLabel}>Left Pan</Text>
                    <View style={styles.panBlocksList}>
                        {leftBlocks.map((block) => (
                            <DraggableBlock
                                key={block.id}
                                block={block}
                                onDrop={handleBlockDrop}
                                leftPanLayout={leftPanLayout}
                                rightPanLayout={rightPanLayout}
                                disabled={status !== "PLAYING"}
                            />
                        ))}
                    </View>
                </View>
                <View style={styles.panBlocks}>
                    <Text style={styles.panBlocksLabel}>Right Pan</Text>
                    <View style={styles.panBlocksList}>
                        {rightBlocks.map((block) => (
                            <DraggableBlock
                                key={block.id}
                                block={block}
                                onDrop={handleBlockDrop}
                                leftPanLayout={leftPanLayout}
                                rightPanLayout={rightPanLayout}
                                disabled={status !== "PLAYING"}
                            />
                        ))}
                    </View>
                </View>
            </View>

            {/* Available Blocks */}
            {status === "PLAYING" && (
                <View style={styles.availableSection}>
                    <Text style={styles.availableTitle}>Available Blocks</Text>
                    <View style={styles.availableBlocks}>
                        {availableBlocks.map((block) => (
                            <DraggableBlock
                                key={block.id}
                                block={block}
                                onDrop={handleBlockDrop}
                                leftPanLayout={leftPanLayout}
                                rightPanLayout={rightPanLayout}
                                disabled={status !== "PLAYING"}
                            />
                        ))}
                    </View>
                </View>
            )}

            {/* Controls */}
            {status === "PLAYING" && (
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[
                            styles.checkButton,
                            leftBlocks.length === 0 &&
                            rightBlocks.length === 0 &&
                            styles.checkButtonDisabled,
                        ]}
                        onPress={checkBalance}
                        disabled={leftBlocks.length === 0 && rightBlocks.length === 0}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="#000" />
                        <Text style={styles.checkButtonText}>Check Balance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resetButton} onPress={retryLevel}>
                        <Ionicons name="refresh" size={24} color="#000" />
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Win Screen */}
            {status === "WIN" && (
                <Animated.View
                    entering={FadeInDown.springify()}
                    style={styles.resultOverlay}
                >
                    <View style={styles.resultCard}>
                        <LinearGradient
                            colors={["rgba(74, 222, 128, 0.2)", "rgba(74, 222, 128, 0.05)"]}
                            style={styles.resultGradient}
                        >
                            <Ionicons name="trophy" size={60} color={COLORS.success} />
                            <Text style={[styles.resultTitle, { color: COLORS.success }]}>
                                🎉 Balanced!
                            </Text>
                            <Text style={styles.resultSubtitle}>Perfect equilibrium!</Text>
                            <View style={styles.resultStats}>
                                <View style={styles.resultStat}>
                                    <Text style={styles.resultStatValue}>
                                        {levelConfig.level * 100}
                                    </Text>
                                    <Text style={styles.resultStatLabel}>Level Points</Text>
                                </View>
                                {levelConfig.timeLimit > 0 && (
                                    <View style={styles.resultStat}>
                                        <Text style={styles.resultStatValue}>
                                            {timeLeft * 10}
                                        </Text>
                                        <Text style={styles.resultStatLabel}>Time Bonus</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                style={[styles.nextButton, { backgroundColor: COLORS.success }]}
                                onPress={nextLevel}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentLevel < WEIGHT_BALANCE_LEVELS.length - 1
                                        ? "Next Level"
                                        : "Play Again"}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Animated.View>
            )}

            {/* Lose Screen */}
            {status === "LOSE" && (
                <Animated.View
                    entering={FadeInDown.springify()}
                    style={styles.resultOverlay}
                >
                    <View style={styles.resultCard}>
                        <LinearGradient
                            colors={["rgba(248, 113, 113, 0.2)", "rgba(248, 113, 113, 0.05)"]}
                            style={styles.resultGradient}
                        >
                            <Ionicons name="close-circle" size={60} color={COLORS.error} />
                            <Text style={[styles.resultTitle, { color: COLORS.error }]}>
                                ❌ Not Balanced
                            </Text>
                            <Text style={styles.resultSubtitle}>
                                {!allBlocksUsed
                                    ? `Use ALL blocks! ${availableBlocks.length} remaining`
                                    : !isBalanced
                                        ? "The weights are not equal on both sides"
                                        : "Try a different arrangement"}
                            </Text>
                            <View style={styles.resultButtons}>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={retryLevel}
                                >
                                    <Ionicons name="refresh" size={20} color="#fff" />
                                    <Text style={styles.retryButtonText}>Try Again</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.homeButton}
                                    onPress={() => router.back()}
                                >
                                    <Ionicons name="home" size={20} color="#a1a1aa" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
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
    levelText: {
        color: COLORS.primary,
        fontSize: 12,
        marginTop: 2,
    },
    scoreContainer: {
        alignItems: "center",
        backgroundColor: "rgba(74, 222, 128, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    scoreValue: {
        color: COLORS.success,
        fontSize: 18,
        fontWeight: "bold",
    },
    scoreLabel: {
        color: COLORS.success,
        fontSize: 10,
    },
    timerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginBottom: 8,
    },
    timerText: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: "bold",
    },
    targetCard: {
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 16,
    },
    targetGradient: {
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(34, 211, 238, 0.3)",
        borderRadius: 16,
    },
    targetLabel: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1,
        marginBottom: 4,
    },
    targetValueContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
    },
    targetValue: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
    },
    targetUnit: {
        color: "#a1a1aa",
        fontSize: 16,
    },
    targetHint: {
        color: "#71717a",
        fontSize: 12,
        marginTop: 8,
    },
    scaleSection: {
        height: 180,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    blocksOnPans: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
    },
    panBlocks: {
        flex: 1,
        alignItems: "center",
    },
    panBlocksLabel: {
        color: "#71717a",
        fontSize: 12,
        marginBottom: 8,
    },
    panBlocksList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
        minHeight: 70,
    },
    availableSection: {
        flex: 1,
        paddingHorizontal: 20,
    },
    availableTitle: {
        color: "#a1a1aa",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
        textAlign: "center",
    },
    availableBlocks: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
    },
    controls: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    checkButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    checkButtonDisabled: {
        backgroundColor: COLORS.inactive,
        shadowOpacity: 0,
    },
    checkButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    resetButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: COLORS.card,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#3f3f46",
    },
    resetButtonText: {
        color: "#a1a1aa",
        fontSize: 14,
        fontWeight: "600",
    },
    resultOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    resultCard: {
        width: "100%",
        maxWidth: 340,
        borderRadius: 24,
        overflow: "hidden",
    },
    resultGradient: {
        padding: 32,
        alignItems: "center",
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 16,
    },
    resultSubtitle: {
        color: "#a1a1aa",
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
    },
    resultStats: {
        flexDirection: "row",
        gap: 32,
        marginTop: 24,
        marginBottom: 24,
    },
    resultStat: {
        alignItems: "center",
    },
    resultStatValue: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    resultStatLabel: {
        color: "#71717a",
        fontSize: 11,
        marginTop: 4,
    },
    resultButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    nextButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 24,
    },
    nextButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 20,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    homeButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.card,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#3f3f46",
    },
});
