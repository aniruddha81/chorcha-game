import { ZIP_COLORS } from "@/constants/zipGameConfig";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ZipCellProps {
  index: number;
  number?: number;
  isInPath: boolean;
  isCurrentCell: boolean;
  isNextTarget: boolean;
  cellSize: number;
}

export const ZipCell: React.FC<ZipCellProps> = ({
  index,
  number,
  isInPath,
  isCurrentCell,
  isNextTarget,
  cellSize,
}) => {
  const scale = useSharedValue(1);
  const fillProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Animate when cell becomes part of path
  useEffect(() => {
    if (isInPath) {
      fillProgress.value = withTiming(1, { duration: 100 });
      scale.value = withSequence(
        withTiming(1.03, { duration: 50 }),
        withTiming(1, { duration: 100 })
      );
    } else {
      fillProgress.value = withTiming(0, { duration: 100 });
      scale.value = 1;
    }
  }, [isInPath, fillProgress, scale]);

  // Pulse animation for next target
  useEffect(() => {
    if (isNextTarget) {
      const pulse = () => {
        pulseScale.value = withSequence(
          withTiming(1.08, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        );
      };
      pulse();
      const interval = setInterval(pulse, 1200);
      return () => clearInterval(interval);
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isNextTarget, pulseScale]);

  const animatedCellStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(
      fillProgress.value,
      [0, 1],
      [0, 1]
    );

    return {
      transform: [
        { scale: scale.value * pulseScale.value },
      ],
    };
  });

  const animatedFillStyle = useAnimatedStyle(() => ({
    opacity: fillProgress.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: isCurrentCell ? 0.8 : 0,
    transform: [{ scale: isCurrentCell ? 1.2 : 0.8 }],
  }));

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
        },
        animatedCellStyle,
      ]}
    >
      {/* Base cell */}
      <View
        style={[
          styles.cellInner,
          {
            backgroundColor: number
              ? ZIP_COLORS.cellNumbered
              : ZIP_COLORS.cellEmpty,
            borderRadius: cellSize * 0.18,
          },
          isNextTarget && styles.nextTargetBorder,
        ]}
      >
        {/* Fill overlay */}
        <Animated.View
          style={[
            styles.fillOverlay,
            {
              backgroundColor: ZIP_COLORS.path,
              borderRadius: cellSize * 0.14,
            },
            animatedFillStyle,
          ]}
        />

        {/* Glow effect for current cell */}
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: ZIP_COLORS.pathGlow,
              borderRadius: cellSize * 0.18,
            },
            animatedGlowStyle,
          ]}
        />

        {/* Number display - now rendered in separate layer in parent */}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cell: {
    padding: 3,
  },
  cellInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fillOverlay: {
    ...StyleSheet.absoluteFillObject,
    margin: 2,
    zIndex: 1,
  },
  glow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    zIndex: 0,
  },
  numberText: {
    fontWeight: "900",
    zIndex: 20,
    position: "relative",
  },
  nextTargetBorder: {
    borderWidth: 2,
    borderColor: ZIP_COLORS.accent,
  },
});
