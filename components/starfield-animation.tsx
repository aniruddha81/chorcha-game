import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const NUM_STARS = 100;

type StarProps = {
  speed: number; // 1 = normal, 2 = 2x faster, 0.5 = slower
};

const Star = ({ speed }: StarProps) => {
  const translateY = useSharedValue(-10);
  const opacity = useSharedValue(Math.random());

  const { randomX, baseDuration, delay } = useMemo(() => {
    return {
      randomX: Math.random() * width,
      baseDuration: 3000 + Math.random() * 5000, // original duration range
      delay: Math.random() * 5000,
    };
  }, []);

  useEffect(() => {
    const adjustedDuration = Math.max(200, baseDuration / speed); // prevent too-fast/zero

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 10, {
          duration: adjustedDuration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, [delay, baseDuration, speed, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: randomX }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.star, animatedStyle]} />;
};

export default function Background({ speed = 1 }: { speed?: number }) {
  return (
    <View style={styles.container} pointerEvents="none">
      {[...Array(NUM_STARS)].map((_, i) => (
        <Star key={i} speed={speed} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: "#FFF",
    borderRadius: 1,
  },
});
