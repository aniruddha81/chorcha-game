import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MinigameCenterProps {
  visible: boolean;
  onSelectGame: (game: "quiz" | "scramble") => void;
  onClose: () => void;
}

export const MinigameCenter: React.FC<MinigameCenterProps> = ({
  visible,
  onSelectGame,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Training Camp ⚔️</Text>
          <Text style={styles.subtitle}>
            Choose your training to earn points!
          </Text>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => onSelectGame("quiz")}
          >
            <Text style={styles.gameIcon}>📚</Text>
            <View>
              <Text style={styles.gameTitle}>Trivia Tower</Text>
              <Text style={styles.gameDesc}>
                Test your knowledge with quizzes.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameCard, styles.scrambleCard]}
            onPress={() => onSelectGame("scramble")}
          >
            <Text style={styles.gameIcon}>🧩</Text>
            <View>
              <Text style={styles.gameTitle}>Word Scramble</Text>
              <Text style={styles.gameDesc}>
                Unscramble words to prove your vocab.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 32,
    textAlign: "center",
  },
  gameCard: {
    width: "100%",
    backgroundColor: "#e3f2fd",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#bbdefb",
  },
  scrambleCard: {
    backgroundColor: "#f3e5f5",
    borderColor: "#e1bee7",
  },
  gameIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 12,
    color: "#666",
  },
  closeBtn: {
    marginTop: 16,
    padding: 12,
  },
  closeText: {
    color: "#95a5a6",
    fontWeight: "bold",
    fontSize: 16,
  },
});
