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
  const GAP = 8;

  // Calculate cell size based on the larger dimension (rows or cols)
  // This ensures cells remain square and fit within the available space
  const maxDimension = Math.max(rows, cols);
  const cellSize = Math.floor((width - (maxDimension + 1) * GAP) / maxDimension);

  // Calculate actual grid dimensions based on square cells
  const gridWidth = cols * cellSize + (cols + 1) * GAP;
  const gridHeight = rows * cellSize + (rows + 1) * GAP;

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
        />,
      );
    }
    return cells;
  };

  return (
    <View
      style={[
        styles.grid,
        {
          width: gridWidth,
          height: gridHeight,
          flexWrap: "wrap",
          flexDirection: "row",
          gap: GAP,
          padding: GAP / 2,
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
