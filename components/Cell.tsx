import { COLORS } from "@/constants/gameConfig";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
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

  useEffect(() => {
    if (isBlinking) {
      colorProgress.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    } else {
      colorProgress.value = withTiming(0, { duration: 300 });
    }
  }, [isBlinking]);

  useEffect(() => {
    if (isSelected) {
      colorProgress.value = withSpring(2);
      scale.value = withSpring(0.95);
    } else if (!isBlinking) {
      // Reset if not selected and not blinking
      colorProgress.value = withTiming(0);
      scale.value = withSpring(1);
    }
  }, [isSelected, isBlinking]);

  // Validation Effect
  useEffect(() => {
    if (isCorrect === true) {
      colorProgress.value = withTiming(3);
      scale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    } else if (isCorrect === false) {
      colorProgress.value = withTiming(4);
      scale.value = withSequence(
        withTiming(0.9, { duration: 50 }),
        withTiming(1.1, { duration: 50 }),
        withTiming(1, { duration: 50 })
      );
    }
  }, [isCorrect]);

  const rStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3, 4],
      [COLORS.inactive, COLORS.primary, "#38bdf8", COLORS.success, COLORS.error]
    );

    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[styles.cell, { width: size, height: size }, rStyle]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderRadius: 8,
    margin: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
