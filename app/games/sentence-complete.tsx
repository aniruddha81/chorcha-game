import {
   CATEGORY_COLORS,
   GAME_COLORS,
   SENTENCE_QUESTIONS,
   type SentenceQuestion
} from "@/constants/sentenceGameData";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import Animated, {
   Easing,
   FadeIn,
   FadeInDown,
   FadeInUp,
   runOnJS,
   useAnimatedStyle,
   useSharedValue,
   withDelay,
   withSequence,
   withSpring,
   withTiming,
   ZoomIn,
   ZoomOut
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TIME_PER_QUESTION = 15;
const BASE_SCORE = 100;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFETTI PARTICLE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ConfettiParticleProps {
   index: number;
   isVisible: boolean;
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = ({
   index,
   isVisible,
}) => {
   const translateX = useSharedValue(0);
   const translateY = useSharedValue(0);
   const scale = useSharedValue(0);
   const opacity = useSharedValue(0);
   const rotation = useSharedValue(0);

   const angle = (index / 16) * Math.PI * 2;
   const distance = 120 + Math.random() * 80;
   const size = 10 + Math.random() * 12;
   const delay = Math.random() * 150;

   const colors = [
      GAME_COLORS.primary,
      GAME_COLORS.secondary,
      GAME_COLORS.success,
      "#fbbf24",
      "#3b82f6",
      "#06b6d4",
   ];
   const color = colors[index % colors.length];

   useEffect(() => {
      if (isVisible) {
         scale.value = withDelay(
            delay,
            withSequence(
               withSpring(1.3, { damping: 8, stiffness: 200 }),
               withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) })
            )
         );
         opacity.value = withDelay(
            delay,
            withSequence(
               withTiming(1, { duration: 80 }),
               withDelay(500, withTiming(0, { duration: 300 }))
            )
         );
         translateX.value = withDelay(
            delay,
            withTiming(Math.cos(angle) * distance, {
               duration: 800,
               easing: Easing.out(Easing.cubic),
            })
         );
         translateY.value = withDelay(
            delay,
            withTiming(Math.sin(angle) * distance - 40, {
               duration: 800,
               easing: Easing.out(Easing.cubic),
            })
         );
         rotation.value = withDelay(
            delay,
            withTiming(Math.random() * 540 - 270, { duration: 800 })
         );
      } else {
         scale.value = 0;
         opacity.value = 0;
         translateX.value = 0;
         translateY.value = 0;
         rotation.value = 0;
      }
   }, [
      isVisible,
      angle,
      delay,
      distance,
      opacity,
      rotation,
      scale,
      translateX,
      translateY,
   ]);

   const animatedStyle = useAnimatedStyle(() => ({
      transform: [
         { translateX: translateX.value },
         { translateY: translateY.value },
         { scale: scale.value },
         { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
   }));

   return (
      <Animated.View
         style={[
            styles.confettiParticle,
            {
               width: size,
               height: size,
               backgroundColor: color,
               borderRadius: Math.random() > 0.5 ? size / 2 : 3,
            },
            animatedStyle,
         ]}
      />
   );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUCCESS ANIMATION COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SuccessAnimationProps {
   isVisible: boolean;
   onComplete?: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
   isVisible,
   onComplete,
}) => {
   const ringScale = useSharedValue(0);
   const ringOpacity = useSharedValue(0);
   const checkScale = useSharedValue(0);
   const checkRotation = useSharedValue(-30);

   useEffect(() => {
      if (isVisible) {
         // Expanding ring
         ringScale.value = withTiming(2.5, {
            duration: 500,
            easing: Easing.out(Easing.cubic),
         });
         ringOpacity.value = withSequence(
            withTiming(0.7, { duration: 100 }),
            withTiming(0, { duration: 400 })
         );

         // Check mark bounce
         checkScale.value = withSequence(
            withSpring(1.4, { damping: 5, stiffness: 180 }),
            withSpring(1, { damping: 10, stiffness: 200 })
         );
         checkRotation.value = withSpring(0, { damping: 8 });

         if (onComplete) {
            setTimeout(() => {
               runOnJS(onComplete)();
            }, 1000);
         }
      } else {
         ringScale.value = 0;
         ringOpacity.value = 0;
         checkScale.value = 0;
         checkRotation.value = -30;
      }
   }, [
      isVisible,
      ringScale,
      ringOpacity,
      checkScale,
      checkRotation,
      onComplete,
   ]);

   const ringStyle = useAnimatedStyle(() => ({
      transform: [{ scale: ringScale.value }],
      opacity: ringOpacity.value,
   }));

   const checkStyle = useAnimatedStyle(() => ({
      transform: [
         { scale: checkScale.value },
         { rotate: `${checkRotation.value}deg` },
      ],
   }));

   if (!isVisible) return null;

   return (
      <View style={styles.successOverlay} pointerEvents="none">
         {/* Expanding ring */}
         <Animated.View style={[styles.successRing, ringStyle]} />

         {/* Confetti particles */}
         <View style={styles.confettiContainer}>
            {Array.from({ length: 16 }).map((_, i) => (
               <ConfettiParticle key={i} index={i} isVisible={isVisible} />
            ))}
         </View>

         {/* Check mark */}
         <Animated.View style={[styles.checkContainer, checkStyle]}>
            <Text style={styles.checkEmoji}>✨</Text>
         </Animated.View>
      </View>
   );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPTION BUTTON COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface OptionButtonProps {
   option: string;
   index: number;
   onPress: () => void;
   isCorrect: boolean;
   isSelected: boolean;
   showResult: boolean;
   disabled: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({
   option,
   index,
   onPress,
   isCorrect,
   isSelected,
   showResult,
   disabled,
}) => {
   const scale = useSharedValue(1);
   const shake = useSharedValue(0);
   const bgOpacity = useSharedValue(0);

   useEffect(() => {
      if (showResult && isSelected) {
         if (isCorrect) {
            scale.value = withSequence(
               withSpring(1.08, { damping: 6, stiffness: 200 }),
               withSpring(1, { damping: 10 })
            );
            bgOpacity.value = withTiming(1, { duration: 200 });
         } else {
            shake.value = withSequence(
               withTiming(-8, { duration: 50 }),
               withTiming(8, { duration: 50 }),
               withTiming(-6, { duration: 50 }),
               withTiming(6, { duration: 50 }),
               withTiming(0, { duration: 50 })
            );
            bgOpacity.value = withTiming(1, { duration: 200 });
         }
      } else if (showResult && isCorrect && !isSelected) {
         // Highlight correct answer even if not selected
         bgOpacity.value = withDelay(300, withTiming(0.6, { duration: 200 }));
      }
   }, [showResult, isCorrect, isSelected, scale, shake, bgOpacity]);

   const animatedStyle = useAnimatedStyle(() => {
      const backgroundColor = showResult
         ? isCorrect
            ? `rgba(74, 222, 128, ${bgOpacity.value})`
            : isSelected
               ? `rgba(248, 113, 113, ${bgOpacity.value})`
               : "transparent"
         : "transparent";

      return {
         transform: [{ scale: scale.value }, { translateX: shake.value }],
         backgroundColor,
         borderRadius: 16,
      };
   });

   const handlePressIn = () => {
      if (!disabled) {
         scale.value = withSpring(0.96, { damping: 15 });
      }
   };

   const handlePressOut = () => {
      if (!disabled) {
         scale.value = withSpring(1, { damping: 10 });
      }
   };

   const letters = ["A", "B", "C", "D"];

   return (
      <Animated.View
         entering={FadeInUp.delay(100 + index * 80).springify()}
         style={animatedStyle}
      >
         <TouchableOpacity
            style={[
               styles.optionButton,
               showResult && isCorrect && styles.optionCorrect,
               showResult && isSelected && !isCorrect && styles.optionWrong,
            ]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={0.9}
         >
            <View
               style={[
                  styles.optionLetter,
                  showResult && isCorrect && styles.optionLetterCorrect,
                  showResult && isSelected && !isCorrect && styles.optionLetterWrong,
               ]}
            >
               <Text
                  style={[
                     styles.optionLetterText,
                     showResult &&
                     (isCorrect || (isSelected && !isCorrect)) &&
                     styles.optionLetterTextActive,
                  ]}
               >
                  {letters[index]}
               </Text>
            </View>
            <Text style={styles.optionText}>{option}</Text>
            {showResult && isCorrect && (
               <Animated.View entering={ZoomIn.springify()}>
                  <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
               </Animated.View>
            )}
            {showResult && isSelected && !isCorrect && (
               <Animated.View entering={ZoomIn.springify()}>
                  <Ionicons name="close-circle" size={24} color="#f87171" />
               </Animated.View>
            )}
         </TouchableOpacity>
      </Animated.View>
   );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLOATING ELEMENTS COMPONENT (Background decoration)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIMER BAR COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TimerBarProps {
   timeLeft: number;
   totalTime: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ timeLeft, totalTime }) => {
   const progress = timeLeft / totalTime;
   const width = useSharedValue(progress * 100);

   useEffect(() => {
      width.value = withTiming(progress * 100, { duration: 200 });
   }, [progress, width]);

   const animatedStyle = useAnimatedStyle(() => {
      return {
         width: `${width.value}%`,
      };
   });

   const getColor = () => {
      if (progress > 0.6) return GAME_COLORS.success;
      if (progress > 0.3) return GAME_COLORS.warning;
      return GAME_COLORS.error;
   };

   return (
      <View style={styles.timerBarContainer}>
         <Animated.View
            style={[
               styles.timerBarFill,
               animatedStyle,
               { backgroundColor: getColor() },
            ]}
         />
      </View>
   );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN GAME COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function SentenceCompleteGame() {
   const router = useRouter();
   const insets = useSafeAreaInsets();

   const [score, setScore] = useState(0);
   const [streak, setStreak] = useState(0);
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
   const [selectedOption, setSelectedOption] = useState<string | null>(null);
   const [showResult, setShowResult] = useState(false);
   const [showSuccess, setShowSuccess] = useState(false);
   const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
   const [isGameOver, setIsGameOver] = useState(false);
   const [questionsAnswered, setQuestionsAnswered] = useState(0);
   const [correctAnswers, setCorrectAnswers] = useState(0);

   // Shuffle questions on mount
   const shuffledQuestions = useMemo(() => {
      return [...SENTENCE_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
   }, []);

   const currentQuestion: SentenceQuestion | undefined =
      shuffledQuestions[currentQuestionIndex];

   // Shuffle options for current question
   const shuffledOptions = useMemo(() => {
      if (!currentQuestion) return [];
      return [...currentQuestion.options].sort(() => Math.random() - 0.5);
   }, [currentQuestion]);

   const goToNextQuestion = useCallback(() => {
      if (currentQuestionIndex >= shuffledQuestions.length - 1) {
         setIsGameOver(true);
         return;
      }

      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setTimeLeft(TIME_PER_QUESTION);
   }, [currentQuestionIndex, shuffledQuestions.length]);

   const handleTimeUp = useCallback(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSelectedOption(null);
      setShowResult(true);
      setStreak(0);
      setQuestionsAnswered((prev) => prev + 1);

      setTimeout(() => {
         goToNextQuestion();
      }, 1500);
   }, [goToNextQuestion]);

   // Timer effect
   useEffect(() => {
      if (isGameOver || showResult) return;

      const timer = setInterval(() => {
         setTimeLeft((prev) => {
            if (prev <= 1) {
               // Time's up - treat as wrong answer
               handleTimeUp();
               return TIME_PER_QUESTION;
            }
            return prev - 1;
         });
      }, 1000);

      return () => clearInterval(timer);
   }, [isGameOver, showResult, currentQuestionIndex, handleTimeUp]);

   const handleOptionSelect = useCallback(
      (option: string) => {
         if (showResult || !currentQuestion) return;

         setSelectedOption(option);
         setShowResult(true);
         setQuestionsAnswered((prev) => prev + 1);

         const isCorrect = option === currentQuestion.correctAnswer;

         if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowSuccess(true);
            const timeBonus = Math.floor(timeLeft * 5);
            const streakBonus = streak * 20;
            const difficultyBonus = currentQuestion.difficulty * 50;
            setScore(
               (prev) => prev + BASE_SCORE + timeBonus + streakBonus + difficultyBonus
            );
            setStreak((prev) => prev + 1);
            setCorrectAnswers((prev) => prev + 1);
         } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setStreak(0);
         }

         setTimeout(() => {
            setShowSuccess(false);
            goToNextQuestion();
         }, 1200);
      },
      [showResult, currentQuestion, timeLeft, streak, goToNextQuestion]
   );

   const restartGame = useCallback(() => {
      setScore(0);
      setStreak(0);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowResult(false);
      setShowSuccess(false);
      setTimeLeft(TIME_PER_QUESTION);
      setIsGameOver(false);
      setQuestionsAnswered(0);
      setCorrectAnswers(0);
   }, []);

   // Render sentence with blank highlighted
   const renderSentence = () => {
      if (!currentQuestion) return null;

      const parts = currentQuestion.sentence.split("____");
      return (
         <Text style={styles.sentenceText}>
            {parts[0]}
            <Text style={styles.blankText}>____</Text>
            {parts[1]}
         </Text>
      );
   };

   if (!currentQuestion && !isGameOver) {
      return (
         <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.loadingText}>Loading...</Text>
         </View>
      );
   }

   // Game Over Screen
   if (isGameOver) {
      const accuracy = Math.round((correctAnswers / questionsAnswered) * 100);

      return (
         <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            <Animated.View entering={FadeInDown.springify()} style={styles.gameOverContainer}>
               <Text style={styles.gameOverTitle}>Game Complete!</Text>

               <View style={styles.statsCard}>
                  <View style={styles.statRow}>
                     <Text style={styles.statLabel}>Final Score</Text>
                     <Text style={styles.statValue}>{score}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statRow}>
                     <Text style={styles.statLabel}>Accuracy</Text>
                     <Text
                        style={[
                           styles.statValue,
                           { color: accuracy >= 70 ? GAME_COLORS.success : GAME_COLORS.error },
                        ]}
                     >
                        {accuracy}%
                     </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statRow}>
                     <Text style={styles.statLabel}>Correct</Text>
                     <Text style={styles.statValue}>
                        {correctAnswers}/{questionsAnswered}
                     </Text>
                  </View>
               </View>

               <View style={styles.gameOverButtons}>
                  <TouchableOpacity
                     style={[styles.gameOverButton, styles.retryButton]}
                     onPress={restartGame}
                  >
                     <Ionicons name="refresh" size={24} color="#fff" />
                     <Text style={styles.gameOverButtonText}>Play Again</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                     style={[styles.gameOverButton, styles.menuButton]}
                     onPress={() => router.back()}
                  >
                     <Ionicons name="home" size={24} color="#fff" />
                     <Text style={styles.gameOverButtonText}>Menu</Text>
                  </TouchableOpacity>
               </View>
            </Animated.View>
         </View>
      );
   }

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

            <View style={styles.progressInfo}>
               <Text style={styles.progressText}>
                  {currentQuestionIndex + 1} / {shuffledQuestions.length}
               </Text>
               <View
                  style={[
                     styles.categoryBadge,
                     { backgroundColor: CATEGORY_COLORS[currentQuestion.category] },
                  ]}
               >
                  <Text style={styles.categoryText}>
                     {/* {CATEGORY_ICONS[currentQuestion.category]}{" "} */}
                     {currentQuestion.category.toUpperCase()}
                  </Text>
               </View>
            </View>

            <View style={styles.scoreContainer}>
               <Text style={styles.scoreValue}>{score}</Text>
               {streak > 0 && (
                  <Animated.Text
                     entering={ZoomIn.springify()}
                     exiting={ZoomOut}
                     style={styles.streakText}
                  >
                     🔥 {streak}
                  </Animated.Text>
               )}
            </View>
         </View>

         {/* Timer Bar */}
         <TimerBar timeLeft={timeLeft} totalTime={TIME_PER_QUESTION} />

         {/* Question Card */}
         <View style={styles.questionContainer}>
            <Animated.View
               key={currentQuestionIndex}
               entering={FadeIn}
               style={styles.questionCard}
            >
               <View style={styles.difficultyIndicator}>
                  {Array.from({ length: 3 }).map((_, i) => (
                     <View
                        key={i}
                        style={[
                           styles.difficultyDot,
                           i < currentQuestion.difficulty && styles.difficultyDotActive,
                        ]}
                     />
                  ))}
               </View>

               {renderSentence()}
            </Animated.View>
         </View>

         {/* Options */}
         <View style={styles.optionsContainer}>
            {shuffledOptions.map((option, index) => (
               <OptionButton
                  key={`${currentQuestionIndex}-${option}`}
                  option={option}
                  index={index}
                  onPress={() => handleOptionSelect(option)}
                  isCorrect={option === currentQuestion.correctAnswer}
                  isSelected={selectedOption === option}
                  showResult={showResult}
                  disabled={showResult}
               />
            ))}
         </View>

         {/* Success Animation */}
         <SuccessAnimation isVisible={showSuccess} />
      </View>
   );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: GAME_COLORS.background,
   },
   loadingText: {
      color: "#fff",
      fontSize: 18,
      textAlign: "center",
      marginTop: 100,
   },

   // Floating background elements
   floatingContainer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
   },
   floatingEmoji: {
      position: "absolute",
      fontSize: 40,
      opacity: 0.15,
   },
   float1: {
      top: "15%",
      left: "8%",
   },
   float2: {
      top: "40%",
      right: "5%",
   },
   float3: {
      bottom: "25%",
      left: "12%",
   },

   // Header
   header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
   },
   backButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: GAME_COLORS.card,
   },
   progressInfo: {
      alignItems: "center",
   },
   progressText: {
      color: GAME_COLORS.textMuted,
      fontSize: 14,
      marginBottom: 4,
   },
   categoryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
   },
   categoryText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "bold",
      letterSpacing: 0.5,
   },
   scoreContainer: {
      alignItems: "flex-end",
   },
   scoreValue: {
      color: GAME_COLORS.primary,
      fontSize: 28,
      fontWeight: "bold",
   },
   streakText: {
      color: GAME_COLORS.secondary,
      fontSize: 14,
      fontWeight: "bold",
   },

   // Timer
   timerBarContainer: {
      height: 4,
      backgroundColor: GAME_COLORS.card,
      marginHorizontal: 16,
      borderRadius: 2,
      overflow: "hidden",
   },
   timerBarFill: {
      height: "100%",
      borderRadius: 2,
   },

   // Question
   questionContainer: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
   },
   questionCard: {
      backgroundColor: GAME_COLORS.card,
      borderRadius: 24,
      padding: 28,
      borderWidth: 1,
      borderColor: GAME_COLORS.border,
      shadowColor: GAME_COLORS.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
   },
   difficultyIndicator: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 16,
      gap: 6,
   },
   difficultyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: GAME_COLORS.border,
   },
   difficultyDotActive: {
      backgroundColor: GAME_COLORS.primary,
   },
   sentenceText: {
      color: "#fff",
      fontSize: 22,
      lineHeight: 34,
      textAlign: "center",
      fontWeight: "500",
   },
   blankText: {
      color: GAME_COLORS.primary,
      fontWeight: "bold",
      textDecorationLine: "underline",
      textDecorationColor: GAME_COLORS.primary,
   },

   // Options
   optionsContainer: {
      padding: 16,
      gap: 12,
   },
   optionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: GAME_COLORS.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: GAME_COLORS.border,
      gap: 12,
   },
   optionCorrect: {
      borderColor: GAME_COLORS.success,
   },
   optionWrong: {
      borderColor: GAME_COLORS.error,
   },
   optionLetter: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: GAME_COLORS.cardHover,
      justifyContent: "center",
      alignItems: "center",
   },
   optionLetterCorrect: {
      backgroundColor: GAME_COLORS.success,
   },
   optionLetterWrong: {
      backgroundColor: GAME_COLORS.error,
   },
   optionLetterText: {
      color: GAME_COLORS.textMuted,
      fontSize: 16,
      fontWeight: "bold",
   },
   optionLetterTextActive: {
      color: "#fff",
   },
   optionText: {
      flex: 1,
      color: "#fff",
      fontSize: 17,
      fontWeight: "500",
   },

   // Success Animation
   successOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
   },
   successRing: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: GAME_COLORS.success,
   },
   confettiContainer: {
      position: "absolute",
      width: 1,
      height: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   confettiParticle: {
      position: "absolute",
   },
   checkContainer: {
      position: "absolute",
   },
   checkEmoji: {
      fontSize: 60,
   },

   // Game Over
   gameOverContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
   },
   gameOverTitle: {
      fontSize: 36,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 32,
   },
   statsCard: {
      backgroundColor: GAME_COLORS.card,
      borderRadius: 24,
      padding: 24,
      width: "100%",
      maxWidth: 320,
      borderWidth: 1,
      borderColor: GAME_COLORS.border,
   },
   statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
   },
   statLabel: {
      color: GAME_COLORS.textMuted,
      fontSize: 16,
   },
   statValue: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
   },
   statDivider: {
      height: 1,
      backgroundColor: GAME_COLORS.border,
   },
   gameOverButtons: {
      flexDirection: "row",
      gap: 16,
      marginTop: 32,
   },
   gameOverButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 16,
      gap: 8,
   },
   retryButton: {
      backgroundColor: GAME_COLORS.primary,
   },
   menuButton: {
      backgroundColor: GAME_COLORS.card,
      borderWidth: 1,
      borderColor: GAME_COLORS.border,
   },
   gameOverButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
   },
});
