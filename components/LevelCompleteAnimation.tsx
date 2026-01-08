import { ZIP_COLORS } from "@/constants/zipGameConfig";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface LevelCompleteAnimationProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const LevelCompleteAnimation: React.FC<LevelCompleteAnimationProps> = ({
  isVisible,
  onAnimationComplete,
}) => {
  const containerOpacity = useSharedValue(0);
  const heroScale = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Container fade in (Subtle overlay)
      containerOpacity.value = withTiming(1, { duration: 300 });

      // Hero (Checkmark/Circle) animation - simple pop in
      heroScale.value = withDelay(
        200,
        withSpring(1, { damping: 15, stiffness: 150 })
      );

      // Call completion after animation
      if (onAnimationComplete) {
        setTimeout(() => {
          runOnJS(onAnimationComplete)();
        }, 1800);
      }
    } else {
      containerOpacity.value = 0;
      heroScale.value = 0;
    }
  }, [isVisible, containerOpacity, heroScale, onAnimationComplete]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[styles.container, containerAnimatedStyle]}
      pointerEvents="none"
    >
      {/* Central Hero Element */}
      <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
        <View style={styles.heroCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.levelCompleteText}>LEVEL COMPLETE</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    // Very subtle background or none? "Tone down drastically".
    // Let's keep a very faint wash so text is readable if over grid.
    backgroundColor: "rgba(255,255,255,0.6)", 
  },
  heroContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroCircle: {
    width: 80, // Smaller
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 6,
    borderColor: ZIP_COLORS.accent,
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 40,
    color: ZIP_COLORS.accent,
    fontWeight: "900",
  },
  textWrapper: {
    marginTop: 8,
  },
  levelCompleteText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 1,
    textAlign: "center",
  },
});
