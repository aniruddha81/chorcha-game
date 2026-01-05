import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WORDS } from "../app/questions";

interface WordScrambleProps {
  visible: boolean;
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

export const WordScramble: React.FC<WordScrambleProps> = ({
  visible,
  onComplete,
  onClose,
}) => {
  const [currentWord, setCurrentWord] = useState<{
    scrambled: string;
    original: string;
    hint: string;
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<
    { char: string; id: number }[]
  >([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      startNewGame();
    }
  }, [visible]);

  const startNewGame = () => {
    const random = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(random);
    setUserAnswer([]);
    setFeedback(null);

    // Create letters with unique IDs to handle duplicate characters
    const letters = random.scrambled.split("").map((char, index) => ({
      char,
      id: index,
    }));
    setAvailableLetters(letters);
  };

  const handleLetterPress = (item: { char: string; id: number }) => {
    setUserAnswer([...userAnswer, item.char]);
    setAvailableLetters(availableLetters.filter((l) => l.id !== item.id));
  };

  const handleReset = () => {
    if (!currentWord) return;
    setUserAnswer([]);
    const letters = currentWord.scrambled.split("").map((char, index) => ({
      char,
      id: index,
    }));
    setAvailableLetters(letters);
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!currentWord) return;
    const answer = userAnswer.join("");

    if (answer === currentWord.original) {
      setFeedback("Correct! 🎉");
      setTimeout(() => {
        onComplete(true);
      }, 1000);
    } else {
      setFeedback("Try Again! ❌");
      setTimeout(() => {
        handleReset();
      }, 1000);
    }
  };

  if (!visible || !currentWord) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Word Scramble 🧩</Text>
          <Text style={styles.hint}>Hint: {currentWord.hint}</Text>

          {/* Answer Slots */}
          <View style={styles.slotsContainer}>
            {Array.from({ length: currentWord.original.length }).map((_, i) => (
              <View key={i} style={styles.slot}>
                <Text style={styles.slotText}>{userAnswer[i] || ""}</Text>
              </View>
            ))}
          </View>

          {/* Scrambled Letters Pool */}
          <View style={styles.lettersContainer}>
            {availableLetters.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.letterBtn}
                onPress={() => handleLetterPress(item)}
              >
                <Text style={styles.letterText}>{item.char}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlBtn} onPress={handleReset}>
              <Text style={styles.controlText}>Reset 🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlBtn,
                styles.submitBtn,
                userAnswer.length !== currentWord.original.length &&
                  styles.disabledBtn,
              ]}
              onPress={handleSubmit}
              disabled={userAnswer.length !== currentWord.original.length}
            >
              <Text style={[styles.controlText, styles.submitText]}>
                Submit ✅
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

          {feedback && <Text style={styles.feedback}>{feedback}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  hint: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 24,
    fontStyle: "italic",
  },
  slotsContainer: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 8,
  },
  slot: {
    width: 40,
    height: 50,
    borderBottomWidth: 3,
    borderBottomColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  slotText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  lettersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 30,
  },
  letterBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#3498db",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  letterText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  controls: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  controlBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: "#bdc3c7",
  },
  submitBtn: {
    backgroundColor: "#27ae60",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  controlText: {
    fontWeight: "bold",
    color: "#fff",
  },
  submitText: {
    fontSize: 18,
  },
  closeBtn: {
    padding: 10,
  },
  closeText: {
    color: "#95a5a6",
    textDecorationLine: "underline",
  },
  feedback: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: "#e67e22",
  },
});
