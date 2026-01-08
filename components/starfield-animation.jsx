import React, { useEffect } from "react";
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

const Star = () => {
  const translateY = useSharedValue(-10); // Start off-screen
  const opacity = useSharedValue(Math.random());

  // Random horizontal position and speed
  const randomX = Math.random() * width;
  const duration = 3000 + Math.random() * 5000;
  const delay = Math.random() * 5000;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 10, { duration, easing: Easing.linear }),
        -1, // Infinite loop
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: randomX }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.star, animatedStyle]} />;
};

export default function Background() {
  return (
    <View style={styles.container} pointerEvents="none">
      {[...Array(NUM_STARS)].map((_, i) => (
        <Star key={i} />
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
