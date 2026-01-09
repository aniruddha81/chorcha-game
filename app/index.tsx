import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 16;
const CARD_PADDING = 24;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

type IconLibrary = "Ionicons" | "MaterialCommunityIcons";

interface GameConfig {
  title: string;
  tag: string;
  color: string;
  icon: string;
  iconLib: IconLibrary;
  route: string;
}

const games: GameConfig[] = [
  {
    title: "Click Play",
    tag: "Pattern",
    color: "#e0f2fe", // pastel light blue
    icon: "grid",
    iconLib: "Ionicons",
    route: "./games/memory-grid",
  },
  {
    title: "Match It",
    tag: "Speed run",
    color: "#dbeafe", // pastel blue (blue-100/200 mix)
    icon: "color-palette",
    iconLib: "Ionicons",
    route: "./games/color-match",
  },
  {
    title: "Find it",
    tag: "Recall",
    color: "#f3e8ff", // pastel purple
    icon: "brain",
    iconLib: "MaterialCommunityIcons",
    route: "./games/icon-memory",
  },
  {
    title: "Maze Escape",
    tag: "Reflex",
    color: "#dcfce7", // pastel green
    icon: "puzzle",
    iconLib: "MaterialCommunityIcons",
    route: "./games/maze-escape",
  },
  {
    title: "Word Polarity",
    tag: "Logic",
    color: "#fae8ff", // pastel fuchsia
    icon: "magnet",
    iconLib: "MaterialCommunityIcons",
    route: "./games/word-polarity",
  },
  {
    title: "Rocket play",
    tag: "Word play",
    color: "#ffedd5", // pastel orange
    icon: "rocket",
    iconLib: "Ionicons",
    route: "./games/rocket-synonyme",
  },
  {
    title: "Gaps",
    tag: "Grammar",
    color: "#ccfbf1", // pastel teal
    icon: "pencil",
    iconLib: "MaterialCommunityIcons",
    route: "./games/sentence-complete",
  },
  {
    title: "Balance it",
    tag: "Puzzle",
    color: "#fef9c3", // pastel yellow
    icon: "scale-balance",
    iconLib: "MaterialCommunityIcons",
    route: "./games/weight-balance",
  },
  {
    title: "Zip Puzzle",
    tag: "Path",
    color: "#fee2e2", // pastel red/pink
    icon: "link",
    iconLib: "Ionicons",
    route: "./games/zip-puzzle",
  },
  {
    title: "Vocau",
    tag: "Vocab",
    color: "#e0e7ff", // pastel indigo
    icon: "book-open-variant",
    iconLib: "MaterialCommunityIcons",
    route: "./games/vocabulary-match",
  },

];

interface GameCardProps {
  game: GameConfig;
  onPress: () => void;
  delay?: number;
}

const GameCard = ({ game, onPress, delay = 0 }: GameCardProps) => {
  const IconComponent =
    game.iconLib === "MaterialCommunityIcons" ? MaterialCommunityIcons : Ionicons;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(14)}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        style={[styles.card, { borderColor: game.color }]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={[styles.iconCircle, { backgroundColor: game.color }]}>
          <IconComponent name={game.icon as any} size={32} color="rgba(0,0,0,0.6)" />
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {game.title}
        </Text>

        <View style={[styles.tagContainer, { backgroundColor: game.color }]}>
          <Text style={styles.tagText}>{game.tag}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Index = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Mind Games</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {games.map((game, index) => (
            <GameCard
              key={game.route}
              game={game}
              onPress={() => router.push(game.route as any)}
              delay={100 + index * 50}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F6",
  },
  headerContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    letterSpacing: 0.5,
  },
  content: {
    padding: CARD_PADDING,
    paddingTop: 10,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 180,
    borderWidth: 2, // Slight border to match the colored outline in the design if any, or just solid.
    // Actually the design shows a very subtle border, but let's make it match the pastel color slightly or use white.
    // The previous code had `borderColor: game.color`.
    // Let's stick with that.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  tagContainer: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textTransform: "capitalize",
    opacity: 0.8,
  },
});

export default Index;
