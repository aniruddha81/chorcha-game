import { COLORS } from "@/constants/gameConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface GameCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  delay?: number;
}

export const GameCard = ({
  title,
  description,
  icon,
  color,
  onPress,
  delay = 0,
}: GameCardProps) => {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <TouchableOpacity
        style={[styles.card, { borderColor: color }]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient colors={[COLORS.card, "#000"]} style={styles.gradient}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={32} color="#000" />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={24} color={color} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 120,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    color: "#a1a1aa",
    fontSize: 14,
  },
  arrow: {
    paddingLeft: 10,
  },
});
