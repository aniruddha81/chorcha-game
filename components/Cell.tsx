import { COLORS } from "@/constants/gameConfig";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface CellProps {
  id: number;
  isBlinking: boolean;
  isSelected: boolean;
  isCorrect: boolean | null; // null = not validated yet
  onPress: (id: number) => void;
  disabled: boolean;
  size: number;
}

export const Cell = ({
  id,
  isBlinking,
  isSelected,
  isCorrect,
  onPress,
  disabled,
  size,
}: CellProps) => {
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0); // 0=inactive, 1=active/blink, 2=selected, 3=success, 4=error
  const pressedProgress = useSharedValue(0); // 0=not pressed, 1=pressed

  // Unified Effect for Visual State
  useEffect(() => {
    // Priority: Validation > Selection > Blinking > Idle
    if (isCorrect === true) {
      colorProgress.value = withTiming(3);
      pressedProgress.value = withTiming(1, { duration: 100 });
      scale.value = withSequence(
        withTiming(1.02, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    } else if (isCorrect === false) {
      colorProgress.value = withTiming(4);
      pressedProgress.value = withTiming(1, { duration: 100 });
      scale.value = withSequence(
        withTiming(0.95, { duration: 50 }),
        withTiming(1.02, { duration: 50 }),
        withTiming(1, { duration: 50 })
      );
    } else if (isSelected) {
      colorProgress.value = withSpring(2);
      scale.value = withSpring(0.95);
    } else if (isBlinking) {
      colorProgress.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    } else {
      // Reset to idle
      colorProgress.value = withTiming(0, { duration: 300 });
      pressedProgress.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(1);
    }
  }, [isBlinking, isSelected, isCorrect]);

  // Shadow Color Interpolation
  const rShadowStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3, 4],
      ["#a3a3a3", "#16a34a", "#16a34a", "#15803d", "#b91c1c"] // Darker shades for shadow (green accent)
    );
    const opacity = interpolate(pressedProgress.value, [0, 1], [1, 0]);
    return { backgroundColor, opacity };
  });

  const rFaceStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3, 4],
      [COLORS.inactive, "#16a34a", "#16a34a", "#16a34a", COLORS.error]
    );
    // Move face down when pressed (shadow hidden)
    const top = interpolate(pressedProgress.value, [0, 1], [0, 6]);
    return { backgroundColor, top };
  });

  const rContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled} style={{ margin: 4 }}>
      <Animated.View
        style={[
          styles.container,
          { width: size, height: size },
          rContainerStyle,
        ]}
      >
        <Animated.View style={[styles.buttonShadow, rShadowStyle]} />
        <Animated.View style={[styles.buttonFace, rFaceStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  buttonShadow: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "90%",
    borderRadius: 8,
  },
  buttonFace: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "92%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)", // Subtle highlight
    alignItems: "center",
    justifyContent: "center",
  },
});
