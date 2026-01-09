/**
 * Weight Balance Game
 * Educational puzzle game where players balance a scale using weighted blocks
 * New design matching the reference with clean UI and mascot feedback
 */
import { GameResult } from "@/components/GameResult";
import { MascotFeedback } from "@/components/MascotFeedback";
import {
    AvailableWeights,
    BlockData,
    GameCard,
    GameHeader,
    GameStatus,
    LayoutRect,
    PAN_WIDTH,
    ScaleBalance,
} from "@/components/weight-balance";
import { getRandomDecimalBlockSet } from "@/constants/balancedBlockSets";
import { WEIGHT_BALANCE_LEVELS } from "@/constants/weightBalanceConfig";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mascot messages for different game states
const MASCOT_MESSAGES = {
    initial: "Match the weights on both side",
    playing: "Match the weights on both side",
    progress: ["You're doing great!", "Keep going!", "Nice work!"],
    win: ["Wow you are doing well", "Perfect balance!", "Excellent job!"],
    lose: ["Try again!", "You can do it!", "Almost there!"],
    balanced: "Looking good! Check your balance!",
};

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
    const [mascotMessage, setMascotMessage] = useState(MASCOT_MESSAGES.initial);

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
        setMascotMessage(MASCOT_MESSAGES.initial);
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
                    setMascotMessage(
                        MASCOT_MESSAGES.lose[Math.floor(Math.random() * MASCOT_MESSAGES.lose.length)]
                    );
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

    // Update mascot message based on progress
    useEffect(() => {
        if (status !== "PLAYING") return;

        if (isBalanced && allBlocksUsed) {
            setMascotMessage(MASCOT_MESSAGES.balanced);
        } else if (leftBlocks.length > 0 || rightBlocks.length > 0) {
            const progressMessages = MASCOT_MESSAGES.progress;
            setMascotMessage(progressMessages[Math.floor(Math.random() * progressMessages.length)]);
        }
    }, [leftBlocks.length, rightBlocks.length, isBalanced, allBlocksUsed, status]);

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

    // Auto-check when all blocks are placed
    useEffect(() => {
        if (status !== "PLAYING" || !allBlocksUsed) return;

        // Small delay before checking
        const checkTimer = setTimeout(() => {
            checkBalance();
        }, 800);

        return () => clearTimeout(checkTimer);
    }, [allBlocksUsed, status]);

    // Check balance
    const checkBalance = useCallback(() => {
        setStatus("CHECKING");

        if (allBlocksUsed && isBalanced) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStatus("WIN");
            const timeBonus = levelConfig.timeLimit > 0 ? timeLeft * 10 : 0;
            const levelPoints = levelConfig.level * 100;
            setScore((prev) => prev + levelPoints + timeBonus);
            setMascotMessage(
                MASCOT_MESSAGES.win[Math.floor(Math.random() * MASCOT_MESSAGES.win.length)]
            );
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsShaking(true);
            setTimeout(() => {
                setIsShaking(false);
                setStatus("LOSE");
                setMascotMessage(
                    MASCOT_MESSAGES.lose[Math.floor(Math.random() * MASCOT_MESSAGES.lose.length)]
                );
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

    // Refs for measurements
    const scaleContainerRef = React.useRef<View>(null);

    // Update measurements on mount and layout changes
    const updateMeasurements = useCallback(() => {
        if (scaleContainerRef.current) {
            scaleContainerRef.current.measureInWindow((x, y, width, height) => {
                // Scale constants from ScaleBalance.tsx
                // The visual scale "wings" are at x + 20 and x + width - 20 basically
                // But strictly speaking, width IS SCALE_SIZE.

                const DROP_ZONE_SIZE = 120;
                const DROP_ZONE_OFFSET_X = 30; // 20 (pan center) - 60 (half drop zone) = -40 ?? 
                // Let's do center based:
                // Left Pan Center = x + 20 (relative to container) -> Absolute = x + 20
                // Right Pan Center = x + width - 20 (relative to container) -> Absolute = x + width - 20

                // Left Zone (Matches JOINT_OFFSET = 10)
                const leftZoneX = x + 10 - (DROP_ZONE_SIZE / 2);
                const leftZoneY = y + 200 - (DROP_ZONE_SIZE / 2);

                // Right Zone
                const rightZoneX = x + width - 10 - (DROP_ZONE_SIZE / 2);

                setLeftPanLayout({
                    x: leftZoneX,
                    y: leftZoneY,
                    width: DROP_ZONE_SIZE,
                    height: DROP_ZONE_SIZE,
                });

                setRightPanLayout({
                    x: rightZoneX,
                    y: leftZoneY, // Same Y
                    width: DROP_ZONE_SIZE,
                    height: DROP_ZONE_SIZE,
                });
            });
        }
    }, []);

    // Also update on mount after short delay to ensure layout is done
    useEffect(() => {
        // Retry measurement a few times to catch layout settle
        const timeouts = [100, 500, 1000].map(delay =>
            setTimeout(updateMeasurements, delay)
        );
        return () => timeouts.forEach(clearTimeout);
    }, [updateMeasurements]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <GameHeader
                level={levelConfig.level}
                score={score}
            />

            {/* Scale Card */}
            <GameCard style={styles.scaleCard}>
                <View
                    ref={scaleContainerRef}
                    style={styles.scaleContainer}
                    onLayout={updateMeasurements}
                >
                    <ScaleBalance
                        leftWeight={leftWeight}
                        rightWeight={rightWeight}
                        leftBlocks={leftBlocks}
                        rightBlocks={rightBlocks}
                        isBalanced={isBalanced && leftWeight > 0}
                        isShaking={isShaking}
                        onDrop={handleBlockDrop}
                        leftPanLayout={leftPanLayout}
                        rightPanLayout={rightPanLayout}
                    />
                </View>
            </GameCard>

            {/* Available Weights */}
            {status === "PLAYING" && (
                <AvailableWeights
                    blocks={availableBlocks}
                    onDrop={handleBlockDrop}
                    leftPanLayout={leftPanLayout}
                    rightPanLayout={rightPanLayout}
                    disabled={status !== "PLAYING"}
                />
            )}

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Mascot Feedback - Only show during gameplay */}
            {status === "PLAYING" && <MascotFeedback text={mascotMessage} />}

            {/* Game Result Screen */}
            {(status === "WIN" || status === "LOSE") && (
                <GameResult
                    scorePercentage={
                        status === "WIN"
                            ? Math.min(100, Math.round((score / ((currentLevel + 1) * 100)) * 100))
                            : Math.round((currentLevel / WEIGHT_BALANCE_LEVELS.length) * 50)
                    }
                    onRetry={status === "WIN" ? nextLevel : retryLevel}
                    onHome={() => router.back()}
                    onExit={() => router.back()}
                    mascotMessage={
                        status === "WIN"
                            ? "Perfect balance! Well done!"
                            : "Not balanced! Try again!"
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    scaleCard: {
        marginTop: 12,
        paddingVertical: 30,
        alignItems: "center",
    },
    scaleContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    spacer: {
        flex: 1,
    },
});
