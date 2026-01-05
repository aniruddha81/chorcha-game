import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Question } from "../app/questions";

interface QuizOverlayProps {
  visible: boolean;
  question: Question | null;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

export const QuizOverlay: React.FC<QuizOverlayProps> = ({
  visible,
  question,
  onAnswer,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 300 });
      // Reset state when opening
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      scale.value = withTiming(0.8, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const handleOptionPress = (index: number) => {
    if (selectedOption !== null || !question) return; // Prevent double clicking

    setSelectedOption(index);
    const correct = index === question.correctAnswerIndex;
    setIsCorrect(correct);

    // Delay to show result before closing/callback
    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible || !question) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <View
            style={[
              styles.header,
              { backgroundColor: getSubjectColor(question.type) },
            ]}
          >
            <Text style={styles.headerText}>
              {getSubjectTitle(question.type)}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.questionText}>{question.text}</Text>

            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => {
                let buttonStyle: any = styles.optionButton;
                let textStyle: any = styles.optionText;

                // Handle styling based on selection and correctness
                if (selectedOption !== null) {
                  if (index === question.correctAnswerIndex) {
                    // Always show correct answer in green
                    buttonStyle = styles.correctOption;
                    textStyle = styles.selectedOptionText;
                  } else if (index === selectedOption) {
                    // Show wrong selection in red
                    buttonStyle = styles.wrongOption;
                    textStyle = styles.selectedOptionText;
                  } else {
                    buttonStyle = styles.disabledOption;
                  }
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={buttonStyle}
                    onPress={() => handleOptionPress(index)}
                    activeOpacity={0.8}
                    disabled={selectedOption !== null}
                  >
                    <Text style={textStyle}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isCorrect !== null && (
              <View style={styles.feedbackContainer}>
                <Text
                  style={[
                    styles.feedbackText,
                    { color: isCorrect ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {isCorrect ? "Correct! 🎉" : "Try Again! ❌"}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const getSubjectColor = (type: string) => {
  switch (type) {
    case "math":
      return "#FFD700"; // Gold
    case "gk":
      return "#2196F3"; // Blue
    case "eng":
      return "#9C27B0"; // Purple
    case "vocab":
      return "#FF5722"; // Orange
    case "english":
      return "#4CAF50"; // Green
    default:
      return "#333";
  }
};

const getSubjectTitle = (type: string) => {
  switch (type) {
    case "math":
      return "Math Challenge";
    case "gk":
      return "General Knowledge";
    case "vocab":
      return "Vocabulary Builder";
    case "english":
      return "English Grammar";
    default:
      return "Quiz";
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  correctOption: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  wrongOption: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  disabledOption: {
    backgroundColor: "#f9f9f9",
    borderColor: "#eee",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    opacity: 0.6,
  },
  selectedOptionText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "700",
  },
  feedbackContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: "700",
  },
});
