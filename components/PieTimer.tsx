import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

interface PieTimerProps {
  remaining: number;
  total: number;
  size?: number;
}

export const PieTimer = ({ remaining, total, size = 40 }: PieTimerProps) => {
  const radius = size / 2;
  // Percentage of time LEFT
  const percentage = Math.max(0, Math.min(1, remaining / total));

  // Calculate the angle in radians
  // 360 degrees = 2 * Math.PI
  const angle = 2 * Math.PI * percentage;

  // Calculate the end point of the green arc
  // We want it to start at 12 o'clock and go clockwise
  // x = r + r * sin(theta)
  // y = r - r * cos(theta)
  const x = radius + radius * Math.sin(angle);
  const y = radius - radius * Math.cos(angle);

  // The largeArcFlag determines if the arc is greater than 180 degrees
  const largeArcFlag = percentage > 0.5 ? 1 : 0;

  // Path explanation:
  // M: Move to center
  // L: Line to the top center (12 o'clock)
  // A: Arc to the calculated (x, y) point
  // Z: Close back to center
  const d = `
    M ${radius} ${radius}
    L ${radius} 0
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y}
    Z
  `;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle (The white "empty" area) */}
        <Circle cx={radius} cy={radius} r={radius} fill="#FFFFFF" />

        {/* The Green Slice (The remaining time) */}
        {percentage >= 1 ? (
          <Circle cx={radius} cy={radius} r={radius} fill="#50C878" />
        ) : (
          percentage > 0 && <Path d={d} fill="#50C878" />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Subtle shadow to match the screenshot style
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderRadius: 20,
    backgroundColor: "white",
  },
});
