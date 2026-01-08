import { AnimatedNumberBadge } from "@/components/AnimatedNumberBadge";
import { LevelCompleteAnimation } from "@/components/LevelCompleteAnimation";
import { MascotFeedback } from "@/components/MascotFeedback";
import { ZipCell } from "@/components/ZipCell";
import { ZIP_COLORS, ZIP_LEVELS } from "@/constants/zipGameConfig";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
   Alert,
   Dimensions,
   Platform,
   StyleSheet,
   Text,
   TouchableOpacity,
   View
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
   FadeIn,
   FadeInDown,
   runOnJS,
   SlideInDown,
   SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type GameStatus = "PLAYING" | "LEVEL_COMPLETE" | "GAME_OVER";

export default function ZipGameScreen() {
   const router = useRouter();
   const insets = useSafeAreaInsets();

   const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
   const [score, setScore] = useState(0);
   const [status, setStatus] = useState<GameStatus>("PLAYING");
   const [mascotMessage, setMascotMessage] = useState("");

   // Path state: array of cell indices the player has drawn through
   const [path, setPath] = useState<number[]>([]);

   // Grid layout reference for hit testing
   const [gridLayout, setGridLayout] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
   } | null>(null);

   const gridRef = useRef<View>(null);

   const currentLevel = ZIP_LEVELS[currentLevelIndex];
   const totalCells = currentLevel.rows * currentLevel.cols;

   // Calculate cell size based on screen width
   const gridPadding = 24;
   const maxGridWidth = SCREEN_WIDTH - gridPadding * 2;
   const cellSize = Math.min(60, Math.floor(maxGridWidth / currentLevel.cols));
   const gridWidth = cellSize * currentLevel.cols;
   const gridHeight = cellSize * currentLevel.rows;

   // Get the starting cell (cell with number 1)
   const getStartCell = useCallback((): number => {
      for (const [cellIndex, num] of currentLevel.numberedCells.entries()) {
         if (num === 1) return cellIndex;
      }
      return 0;
   }, [currentLevel]);

   // Get max number in the level
   const maxNumber = useMemo(() => {
      let max = 0;
      currentLevel.numberedCells.forEach((num) => {
         if (num > max) max = num;
      });
      return max;
   }, [currentLevel]);

   // Initial Mascot Message
   useEffect(() => {
      const timer = setTimeout(() => {
         if (status === "PLAYING" && path.length === 0) {
            setMascotMessage(`Connect 1 to ${maxNumber} to fill the grid!`);
         }
      }, 600);
      return () => clearTimeout(timer);
   }, [currentLevelIndex, maxNumber, status]);

   // Dismiss mascot on interaction
   const dismissMascot = useCallback(() => {
      if (mascotMessage) {
         setMascotMessage("");
      }
   }, [mascotMessage]);

   // Find the next required numbered cell
   const getNextRequiredNumber = useCallback((): number => {
      let lastHitNumber = 0;
      for (const cellIndex of path) {
         const num = currentLevel.numberedCells.get(cellIndex);
         if (num !== undefined && num > lastHitNumber) {
            lastHitNumber = num;
         }
      }
      return lastHitNumber + 1;
   }, [path, currentLevel]);

   // Get cell index from coordinates
   const getCellFromPosition = useCallback(
      (x: number, y: number): number | null => {
         if (!gridLayout) return null;

         const relX = x - gridLayout.x;
         const relY = y - gridLayout.y;

         if (relX < 0 || relX >= gridWidth || relY < 0 || relY >= gridHeight) {
            return null;
         }

         const col = Math.floor(relX / cellSize);
         const row = Math.floor(relY / cellSize);

         if (row < 0 || row >= currentLevel.rows || col < 0 || col >= currentLevel.cols) {
            return null;
         }

         return row * currentLevel.cols + col;
      },
      [gridLayout, gridWidth, gridHeight, cellSize, currentLevel]
   );

   // Check if two cells are adjacent (horizontally or vertically)
   const areAdjacent = (cell1: number, cell2: number): boolean => {
      const row1 = Math.floor(cell1 / currentLevel.cols);
      const col1 = cell1 % currentLevel.cols;
      const row2 = Math.floor(cell2 / currentLevel.cols);
      const col2 = cell2 % currentLevel.cols;

      const rowDiff = Math.abs(row1 - row2);
      const colDiff = Math.abs(col1 - col2);

      return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
   };

   // Validate if adding a cell to the path is valid
   const canAddToPath = useCallback(
      (cellIndex: number): boolean => {
         // If path is empty, must start at cell 1
         if (path.length === 0) {
            return cellIndex === getStartCell();
         }

         // Can't revisit cells already in path
         if (path.includes(cellIndex)) {
            return false;
         }

         // Must be adjacent to last cell
         const lastCell = path[path.length - 1];
         if (!areAdjacent(lastCell, cellIndex)) {
            return false;
         }

         // Check if we're skipping a required numbered cell
         const nextRequired = getNextRequiredNumber();
         const cellNumber = currentLevel.numberedCells.get(cellIndex);

         // If this cell has a number, it must be the next required one or lower
         if (cellNumber !== undefined && cellNumber > nextRequired) {
            return false;
         }

         return true;
      },
      [path, getStartCell, getNextRequiredNumber, currentLevel]
   );

   // Check if the current path is a valid solution
   const checkWinCondition = useCallback((): boolean => {
      // Must have filled all cells
      if (path.length !== totalCells) return false;

      // Must have hit all numbers in sequence
      let lastNumber = 0;
      for (const cellIndex of path) {
         const num = currentLevel.numberedCells.get(cellIndex);
         if (num !== undefined) {
            if (num !== lastNumber + 1) return false;
            lastNumber = num;
         }
      }

      // Must have hit all numbers
      return lastNumber === maxNumber;
   }, [path, totalCells, currentLevel, maxNumber]);

   // Handle backtracking
   const handleBacktrack = useCallback(
      (cellIndex: number) => {
         const indexInPath = path.indexOf(cellIndex);
         if (indexInPath !== -1 && indexInPath < path.length - 1) {
            // Backtrack to this cell
            setPath(path.slice(0, indexInPath + 1));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            dismissMascot();
         }
      },
      [path, dismissMascot]
   );

   // Add cell to path
   const addToPath = useCallback(
      (cellIndex: number) => {
         if (status !== "PLAYING") return;

         dismissMascot();

         // Check for backtracking
         if (path.includes(cellIndex)) {
            handleBacktrack(cellIndex);
            return;
         }

         if (canAddToPath(cellIndex)) {
            const newPath = [...path, cellIndex];
            setPath(newPath);

            const cellNumber = currentLevel.numberedCells.get(cellIndex);
            if (cellNumber !== undefined) {
               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } else {
               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            // Check win after adding
            if (newPath.length === totalCells) {
               // Verify we hit all numbers correctly
               let lastNumber = 0;
               let valid = true;
               for (const idx of newPath) {
                  const num = currentLevel.numberedCells.get(idx);
                  if (num !== undefined) {
                     if (num !== lastNumber + 1) {
                        valid = false;
                        break;
                     }
                     lastNumber = num;
                  }
               }

               if (valid && lastNumber === maxNumber) {
                  setStatus("LEVEL_COMPLETE");
                  setScore((s) => s + currentLevel.level * 100);
                  setMascotMessage("Awesome! You completed the level!");
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
               }
            }
         }
      },
      [
         status,
         path,
         canAddToPath,
         handleBacktrack,
         totalCells,
         currentLevel,
         maxNumber,
         dismissMascot,
      ]
   );

   // Pan gesture for drawing
   const panGesture = Gesture.Pan()
      .minDistance(0)
      .onStart((e) => {
         const cell = getCellFromPosition(e.absoluteX, e.absoluteY);
         if (cell !== null) {
            runOnJS(addToPath)(cell);
         }
      })
      .onUpdate((e) => {
         const cell = getCellFromPosition(e.absoluteX, e.absoluteY);
         if (cell !== null) {
            runOnJS(addToPath)(cell);
         }
      });

   // Tap gesture to start from cell 1
   const tapGesture = Gesture.Tap().onEnd((e) => {
      const cell = getCellFromPosition(e.absoluteX, e.absoluteY);
      if (cell !== null) {
         runOnJS(addToPath)(cell);
      }
   });

   const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

   // Reset current level
   const resetLevel = () => {
      setPath([]);
      setStatus("PLAYING");
      setMascotMessage(`Connect 1 to ${maxNumber} to fill the grid!`);
   };

   // Go to next level
   const nextLevel = () => {
      if (currentLevelIndex + 1 < ZIP_LEVELS.length) {
         setCurrentLevelIndex((prev) => prev + 1);
         setPath([]);
         setStatus("PLAYING");
         setMascotMessage("");
      } else {
         Alert.alert("🎉 Victory!", `You completed all ${ZIP_LEVELS.length} levels!\nFinal Score: ${score}`, [
            {
               text: "Play Again", onPress: () => {
                  setCurrentLevelIndex(0);
                  setPath([]);
                  setScore(0);
                  setStatus("PLAYING");
                  setMascotMessage("");
               }
            },
            { text: "Home", onPress: () => router.back() },
         ]);
      }
   };

   // Get cell center position for SVG path
   const getCellCenter = (cellIndex: number) => {
      const row = Math.floor(cellIndex / currentLevel.cols);
      const col = cellIndex % currentLevel.cols;
      return {
         x: col * cellSize + cellSize / 2,
         y: row * cellSize + cellSize / 2,
      };
   };

   // Generate SVG path string
   const pathString = useMemo(() => {
      if (path.length === 0) return "";

      const points = path.map((cellIndex) => getCellCenter(cellIndex));
      let d = `M ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
         d += ` L ${points[i].x} ${points[i].y}`;
      }

      return d;
   }, [path, cellSize, currentLevel.cols]);

   // Find cell with next target number
   const nextTargetCell = useMemo(() => {
      const nextNum = getNextRequiredNumber();
      for (const [cellIndex, num] of currentLevel.numberedCells.entries()) {
         if (num === nextNum) return cellIndex;
      }
      return null;
   }, [getNextRequiredNumber, currentLevel]);

   return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
         <StatusBar style="dark" />



         {/* Instructions */}
         <Animated.View entering={FadeIn.delay(300)} style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
               Connect <Text style={styles.highlight}>1</Text> to{" "}
               <Text style={styles.highlight}>{maxNumber}</Text> • Fill every cell
            </Text>
         </Animated.View>

         {/* Grid Container */}
         <GestureDetector gesture={composedGesture}>
            <Animated.View
               entering={FadeInDown.delay(200).springify()}
               style={styles.gridWrapper}
            >
               {/* Header moved here */}
               <Animated.View
                  entering={FadeInDown.delay(100)}
                  style={[
                     styles.header,
                     {
                        width: gridWidth,
                        paddingHorizontal: 0,
                        paddingTop: 0,
                        paddingBottom: 8
                     }
                  ]}
               >
                  <View style={styles.levelContainer}>
                     <Text style={styles.headerText}>Level {currentLevel.level}</Text>
                  </View>
                  <View style={styles.scoreContainer}>
                     <Text
                        style={[
                           styles.scoreBonusText,
                           { opacity: status === "LEVEL_COMPLETE" ? 1 : 0 }
                        ]}
                     >
                        +{currentLevel.level * 100}
                     </Text>
                     <Text style={styles.headerText}>{score} pt</Text>
                  </View>
               </Animated.View>

               <View
                  ref={gridRef}
                  style={[
                     styles.gridContainer,
                     {
                        width: gridWidth + 2,
                        height: gridHeight + 2,
                     },
                  ]}
                  onLayout={() => {
                     if (gridRef.current) {
                        if (Platform.OS === 'web') {
                           // Web: use getBoundingClientRect
                           const element = gridRef.current as unknown as HTMLElement;
                           if (element.getBoundingClientRect) {
                              const rect = element.getBoundingClientRect();
                              setGridLayout({
                                 x: rect.left + 1, // Offset for border
                                 y: rect.top + 1,  // Offset for border
                                 width: gridWidth,
                                 height: gridHeight,
                              });
                           }
                        } else {
                           // Native: use measureInWindow
                           gridRef.current.measureInWindow((x, y) => {
                              setGridLayout({
                                 x: x + 1, // Offset for border
                                 y: y + 1, // Offset for border
                                 width: gridWidth,
                                 height: gridHeight,
                              });
                           });
                        }
                     }
                  }}
               >
                  {/* Grid cells */}
                  <View style={styles.grid}>
                     {Array.from({ length: currentLevel.rows }).map((_, row) => (
                        <View key={row} style={styles.row}>
                           {Array.from({ length: currentLevel.cols }).map((_, col) => {
                              const cellIndex = row * currentLevel.cols + col;
                              const cellNumber = currentLevel.numberedCells.get(cellIndex);
                              return (
                                 <ZipCell
                                    key={cellIndex}
                                    index={cellIndex}
                                    number={cellNumber}
                                    cols={currentLevel.cols}
                                    rows={currentLevel.rows}
                                    isNextTarget={cellIndex === nextTargetCell && !path.includes(cellIndex)}
                                    cellSize={cellSize}
                                 />
                              );
                           })}
                        </View>
                     ))}
                  </View>

                  {/* SVG Path overlay */}
                  <View style={styles.pathOverlay} pointerEvents="none">
                     <Svg width={gridWidth} height={gridHeight}>
                        {/* Path line */}
                        {pathString && (
                           <Path
                              d={pathString}
                              stroke={ZIP_COLORS.path}
                              strokeWidth={cellSize * 0.28}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                              opacity={1}
                           />
                        )}
                        {/* Current position indicator - only show if current cell has no number */}
                        {path.length > 0 && !currentLevel.numberedCells.has(path[path.length - 1]) && (
                           <Circle
                              cx={getCellCenter(path[path.length - 1]).x}
                              cy={getCellCenter(path[path.length - 1]).y}
                              r={cellSize * 0.2}
                              fill={ZIP_COLORS.path}
                              opacity={1}
                           />
                        )}
                     </Svg>
                  </View>

                  {/* Number badges layer - renders on top of everything */}
                  <View style={styles.numberBadgesLayer} pointerEvents="none">
                     {Array.from(currentLevel.numberedCells.entries()).map(([cellIndex, num]) => {
                        const center = getCellCenter(cellIndex);
                        const isSelected = path.includes(cellIndex);
                        return (
                           <AnimatedNumberBadge
                              key={cellIndex}
                              num={num}
                              isSelected={isSelected}
                              cellSize={cellSize}
                              centerX={center.x}
                              centerY={center.y}
                           />
                        );
                     })}
                  </View>
               </View>
            </Animated.View>
         </GestureDetector>

         {/* Progress indicator */}
         <Animated.View entering={FadeIn.delay(400)} style={styles.progressContainer}>
            <View style={styles.progressBar}>
               <Animated.View
                  style={[
                     styles.progressFill,
                     {
                        width: `${(path.length / totalCells) * 100}%`,
                     },
                  ]}
               />
            </View>
            <Text style={styles.progressText}>
               {path.length} / {totalCells} cells
            </Text>
         </Animated.View>

         {/* Controls */}
         <Animated.View entering={SlideInDown.delay(500)} style={styles.footer}>
            <TouchableOpacity
               style={styles.resetButton}
               onPress={resetLevel}
               activeOpacity={0.7}
            >
               <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
               style={styles.backButton}
               onPress={() => router.back()}
               activeOpacity={0.7}
            >
               <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
         </Animated.View>

         {/* Mascot Overlay */}
         {mascotMessage ? (
            <Animated.View
               entering={SlideInDown.duration(400).springify().damping(18)}
               exiting={SlideOutDown.duration(300)}
               style={styles.mascotOverlay}
            >
               <MascotFeedback text={mascotMessage} />
            </Animated.View>
         ) : null}

         {/* Level Complete Animation */}
         <LevelCompleteAnimation
            isVisible={status === "LEVEL_COMPLETE"}
            onAnimationComplete={nextLevel}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: ZIP_COLORS.background,
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
   },
   levelContainer: {},
   headerText: {
      fontSize: 24,
      fontWeight: "500",
      color: "#000000",
      fontFamily: Platform.select({ ios: "System", android: "Roboto" }),
   },
   scoreContainer: {
      alignItems: "flex-end",
   },
   scoreBonusText: {
      fontSize: 16,
      color: ZIP_COLORS.success,
      fontWeight: "600",
      marginBottom: 2,
   },
   instructionContainer: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      display: "none", // Hide instructions to match clean design
   },
   instructionText: {
      fontSize: 16,
      color: "#a1a1aa",
      textAlign: "center",
   },
   highlight: {
      color: ZIP_COLORS.accent,
      fontWeight: "bold",
   },
   gridWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   gridContainer: {
      backgroundColor: ZIP_COLORS.card,
      borderRadius: 24,
      padding: 0, // Remove padding so grid lines touch edges? No, we want grid inside.
      // Actually, if we want grid lines to look like the image (contained within), we probably want padding or overflow hidden.
      // The ZipCell handles *internal* borders.
      // We need a border around the whole thing.
      borderWidth: 1,
      borderColor: ZIP_COLORS.gridLine,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      overflow: 'hidden', // To clip the content to rounded corners
   },
   pathOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 10,
   },
   numberBadgesLayer: {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 20,
   },
   grid: {
      zIndex: 1,
   },
   row: {
      flexDirection: "row",
   },
   progressContainer: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      alignItems: "center",
      opacity: 0, // Hide progress bar for now, as it's not in the design image
   },
   progressBar: {
      width: "100%",
      height: 6,
      backgroundColor: "#E4E4E7",
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 8,
   },
   progressFill: {
      height: "100%",
      backgroundColor: ZIP_COLORS.accent,
      borderRadius: 3,
   },
   progressText: {
      fontSize: 14,
      color: "#71717a",
      fontWeight: "500",
   },
   footer: {
      flexDirection: "row",
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 32,
      gap: 12,
   },
   resetButton: {
      flex: 1,
      backgroundColor: "#fff",
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#e4e4e7",
   },
   resetButtonText: {
      color: "#000",
      fontSize: 18,
      fontWeight: "600",
   },
   backButton: {
      flex: 1,
      backgroundColor: "transparent",
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
   },
   backButtonText: {
      color: "#71717a",
      fontSize: 18,
      fontWeight: "600",
   },
   mascotOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 2000,
   },
});
