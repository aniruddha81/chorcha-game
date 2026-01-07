import { GameCard } from "@/components/GameCard";
import { COLORS } from "@/constants/gameConfig";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Index = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Text style={styles.superTitle}>DAILY TRAINING</Text>
          <Text style={styles.title}>
            Play <Text style={styles.highlight}>Lab</Text>
          </Text>
          <Text style={styles.subtitle}>Crafted for Curious Minds</Text>
        </Animated.View>

        <View style={styles.grid}>
          <GameCard
            title="Memory Grid"
            description="Train your spatial memory and recall patterns."
            icon="grid"
            color={COLORS.primary}
            onPress={() => router.push("./games/memory-grid")}
            delay={400}
          />

          <GameCard
            title="Color Match"
            description="Exercise flexibility and ignore distractions."
            icon="color-palette"
            color={COLORS.success}
            onPress={() => router.push("./games/color-match")}
            delay={600}
          />

          <GameCard
            title="Vocabulary Match"
            description="Listen and match words with similar sounds."
            icon="volume-high"
            color="#a855f7"
            onPress={() => router.push("./games/vocabulary-match")}
            delay={800}
          />

          <GameCard
            title="Icon Memory"
            description="Never click the same icon twice. Test your recall!"
            icon="shapes"
            color="#f59e0b"
            onPress={() => router.push("./games/icon-memory")}
            delay={1000}
          />

          <GameCard
            title="Weight Balance"
            description="Balance the scale using fractional weight blocks."
            icon="scale"
            color="#60a5fa"
            onPress={() => router.push("./games/weight-balance")}
            delay={1200}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  superTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: 18,
    marginTop: 8,
  },
  grid: {
    gap: 0,
  },
});

export default Index;
