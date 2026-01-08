import { ZIP_COLORS } from "@/constants/zipGameConfig";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface AnimatedNumberBadgeProps {
  num: number;
  isSelected: boolean;
  cellSize: number;
  centerX: number;
  centerY: number;
}

export const AnimatedNumberBadge: React.FC<AnimatedNumberBadgeProps> = ({
  num,
  isSelected,
  cellSize,
  centerX,
  centerY,
}) => {
  const progress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, { duration: 150 });
  }, [isSelected, progress]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [ZIP_COLORS.accent, "#FFFFFF"]
    );

    return {
      backgroundColor,
      borderWidth: progress.value * cellSize * 0.08,
      transform: [{ scale: 1 + progress.value * 0.05 }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      ["#FFFFFF", "#000000"]
    );

    return { color };
  });

  return (
    <Animated.View
      style={[
        styles.numberBadge,
        {
          left: centerX - cellSize * 0.35,
          top: centerY - cellSize * 0.35,
          width: cellSize * 0.7,
          height: cellSize * 0.7,
          borderRadius: cellSize * 0.35,
          borderColor: ZIP_COLORS.accent,
        },
        animatedContainerStyle,
      ]}
    >
      <Animated.Text
        style={[
          styles.numberBadgeText,
          { fontSize: cellSize * 0.35 },
          animatedTextStyle,
        ]}
      >
        {num}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  numberBadge: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  numberBadgeText: {
    fontWeight: "700",
  },
});
