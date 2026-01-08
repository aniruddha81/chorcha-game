import React from "react";
import { StyleSheet, View } from "react-native";
import { Cell } from "./Cell";

type validateCell = {
  id: number;
  correct: boolean;
};

interface GridProps {
  rows: number;
  cols: number;
  activeCells: number[]; // Array of IDs that should blink
  selectedCells: number[]; // Array of IDs selected by user
  validatedCells: validateCell[]; // For showing results
  onCellPress: (id: number) => void;
  isInteractionEnabled: boolean;
  isShowingPattern: boolean;
  width: number;
}

export const Grid = ({
  rows,
  cols,
  activeCells,
  selectedCells,
  validatedCells,
  onCellPress,
  isInteractionEnabled,
  isShowingPattern,
  width,
}: GridProps) => {
  const totalCells = rows * cols;

  // Calculate cell size based on width and gap
  // margin is 4px * 2 = 8px per cell
  const GAP = 8;
  const cellSize = (width - cols * GAP) / cols;

  // Calculate height to maintain square cells
  const gridHeight = rows * cellSize + rows * GAP;

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const isBlinking = isShowingPattern && activeCells.includes(i);
      const isSelected = selectedCells.includes(i);

      // Check if this cell has been validated (during result phase)
      const validation = validatedCells.find((v) => v.id === i);
      const isCorrect = validation ? validation.correct : null;

      cells.push(
        <Cell
          key={i}
          id={i}
          size={cellSize}
          isBlinking={isBlinking}
          isSelected={isSelected}
          isCorrect={isCorrect}
          onPress={onCellPress}
          disabled={!isInteractionEnabled}
        />
      );
    }
    return cells;
  };

  return (
    <View
      style={[
        styles.grid,
        {
          width: width,
          height: gridHeight,
          flexWrap: "wrap",
          flexDirection: "row",
        },
      ]}
    >
      {renderCells()}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    justifyContent: "center",
    alignContent: "center",
  },
});
