import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ConfettiPieceProps {
   index: number;
   color: string;
   delay: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index, color, delay }) => {
   const translateY = useSharedValue(-20);
   const translateX = useSharedValue(0);
   const opacity = useSharedValue(0);
   const rotate = useSharedValue(0);
   const scale = useSharedValue(0.5);

   // Random starting position and movement
   const startX = useMemo(() => Math.random() * SCREEN_WIDTH, []);
   const endX = useMemo(() => (Math.random() - 0.5) * 100, []);
   const size = useMemo(() => 6 + Math.random() * 4, []);

   useEffect(() => {
      const duration = 1500 + Math.random() * 500;
      
      opacity.value = withDelay(
         delay,
         withSequence(
            withTiming(0.8, { duration: 150 }),
            withTiming(0.8, { duration: duration * 0.6 }),
            withTiming(0, { duration: duration * 0.4 })
         )
      );
      
      translateY.value = withDelay(
         delay,
         withTiming(SCREEN_HEIGHT * 0.6, {
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
         })
      );
      
      translateX.value = withDelay(
         delay,
         withTiming(endX, {
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
         })
      );
      
      rotate.value = withDelay(
         delay,
         withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * 2, {
            duration,
            easing: Easing.linear,
         })
      );
      
      scale.value = withDelay(
         delay,
         withSequence(
            withTiming(1, { duration: 200 }),
            withTiming(0.6, { duration: duration - 200 })
         )
      );
   }, []);

   const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
         { translateX: translateX.value },
         { translateY: translateY.value },
         { rotate: `${rotate.value}deg` },
         { scale: scale.value },
      ],
   }));

   return (
      <Animated.View
         style={[
            styles.piece,
            {
               left: startX,
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

interface SubtleConfettiProps {
   isVisible: boolean;
}

// Subtle color palette - pastels and muted tones
const CONFETTI_COLORS = [
   "#A8E6CF", // mint
   "#FFD3B6", // peach
   "#DCEDC1", // light green
   "#C9B1FF", // lavender
   "#FFB7B2", // blush
   "#B5EAD7", // seafoam
];

export const SubtleConfetti: React.FC<SubtleConfettiProps> = ({ isVisible }) => {
   const pieces = useMemo(() => {
      if (!isVisible) return [];
      
      // Only 12 pieces for subtle effect
      return Array.from({ length: 12 }, (_, i) => ({
         id: i,
         color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
         delay: Math.random() * 200,
      }));
   }, [isVisible]);

   if (!isVisible) return null;

   return (
      <View style={styles.container} pointerEvents="none">
         {pieces.map((piece) => (
            <ConfettiPiece
               key={piece.id}
               index={piece.id}
               color={piece.color}
               delay={piece.delay}
            />
         ))}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1000,
   },
   piece: {
      position: "absolute",
      top: 0,
   },
});
