import { ZIP_COLORS } from "@/constants/zipGameConfig";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface LevelCompleteAnimationProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const PARTICLE_COUNT = 24;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ParticleProps {
  index: number;
  isVisible: boolean;
}

const Particle: React.FC<ParticleProps> = ({ index, isVisible }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const distance = 150 + Math.random() * 100;
  const size = 8 + Math.random() * 16;
  const delay = Math.random() * 200;

  const colors = [
    ZIP_COLORS.accent,
    ZIP_COLORS.pathGlow,
    ZIP_COLORS.success,
    "#ef4444",
    "#8b5cf6",
    "#3b82f6",
  ];
  const color = colors[index % colors.length];

  useEffect(() => {
    if (isVisible) {
      // Launch animation
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.2, { damping: 8, stiffness: 200 }),
          withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
        )
      );
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(600, withTiming(0, { duration: 400 }))
        )
      );
      translateX.value = withDelay(
        delay,
        withTiming(Math.cos(angle) * distance, {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        })
      );
      translateY.value = withDelay(
        delay,
        withTiming(Math.sin(angle) * distance - 50, {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        })
      );
      rotation.value = withDelay(
        delay,
        withTiming(Math.random() * 720 - 360, { duration: 1000 })
      );
    } else {
      scale.value = 0;
      opacity.value = 0;
      translateX.value = 0;
      translateY.value = 0;
      rotation.value = 0;
    }
  }, [isVisible, angle, delay, distance, opacity, rotation, scale, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const LevelCompleteAnimation: React.FC<LevelCompleteAnimationProps> = ({
  isVisible,
  onAnimationComplete,
}) => {
  const containerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const starScale = useSharedValue(0);
  const starRotation = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Container fade in
      containerOpacity.value = withTiming(1, { duration: 200 });

      // Star animation
      starScale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 150 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      starRotation.value = withSequence(
        withTiming(20, { duration: 150 }),
        withSpring(0, { damping: 8 })
      );

      // Ring explosion
      ringScale.value = withTiming(3, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
      ringOpacity.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(0, { duration: 500 })
      );

      // Call completion after animation
      if (onAnimationComplete) {
        setTimeout(() => {
          runOnJS(onAnimationComplete)();
        }, 1500);
      }
    } else {
      containerOpacity.value = 0;
      containerScale.value = 0;
      starScale.value = 0;
      starRotation.value = 0;
      ringScale.value = 0;
      ringOpacity.value = 0;
    }
  }, [isVisible, containerOpacity, containerScale, onAnimationComplete, ringOpacity, ringScale, starRotation, starScale]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: starScale.value },
      { rotate: `${starRotation.value}deg` },
    ],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  if (!isVisible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Expanding ring */}
      <Animated.View style={[styles.ring, ringAnimatedStyle]} />

      {/* Particles */}
      <View style={styles.particlesContainer}>
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <Particle key={i} index={i} isVisible={isVisible} />
        ))}
      </View>

      {/* Central star/checkmark */}
      <Animated.View style={[styles.starContainer, starAnimatedStyle]}>
        <View style={styles.star}>
          <Animated.Text style={styles.checkmark}>✓</Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  ring: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: ZIP_COLORS.accent,
  },
  particlesContainer: {
    position: "absolute",
    width: 1,
    height: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
  },
  starContainer: {
    position: "absolute",
  },
  star: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ZIP_COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ZIP_COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmark: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
});
