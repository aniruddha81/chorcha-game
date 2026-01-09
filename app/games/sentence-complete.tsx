import {
   SENTENCE_QUESTIONS,
   type SentenceQuestion
} from "@/constants/sentenceGameData";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
   Pressable,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import Animated, {
   FadeIn,
   FadeInDown,
   useAnimatedStyle,
   useSharedValue,
   withSequence,
   withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MascotFeedback, MascotMood } from "../../components/MascotFeedback";

const DESIGN_COLORS = {
   background: "#EFEEEE",
   card: "#FFFFFF",
   text: "#1F2937",
   textMuted: "#6B7280",
   optionDefault: "#E5E7EB", // Light gray
   optionText: "#1F2937",
   correct: "#10B981", // Green
   correctText: "#FFFFFF",
   wrong: "#EF4444", // Red
   wrongText: "#FFFFFF",
   outline: "#000000",
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
   correctAnswer: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({
   option,
   index,
   onPress,
   isCorrect,
   isSelected,
   showResult,
   disabled,
   correctAnswer,
}) => {
   const scale = useSharedValue(1);

   useEffect(() => {
      if (showResult && isSelected) {
         scale.value = withSequence(
            withSpring(1.05, { damping: 10 }),
            withSpring(1, { damping: 10 })
         );
      }
   }, [showResult, isSelected, scale]);

   const animatedStyle = useAnimatedStyle(() => {
      return {
         transform: [{ scale: scale.value }],
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

   // Determine styling based on state
   let buttonStyle: any = styles.optionButton;
   let textStyle: any = styles.optionText;

   if (showResult) {
      if (isCorrect && isSelected) {
         // Selected correct answer (Green Fill)
         buttonStyle = { ...buttonStyle, ...styles.optionButtonCorrect };
         textStyle = { ...textStyle, ...styles.optionTextLight };
      } else if (isSelected && !isCorrect) {
         // Selected wrong answer (Red Fill)
         buttonStyle = { ...buttonStyle, ...styles.optionButtonWrong };
         textStyle = { ...textStyle, ...styles.optionTextLight };
      } else if (isCorrect && !isSelected) {
         // Not selected, but is the correct answer (Green Border + Green Text)
         // The user specifically asked: "provide the correct answer the green color border"
         buttonStyle = { ...buttonStyle, ...styles.optionButtonCorrectBorder };
         textStyle = { ...textStyle, ...styles.optionTextCorrect };
      } else {
         // Other unselected options (Gray)
         buttonStyle = styles.optionButton;
         textStyle = styles.optionText;
      }
   }

   return (
      <Animated.View style={[styles.optionWrapper, animatedStyle]}>
         <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={0.9}
         >
            <Text style={textStyle}>{option}</Text>
         </TouchableOpacity>
      </Animated.View>
   );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN GAME COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function SentenceCompleteGame() {
   const router = useRouter();
   const insets = useSafeAreaInsets();

   const [score, setScore] = useState(1500);
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
   const [selectedOption, setSelectedOption] = useState<string | null>(null);
   const [showResult, setShowResult] = useState(false);
   const [isGameOver, setIsGameOver] = useState(false);
   const [mascotMessage, setMascotMessage] = useState("Fill in the sentence with the correct word");
   const [mascotMood, setMascotMood] = useState<MascotMood>("explain");
   const [scoreIncrement, setScoreIncrement] = useState(0);

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

   useEffect(() => {
      // Reset mascot message for new question
      if (!showResult) {
         setMascotMessage("Fill in the sentence with the correct word");
         setMascotMood("explain");
         setScoreIncrement(0);
      }
   }, [currentQuestionIndex, showResult]);

   const goToNextQuestion = useCallback(() => {
      if (currentQuestionIndex >= shuffledQuestions.length - 1) {
         setIsGameOver(true);
         return;
      }

      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
   }, [currentQuestionIndex, shuffledQuestions.length]);

   const handleOptionSelect = useCallback(
      (option: string) => {
         if (showResult || !currentQuestion) return;

         setSelectedOption(option);
         setShowResult(true);

         const isCorrect = option === currentQuestion.correctAnswer;

         if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Random success message
            const successMessages = ["This was the correct answer", "Wow nice one !", "Great job !"];
            const randomMsg = successMessages[Math.floor(Math.random() * successMessages.length)];
            setMascotMessage(randomMsg);
            setMascotMood("happy");

            setScoreIncrement(500);
            setScore((prev) => prev + 500);
         } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setMascotMessage("That's not correct");
            setMascotMood("angry");
            setScoreIncrement(0);
         }
      },
      [showResult, currentQuestion]
   );

   const restartGame = useCallback(() => {
      setScore(1500);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowResult(false);
      setIsGameOver(false);
      setMascotMessage("Fill in the sentence with the correct word");
   }, []);

   const renderCleanSentence = () => {
      if (!currentQuestion) return null;
      const parts = currentQuestion.sentence.split("____");
      const answer = currentQuestion.correctAnswer;
      const isCorrect = selectedOption === currentQuestion.correctAnswer;
      const isWrong = showResult && !isCorrect;

      // Colors based on state
      const blankColor = (showResult && isCorrect) ? DESIGN_COLORS.correct : 'transparent';
      const underlineColor = (showResult && isCorrect) ? DESIGN_COLORS.correct : '#000';

      return (
         <Text style={styles.sentenceText}>
            {parts[0]}
            <Text style={{
               textDecorationLine: 'underline',
               textDecorationColor: underlineColor,
               color: blankColor,
               fontWeight: (showResult && isCorrect) ? 'bold' : '400',
            }}>
               {answer}
            </Text>
            {isWrong && <Text style={styles.crossText}> ×</Text>}
            {parts[1]}
         </Text>
      );
   }


   // Handle tap anywhere to proceed (only when result is showing)
   const handleScreenTap = useCallback(() => {
      if (showResult) {
         goToNextQuestion();
      }
   }, [showResult, goToNextQuestion]);

   if (!currentQuestion && !isGameOver) {
      return (
         <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text>Loading...</Text>
         </View>
      );
   }

   if (isGameOver) {
      return (
         <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <View style={styles.gameOverContainer}>
               <Text style={styles.gameOverTitle}>Level Complete!</Text>
               <Text style={styles.finalScore}>{score} pt</Text>
               <TouchableOpacity style={styles.retryButton} onPress={restartGame}>
                  <Text style={styles.retryButtonText}>Play Again</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
                  <Text style={styles.homeButtonText}>Home</Text>
               </TouchableOpacity>
            </View>
         </View>
      );
   }

   return (
      <Pressable
         style={[styles.container, { paddingTop: insets.top }]}
         onPress={handleScreenTap}
      >
         <StatusBar style="dark" />

         {/* Header */}
         <View style={styles.header}>
            <Text style={styles.levelText}>Level 1</Text>
            <View style={styles.scoreContainer}>
               <Animated.Text
                  entering={FadeInDown}
                  style={[
                     styles.scoreIncrement,
                     { opacity: (scoreIncrement > 0 && showResult) ? 1 : 0 }
                  ]}
               >
                  {scoreIncrement > 0 ? `+${scoreIncrement}` : "+0"}
               </Animated.Text>
               <Text style={styles.scoreText}>{score} pt</Text>
            </View>
         </View>

         {/* Question Card */}
         <View style={styles.cardContainer}>
            <Animated.View
               key={currentQuestionIndex}
               entering={FadeIn}
               style={styles.card}
            >
               {/* Sentence */}
               <View style={styles.sentenceArea}>
                  {renderCleanSentence()}
               </View>

               {/* Options Grid */}
               <View style={styles.optionsGrid}>
                  {shuffledOptions.map((option, index) => (
                     <OptionButton
                        key={`${currentQuestionIndex}-${option}`}
                        option={option}
                        index={index}
                        onPress={() => handleOptionSelect(option)}
                        isCorrect={option === currentQuestion?.correctAnswer}
                        isSelected={selectedOption === option}
                        showResult={showResult}
                        disabled={showResult}
                        correctAnswer={currentQuestion?.correctAnswer || ""}
                     />
                  ))}
               </View>
            </Animated.View>
         </View>

         {/* Tap to continue hint */}
         {showResult && (
            <Animated.Text entering={FadeIn.delay(500)} style={styles.tapHint}>
               Tap anywhere to continue
            </Animated.Text>
         )}

         {/* Mascot Feedback */}
         <MascotFeedback text={mascotMessage} mood={mascotMood} />
      </Pressable>
   );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: DESIGN_COLORS.background,
   },
   tapHint: {
      textAlign: 'center',
      color: DESIGN_COLORS.textMuted,
      fontSize: 14,
      marginBottom: 8,
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end", // Align bottom of text
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 20,
   },
   levelText: {
      fontSize: 18,
      fontWeight: '500',
      color: DESIGN_COLORS.text,
   },
   scoreContainer: {
      alignItems: 'flex-end',
   },
   scoreText: {
      fontSize: 18,
      fontWeight: '500',
      color: DESIGN_COLORS.text,
   },
   scoreIncrement: {
      fontSize: 16,
      fontWeight: 'bold',
      color: DESIGN_COLORS.correct,
      marginBottom: 2,
   },

   // Card
   cardContainer: {
      paddingHorizontal: 16,
      flex: 1, // Take available space
      justifyContent: 'flex-start',
   },
   card: {
      backgroundColor: DESIGN_COLORS.card,
      borderRadius: 24,
      padding: 24,
      paddingBottom: 40,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
      minHeight: 400, // Ensure decent height
   },

   sentenceArea: {
      marginBottom: 50,
      marginTop: 30,
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 8,
   },
   sentenceText: {
      fontSize: 26,
      fontWeight: '400',
      color: DESIGN_COLORS.text,
      lineHeight: 40,
      textAlign: 'center',
   },
   crossText: {
      fontSize: 26,
      fontWeight: 'bold',
      color: DESIGN_COLORS.wrong,
   },

   // Options
   optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      justifyContent: 'center',
      width: '100%',
   },
   optionWrapper: {
      width: '45%', 
   },
   optionButton: {
      backgroundColor: DESIGN_COLORS.optionDefault,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      minHeight: 60,
   },
   optionButtonCorrect: {
      backgroundColor: DESIGN_COLORS.correct,
      borderColor: DESIGN_COLORS.correct,
   },
   optionButtonCorrectBorder: {
      backgroundColor: DESIGN_COLORS.card,
      borderColor: DESIGN_COLORS.correct,
      borderWidth: 2,
   },
   optionButtonWrong: {
      backgroundColor: DESIGN_COLORS.wrong,
      borderColor: DESIGN_COLORS.wrong,
   },
   optionText: {
      fontSize: 24,
      fontWeight: '400',
      color: DESIGN_COLORS.optionText,
   },
   optionTextLight: {
      color: '#FFFFFF',
   },
   optionTextCorrect: {
      color: DESIGN_COLORS.correct,
      fontWeight: 'bold',
   },

   // Game Over
   gameOverContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   gameOverTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 10,
   },
   finalScore: {
      fontSize: 48,
      fontWeight: 'bold',
      color: DESIGN_COLORS.correct,
      marginBottom: 40,
   },
   retryButton: {
      backgroundColor: DESIGN_COLORS.correct,
      paddingHorizontal: 40,
      paddingVertical: 16,
      borderRadius: 30,
      marginBottom: 16,
   },
   retryButtonText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
   },
   homeButton: {
      paddingHorizontal: 40,
      paddingVertical: 16,
   },
   homeButtonText: {
      color: DESIGN_COLORS.textMuted,
      fontSize: 18,
   },
});
