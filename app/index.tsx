import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
import { GridMap } from "../components/GridMap";
import { MinigameCenter } from "../components/MinigameCenter";
import { QuizOverlay } from "../components/QuizOverlay";
import { WordScramble } from "../components/WordScramble";
import { Question, QUESTIONS } from "./questions";

// Game Constants
export const GRID_SIZE = 10;
export const TILE_SIZE = 60;

// Building Types for MVP
export type BuildingType = "house" | "tree" | "road" | "grass";

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  level: number;
}

export interface ShopItem {
  type: BuildingType;
  cost: number;
  label: string;
  icon: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { type: "road", cost: 10, label: "Road", icon: "🛣️" },
  { type: "tree", cost: 20, label: "Tree", icon: "🌲" },
  { type: "house", cost: 50, label: "House", icon: "🏠" },
];

export default function VillageBuilder() {
  // Game State
  const [points, setPoints] = useState(100);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(
    null
  );

  // UI State
  const [isMinigameCenterOpen, setIsMinigameCenterOpen] = useState(false);

  // Quiz State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Word Scramble State
  const [isScrambleOpen, setIsScrambleOpen] = useState(false);

  // Persistence
  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    saveGame();
  }, [points, buildings]);

  const saveGame = async () => {
    try {
      const state = { points, buildings };
      await AsyncStorage.setItem("village_save_v1", JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save game", e);
    }
  };

  const loadGame = async () => {
    try {
      const saved = await AsyncStorage.getItem("village_save_v1");
      if (saved) {
        const { points: p, buildings: b } = JSON.parse(saved);
        setPoints(p);
        setBuildings(b);
      }
    } catch (e) {
      console.error("Failed to load game", e);
    }
  };

  // Handle building placement or interaction
  const handleTilePress = (x: number, y: number) => {
    // Check if clicked on an existing building
    const existingBuilding = buildings.find((b) => b.x === x && b.y === y);

    if (existingBuilding) {
      // Handle Upgrade Logic
      if (existingBuilding.type === "house" && selectedBuilding === null) {
        Alert.alert(
          "Upgrade Building?",
          `Current: Lvl ${existingBuilding.level}. Upgrade for 100 Points?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Upgrade (100 Pts)",
              onPress: () => upgradeBuilding(existingBuilding),
            },
          ]
        );
      }
      return;
    }

    if (!selectedBuilding) return;

    // Check cost
    const item = SHOP_ITEMS.find((i) => i.type === selectedBuilding);
    if (!item) return;

    if (points >= item.cost) {
      // Place building
      const newBuilding: Building = {
        id: Math.random().toString(),
        type: selectedBuilding,
        x,
        y,
        level: 1,
      };

      setBuildings([...buildings, newBuilding]);
      setPoints(points - item.cost);
    } else {
      Alert.alert(
        "Not enough points!",
        "Visit the Training Camp to earn more."
      );
    }
  };

  const upgradeBuilding = (building: Building) => {
    if (points >= 100) {
      const updatedBuildings = buildings.map((b) => {
        if (b.id === building.id) {
          return { ...b, level: b.level + 1 };
        }
        return b;
      });
      setBuildings(updatedBuildings);
      setPoints(points - 100);
      Alert.alert("Upgrade Successful!", "Your building is now stronger.");
    } else {
      Alert.alert("Not enough points!", "You need 100 points to upgrade.");
    }
  };

  // Minigame Logic
  const openTrainingCamp = () => {
    setIsMinigameCenterOpen(true);
  };

  const handleSelectGame = (game: "quiz" | "scramble") => {
    setIsMinigameCenterOpen(false);
    if (game === "quiz") startQuiz();
    if (game === "scramble") startScramble();
  };

  const startQuiz = () => {
    const vocabQuestions = QUESTIONS.filter(
      (q) => q.type === "vocab" || q.type === "english"
    );
    const randomQ =
      vocabQuestions[Math.floor(Math.random() * vocabQuestions.length)];
    setCurrentQuestion(randomQ);
    setIsQuizOpen(true);
  };

  const startScramble = () => {
    setIsScrambleOpen(true);
  };

  const handleQuizAnswer = (correct: boolean) => {
    if (correct) {
      setPoints(points + 20);
    }
    setIsQuizOpen(false);
  };

  const handleScrambleComplete = (success: boolean) => {
    if (success) {
      setPoints(points + 30); // Higher reward for scramble
    }
    setIsScrambleOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* Header / HUD */}
      <View style={styles.header}>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Points:</Text>
          <Text style={styles.pointsValue}>{points}</Text>
        </View>
        <TouchableOpacity style={styles.earnButton} onPress={openTrainingCamp}>
          <Text style={styles.earnButtonText}>Training Camp ⚔️</Text>
        </TouchableOpacity>
      </View>

      {/* Main Game Grid */}
      <GridMap
        gridSize={GRID_SIZE}
        tileSize={TILE_SIZE}
        buildings={buildings}
        onTilePress={handleTilePress}
        selectedMode={selectedBuilding !== null}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shopScroll}
        >
          <TouchableOpacity
            style={[
              styles.shopItem,
              selectedBuilding === null && styles.selectedShopItem,
            ]}
            onPress={() => setSelectedBuilding(null)}
          >
            <Text style={styles.shopIcon}>✋</Text>
            <Text style={styles.shopLabel}>Move</Text>
          </TouchableOpacity>

          {SHOP_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.shopItem,
                selectedBuilding === item.type && styles.selectedShopItem,
              ]}
              onPress={() => setSelectedBuilding(item.type)}
            >
              <Text style={styles.shopIcon}>{item.icon}</Text>
              <Text style={styles.shopLabel}>{item.label}</Text>
              <Text style={styles.shopCost}>💰 {item.cost}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Modals */}
      <MinigameCenter
        visible={isMinigameCenterOpen}
        onSelectGame={handleSelectGame}
        onClose={() => setIsMinigameCenterOpen(false)}
      />

      <QuizOverlay
        visible={isQuizOpen}
        question={currentQuestion}
        onAnswer={handleQuizAnswer}
        onClose={() => setIsQuizOpen(false)}
      />

      <WordScramble
        visible={isScrambleOpen}
        onComplete={handleScrambleComplete}
        onClose={() => setIsScrambleOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#34495e",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 8,
  },
  pointsLabel: {
    color: "#bdc3c7",
    fontSize: 14,
    marginRight: 4,
  },
  pointsValue: {
    color: "#f1c40f",
    fontSize: 18,
    fontWeight: "bold",
  },
  earnButton: {
    backgroundColor: "#e67e22",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#d35400",
  },
  earnButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#34495e",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#455a64",
  },
  shopScroll: {
    paddingHorizontal: 10,
    gap: 10,
  },
  shopItem: {
    width: 80,
    height: 90,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedShopItem: {
    borderColor: "#3498db",
    backgroundColor: "#e3f2fd",
  },
  shopIcon: {
    fontSize: 30,
    marginBottom: 4,
  },
  shopLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  shopCost: {
    fontSize: 10,
    color: "#7f8c8d",
  },
});
