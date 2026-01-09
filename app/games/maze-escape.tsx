import { GameResult } from "@/components/GameResult";
import { MascotFeedback } from "@/components/MascotFeedback";
import { PieTimer } from "@/components/PieTimer";
import { COLORS } from "@/constants/gameConfig";
import {
    GAME_CONFIG,
    MASCOT_MESSAGES,
    MAZE_COLORS,
    MAZE_LEVELS
} from "@/constants/mazeConfig";
import { generateMaze } from "@/utils/mazeGenerator";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============= TYPES =============
type GameStatus = "idle" | "playing" | "won" | "lost";
type Direction = "up" | "down" | "left" | "right";
type AnimatedNumber = ReturnType<typeof useSharedValue<number>>;

interface Position {
    r: number;
    c: number;
}

// Import maze cell type from generator
import { MazeCell as MazeCellData, MazeGrid } from "@/utils/mazeGenerator";

// ============= CONSTANTS =============
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const WALL_THICKNESS = 4; // Thicker border for better visibility

// ============= HELPER FUNCTIONS =============
const getRandomMessage = (messages: string[]): string => {
    return messages[Math.floor(Math.random() * messages.length)];
};

const calculateDistance = (startPos: Position, endPos: Position): number => {
    return Math.abs(endPos.r - startPos.r) + Math.abs(endPos.c - startPos.c);
};

// ============= CELL COMPONENT =============
interface CellProps {
    data: MazeCellData;
    size: number;
    isPlayer: boolean;
    isEnd: boolean;
    isStart: boolean;
    row: number;
    col: number;
    totalRows: number;
    totalCols: number;
}

const Cell: React.FC<CellProps> = React.memo(({
    data, size, isPlayer, isEnd, isStart,
    row, col, totalRows, totalCols
}) => {
    const { top, right, bottom, left } = data;
    const isLastRow = row === totalRows - 1;
    const isLastCol = col === totalCols - 1;

    const showTop = top;
    const showLeft = left;
    const showBottom = isLastRow && bottom;
    const showRight = isLastCol && right;

    const cornerRadius = WALL_THICKNESS * 0.6;

    return (
        <View
            style={[
                cellStyles.cell,
                {
                    width: size,
                    height: size,
                    borderTopWidth: showTop ? WALL_THICKNESS : 0,
                    borderLeftWidth: showLeft ? WALL_THICKNESS : 0,
                    borderBottomWidth: showBottom ? WALL_THICKNESS : 0,
                    borderRightWidth: showRight ? WALL_THICKNESS : 0,
                    borderTopLeftRadius: (showTop && showLeft) ? cornerRadius : 0,
                    borderTopRightRadius: (showTop && showRight) ? cornerRadius : 0,
                    borderBottomLeftRadius: (showBottom && showLeft) ? cornerRadius : 0,
                    borderBottomRightRadius: (showBottom && showRight) ? cornerRadius : 0,
                },
            ]}
        >
            {isStart && !isPlayer && (
                <View style={[cellStyles.marker, { backgroundColor: '#22d3ee' }]} />
            )}
            {isEnd && (
                <View style={[cellStyles.marker, { backgroundColor: '#22c55e' }]} />
            )}
        </View>
    );
});

const cellStyles = StyleSheet.create({
    cell: {
        borderColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    marker: {
        width: '40%',
        height: '40%',
        borderRadius: 50,
    },
});

// ============= PLAYER COMPONENT (Green Frog with Flame Trail) =============
interface PlayerProps {
    cellSize: number;
    animatedX: AnimatedNumber;
    animatedY: AnimatedNumber;
    direction: Direction | null;
}

const Player: React.FC<PlayerProps> = React.memo(({ cellSize, animatedX, animatedY, direction }) => {
    const playerSize = cellSize * 0.7; // Slightly larger for the mascot image

    // Main mascot animated style
    const animatedStyle = useAnimatedStyle(() => ({
        position: "absolute",
        left: animatedX.value + (cellSize - playerSize) / 2,
        top: animatedY.value + (cellSize - playerSize) / 2,
        width: playerSize,
        height: playerSize,
        zIndex: 10,
    }));

    // Calculate trail offsets based on direction (opposite to movement)
    const getTrailOffset = (factor: number) => {
        const offset = (cellSize * 0.4) * factor;
        switch (direction) {
            case "up": return { x: 0, y: offset };      // Moving up -> Trail down
            case "down": return { x: 0, y: -offset };   // Moving down -> Trail up
            case "left": return { x: offset, y: 0 };    // Moving left -> Trail right
            case "right": return { x: -offset, y: 0 };  // Moving right -> Trail left
            default: return { x: 0, y: 0 };
        }
    };

    // Render trail only when moving
    const TrailItem = ({ index, opacity }: { index: number, opacity: number }) => {
        if (!direction) return null;

        const offset = getTrailOffset(index);

        const style = useAnimatedStyle(() => ({
            position: "absolute",
            left: animatedX.value + (cellSize - playerSize) / 2 + offset.x,
            top: animatedY.value + (cellSize - playerSize) / 2 + offset.y,
            width: playerSize,
            height: playerSize,
            opacity: opacity,
            zIndex: 10 - index,
            transform: [{ scale: 1 - (index * 0.1) }] // Slightly smaller trails
        }));

        return (
            <Animated.View style={style}>
                <Image
                    source={require("../../assets/images/chorcha-mascot.png")}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                />
            </Animated.View>
        );
    };

    return (
        <>
            {/* Motion Blur Trail */}
            {direction && (
                <>
                    <TrailItem index={1} opacity={0.4} />
                    <TrailItem index={2} opacity={0.2} />
                </>
            )}

            {/* Main Mascot */}
            <Animated.View style={animatedStyle}>
                <Image
                    source={require("../../assets/images/chorcha-mascot.png")}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                />
            </Animated.View>
        </>
    );
});

interface MazeBoardProps {
    grid: MazeGrid;
    playerPos: Position;
    endPos: Position;
    startPos: Position;
    cellSize: number;
    animatedX: AnimatedNumber;
    animatedY: AnimatedNumber;
    direction: Direction | null;
}

const MazeBoard: React.FC<MazeBoardProps> = React.memo(
    ({ grid, playerPos, endPos, startPos, cellSize, animatedX, animatedY, direction }) => {
        if (!grid || grid.length === 0) return null;

        const totalRows = grid.length;
        const totalCols = grid[0].length;

        return (
            <View style={mazeBoardStyles.mazeContainer}>
                {grid.map((row, r) => (
                    <View key={`row-${r}`} style={mazeBoardStyles.row}>
                        {row.map((cell, c) => {
                            const isPlayer = playerPos.r === r && playerPos.c === c;
                            const isEnd = endPos.r === r && endPos.c === c;
                            const isStart = startPos.r === r && startPos.c === c;
                            return (
                                <Cell
                                    key={`cell-${r}-${c}`}
                                    data={cell}
                                    size={cellSize}
                                    isPlayer={isPlayer}
                                    isEnd={isEnd}
                                    isStart={isStart}
                                    row={r}
                                    col={c}
                                    totalRows={totalRows}
                                    totalCols={totalCols}
                                />
                            );
                        })}
                    </View>
                ))}
                <Player
                    cellSize={cellSize}
                    animatedX={animatedX}
                    animatedY={animatedY}
                    direction={direction}
                />
            </View>
        );
    }
);

const mazeBoardStyles = StyleSheet.create({
    mazeContainer: {
        position: 'relative',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    row: {
        flexDirection: 'row',
    },
});

// ============= SWIPE INDICATOR COMPONENT =============
const SwipeIndicator: React.FC<{ direction: Direction | null }> = ({ direction }) => {
    if (!direction) return null;

    const getRotation = () => {
        switch (direction) {
            case "up":
                return "0deg";
            case "right":
                return "90deg";
            case "down":
                return "180deg";
            case "left":
                return "270deg";
        }
    };

    return (
        <Animated.View
            entering={FadeIn}
            style={[styles.swipeIndicator, { transform: [{ rotate: getRotation() }] }]}
        >
            <Ionicons name="arrow-up" size={32} color={COLORS.primary} />
        </Animated.View>
    );
};

// ============= MAIN GAME COMPONENT =============
export default function MazeEscapeGame() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Maze grid state
    const [grid, setGrid] = useState<MazeGrid>([]);

    // Game state
    const [status, setStatus] = useState<GameStatus>("idle");
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [score, setScore] = useState(0);
    const [moveCount, setMoveCount] = useState(0);
    const [playerPos, setPlayerPos] = useState<Position>({ r: 0, c: 0 });
    const [mascotMessage, setMascotMessage] = useState(MASCOT_MESSAGES.idle);
    const [lastSwipeDirection, setLastSwipeDirection] = useState<Direction | null>(null);

    // Animation values
    const animatedX = useSharedValue(0);
    const animatedY = useSharedValue(0);
    const boardScale = useSharedValue(1);

    // Timer ref
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Current level config (for time limits etc)
    const currentLevel = useMemo(() => MAZE_LEVELS[currentLevelIndex], [currentLevelIndex]);

    // Maze dimensions based on level (increasing complexity)
    const getMazeDimensions = (levelIndex: number) => {
        // Level 1: 10x10, Level 5: 14x14
        const size = 10 + levelIndex;
        return { rows: size, cols: size };
    };

    // Calculate cell size based on grid dimensions
    const cellSize = useMemo(() => {
        if (grid.length === 0) return 30;
        const maxWidth = SCREEN_WIDTH - 40; // Slightly more width
        const maxHeight = SCREEN_HEIGHT * 0.6; // Larger board height
        const cols = grid[0].length;
        const rows = grid.length;
        return Math.min(maxWidth / cols, maxHeight / rows, 40);
    }, [grid]);

    // Start and End positions (fixed for now: top-left start, bottom-right end)
    const startPos: Position = { r: 0, c: 0 };
    const endPos = useMemo<Position>(() => ({
        r: grid.length > 0 ? grid.length - 1 : 0,
        c: grid.length > 0 ? grid[0].length - 1 : 0
    }), [grid]);

    // Initialize game
    const initializeGame = useCallback((levelIndex: number = 0) => {
        const levelConfig = MAZE_LEVELS[levelIndex];
        const { rows, cols } = getMazeDimensions(levelIndex);

        // Generate new maze
        const newGrid = generateMaze(rows, cols);
        setGrid(newGrid);

        // Reset player to start
        const initialPos: Position = { r: 0, c: 0 };
        setPlayerPos(initialPos);
        animatedX.value = 0;
        animatedY.value = 0;

        setCurrentLevelIndex(levelIndex);
        setTimeRemaining(levelConfig.timeLimit);
        setMoveCount(0);
        setMascotMessage(MASCOT_MESSAGES.start);
        setLastSwipeDirection(null);
        setStatus("playing");

        // Start timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [animatedX, animatedY]);

    // Stop timer
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Handle time up
    useEffect(() => {
        if (timeRemaining <= 0 && status === "playing") {
            stopTimer();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setMascotMessage(getRandomMessage(MASCOT_MESSAGES.lost));
            setStatus("lost");
        }
    }, [timeRemaining, status, stopTimer]);

    // Update mascot messages based on game state
    useEffect(() => {
        if (status !== "playing") return;

        // Hurry messages when time is low
        if (timeRemaining <= GAME_CONFIG.hurryTimeThreshold && timeRemaining > 0) {
            setMascotMessage(getRandomMessage(MASCOT_MESSAGES.hurry));
            return;
        }

        // Almost there messages when close to exit
        const distance = calculateDistance(playerPos, endPos);
        if (distance <= 2) {
            setMascotMessage(getRandomMessage(MASCOT_MESSAGES.almostThere));
            return;
        }

        // Regular playing messages
        if (moveCount > 0 && moveCount % 5 === 0) {
            setMascotMessage(getRandomMessage(MASCOT_MESSAGES.playing));
        }
    }, [timeRemaining, playerPos, moveCount, status, endPos]);

    // Check for win condition
    const checkWin = useCallback(
        (newPos: Position) => {
            if (newPos.r === endPos.r && newPos.c === endPos.c) {
                stopTimer();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Calculate score
                const timeBonus = timeRemaining * currentLevel.timeBonusMultiplier;
                const movePenalty = Math.max(0, moveCount - 15) * 2;
                const finalScore = currentLevel.baseScore + timeBonus - movePenalty;

                setScore((prev) => prev + Math.max(finalScore, 10));
                setMascotMessage(getRandomMessage(MASCOT_MESSAGES.won));
                setStatus("won");

                // Board celebration animation
                boardScale.value = withSequence(
                    withSpring(1.05, { damping: 3 }),
                    withSpring(1, { damping: 5 })
                );
            }
        },
        [endPos, currentLevel, timeRemaining, moveCount, stopTimer, boardScale]
    );

    // Move player - check wall constraints from cell data
    const movePlayer = useCallback(
        (direction: Direction) => {
            if (status !== "playing" || grid.length === 0) return;

            const { r, c } = playerPos;
            const currentCell = grid[r][c];
            let newR = r;
            let newC = c;
            let blocked = false;

            switch (direction) {
                case "up":
                    if (currentCell.top) {
                        blocked = true;
                    } else {
                        newR = r - 1;
                    }
                    break;
                case "down":
                    if (currentCell.bottom) {
                        blocked = true;
                    } else {
                        newR = r + 1;
                    }
                    break;
                case "left":
                    if (currentCell.left) {
                        blocked = true;
                    } else {
                        newC = c - 1;
                    }
                    break;
                case "right":
                    if (currentCell.right) {
                        blocked = true;
                    } else {
                        newC = c + 1;
                    }
                    break;
            }

            // Check bounds
            if (newR < 0 || newR >= grid.length || newC < 0 || newC >= grid[0].length) {
                blocked = true;
            }

            if (blocked) {
                // Hit wall - medium haptic feedback
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                return;
            }


            const newPos: Position = { r: newR, c: newC };
            setPlayerPos(newPos);
            setMoveCount((prev) => prev + 1);

            // Animate player movement with smooth spring physics
            // Adjusted for smoother feel (lower stiffness/damping)
            animatedX.value = withSpring(newC * cellSize, {
                damping: 14,
                stiffness: 90,
                mass: 0.6,
            });
            animatedY.value = withSpring(newR * cellSize, {
                damping: 14,
                stiffness: 90,
                mass: 0.6,
            });

            // Check for win
            checkWin(newPos);
        },
        [status, grid, playerPos, cellSize, animatedX, animatedY, checkWin]
    );

    // Pan responder for swipe detection
    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderRelease: (_, gestureState) => {
                    const { dx, dy } = gestureState;
                    const absX = Math.abs(dx);
                    const absY = Math.abs(dy);

                    if (absX < GAME_CONFIG.minSwipeDistance && absY < GAME_CONFIG.minSwipeDistance) {
                        return;
                    }

                    let direction: Direction;
                    if (absX > absY) {
                        direction = dx > 0 ? "right" : "left";
                    } else {
                        direction = dy > 0 ? "down" : "up";
                    }

                    setLastSwipeDirection(direction);
                    movePlayer(direction);

                    setTimeout(() => setLastSwipeDirection(null), 300);
                },
            }),
        [movePlayer]
    );

    // Handle next level
    const handleNextLevel = useCallback(() => {
        if (currentLevelIndex < MAZE_LEVELS.length - 1) {
            initializeGame(currentLevelIndex + 1);
        } else {
            setMascotMessage("🎉 You completed all mazes! Amazing!");
        }
    }, [currentLevelIndex, initializeGame]);

    // Handle retry
    const handleRetry = useCallback(() => {
        setScore(0);
        initializeGame(currentLevelIndex);
    }, [currentLevelIndex, initializeGame]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            stopTimer();
        };
    }, [stopTimer]);

    // Start game on mount
    useEffect(() => {
        if (status === "idle") {
            const timer = setTimeout(() => initializeGame(0), 300);
            return () => clearTimeout(timer);
        }
    }, [status, initializeGame]);

    // Board animated style
    const boardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: boardScale.value }],
    }));

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <PieTimer
                        remaining={timeRemaining}
                        total={currentLevel.timeLimit}
                        size={40}
                    />
                </View>

                <View style={styles.headerRight}>
                    <View style={styles.scoreBadge}>
                        <Ionicons name="star" size={16} color="#f59e0b" />
                        <Text style={styles.scoreText}>{score}</Text>
                    </View>
                </View>
            </View>

            {/* Game Area */}
            <View style={styles.gameArea} {...panResponder.panHandlers}>
                {status === "playing" && (
                    <Animated.View
                        entering={FadeIn}
                        style={[styles.gameContent, boardAnimatedStyle]}
                    >

                        <MazeBoard
                            grid={grid}
                            playerPos={playerPos}
                            startPos={startPos}
                            endPos={endPos}
                            cellSize={cellSize}
                            animatedX={animatedX}
                            animatedY={animatedY}
                            direction={lastSwipeDirection}
                        />
                        <SwipeIndicator direction={lastSwipeDirection} />
                    </Animated.View>
                )}

                {/* Win / Lose Screen - Use GameResult Component */}
                {(status === "won" || status === "lost") && (
                    <GameResult
                        scorePercentage={
                            status === "won"
                                ? Math.round((timeRemaining / currentLevel.timeLimit) * 100)
                                : Math.round((score / 1000) * 10) // Approximate score-based percentage
                        }
                        onRetry={status === "won" ? handleNextLevel : handleRetry}
                        onHome={() => router.back()}
                        onExit={() => router.back()}
                        mascotMessage={
                            status === "won"
                                ? "Maze escaped! Great navigation!"
                                : "Time's up! Don't give up!"
                        }
                    />
                )}
            </View>

            {/* Mascot Feedback - Only show during gameplay */}
            {status === "playing" && <MascotFeedback text={mascotMessage} />}
        </View>
    );
}

// ============= STYLES =============
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
        color: "#111",
        fontSize: 20,
        fontWeight: "bold",
    },
    levelText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "600",
        marginTop: 2,
    },
    headerRight: {
        width: 60,
        alignItems: "flex-end",
    },
    scoreBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    scoreText: {
        color: "#f59e0b",
        fontSize: 14,
        fontWeight: "bold",
    },
    hud: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.card,
        marginHorizontal: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        gap: 20,
    },
    hudItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    hudDivider: {
        width: 1,
        height: 24,
        backgroundColor: "#3f3f46",
    },
    timerText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    timerTextUrgent: {
        color: COLORS.error,
    },
    hudText: {
        color: "#a1a1aa",
        fontSize: 14,
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
    instructionContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        backgroundColor: "rgba(34, 211, 238, 0.1)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    instruction: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "500",
    },
    mazeContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        backgroundColor: MAZE_COLORS.background,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    mazeGrid: {
        position: "relative",
        overflow: "hidden",
    },
    mazeRow: {
        flexDirection: "row",
    },
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginBottom: 16,
        backgroundColor: "rgba(30, 41, 59, 0.9)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 4,
    },
    legendText: {
        color: "#e2e8f0",
        fontSize: 12,
    },
    swipeIndicator: {
        position: "absolute",
        bottom: -60,
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
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        gap: 16,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    statLabel: {
        color: "#71717a",
        fontSize: 11,
        marginTop: 4,
        textAlign: "center",
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
    primaryButton: {
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
    primaryButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    secondaryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.card,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#3f3f46",
    },
});
