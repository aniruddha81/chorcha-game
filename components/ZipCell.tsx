import { ZIP_COLORS } from "@/constants/zipGameConfig";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

interface ZipCellProps {
  index: number;
  number?: number;
  cols: number; // Added to determine borders
  rows: number; // Added to determine borders
  cellSize: number;
  isNextTarget?: boolean;
}

export const ZipCell: React.FC<ZipCellProps> = ({
  index,
  cols,
  rows,
  cellSize,
  isNextTarget
}) => {
  const row = Math.floor(index / cols);
  const col = index % cols;

  // Only right border if not last column
  // Only bottom border if not last row
  // Actually, to get a full grid, we can just put borders on all cells and handle overlap, 
  // or use the standard "border right and bottom" strategy.

  // Let's use: every cell has borderRight and borderBottom.
  // The Grid container will have borderTop and borderLeft border.
  // Wait, if we put borderRight on all cells, the last column will have a border on the right edge of the card.
  // The card has a rounded border.
  // If we want the lines to *stop* at the edge, we should NOT have border on the outer edges.

  const hasRightBorder = col < cols - 1;
  const hasBottomBorder = row < rows - 1;

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isNextTarget) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isNextTarget, pulse]);

  return (
    <View
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          borderRightWidth: hasRightBorder ? 1 : 0,
          borderBottomWidth: hasBottomBorder ? 1 : 0,
          borderColor: ZIP_COLORS.gridLine,
        },
      ]}
    >
      {/* We can put a subtle highlight if it's the next target, maybe just on the number itself which is in the parent */}
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    // Transparent background
    backgroundColor: 'transparent',
  },
});

