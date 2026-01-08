export interface ZipLevelConfig {
  level: number;
  rows: number;
  cols: number;
  // Map of cell index to number (1-indexed sequence)
  numberedCells: Map<number, number>;
}

// Helper to create a level from a simple grid representation
function createLevel(
  level: number,
  rows: number,
  cols: number,
  numberPositions: { row: number; col: number; num: number }[]
): ZipLevelConfig {
  const numberedCells = new Map<number, number>();
  numberPositions.forEach(({ row, col, num }) => {
    const index = row * cols + col;
    numberedCells.set(index, num);
  });
  return { level, rows, cols, numberedCells };
}

// Puzzle levels - each one is hand-crafted to be solvable
export const ZIP_LEVELS: ZipLevelConfig[] = [
  // Level 1: 5x5 with 3 numbers - easy intro
  createLevel(1, 5, 5, [
    { row: 0, col: 0, num: 1 },
    { row: 2, col: 2, num: 2 },
    { row: 4, col: 4, num: 3 },
  ]),

  // Level 2: 5x5 with 4 numbers
  createLevel(2, 5, 5, [
    { row: 0, col: 0, num: 1 },
    { row: 0, col: 4, num: 2 },
    { row: 4, col: 0, num: 3 },
    { row: 4, col: 4, num: 4 },
  ]),

  // Level 3: 5x5 with 4 numbers - diagonal pattern
  createLevel(3, 5, 5, [
    { row: 0, col: 0, num: 1 },
    { row: 1, col: 3, num: 2 },
    { row: 3, col: 1, num: 3 },
    { row: 4, col: 4, num: 4 },
  ]),

  // Level 4: 5x5 with 5 numbers - more waypoints
  createLevel(4, 5, 5, [
    { row: 0, col: 0, num: 1 },
    { row: 0, col: 4, num: 2 },
    { row: 2, col: 2, num: 3 },
    { row: 4, col: 0, num: 4 },
    { row: 4, col: 4, num: 5 },
  ]),

  // Level 5: 5x5 with 5 numbers - asymmetric
  createLevel(5, 5, 5, [
    { row: 0, col: 0, num: 1 },
    { row: 1, col: 3, num: 2 },
    { row: 2, col: 1, num: 3 },
    { row: 3, col: 4, num: 4 },
    { row: 4, col: 2, num: 5 },
  ]),

  // Level 6: 5x5 with 6 numbers - challenging
  createLevel(6, 5, 5, [
    { row: 0, col: 0, num: 1 },
    { row: 0, col: 4, num: 2 },
    { row: 2, col: 2, num: 3 },
    { row: 3, col: 1, num: 4 },
    { row: 4, col: 3, num: 5 },
    { row: 4, col: 4, num: 6 },
  ]),

  // Level 7: 5x5 with 5 numbers
  createLevel(7, 5, 5, [
    { row: 0, col: 0, num: 1 },
    { row: 0, col: 4, num: 2 },
    { row: 2, col: 2, num: 3 },
    { row: 4, col: 0, num: 4 },
    { row: 4, col: 4, num: 5 },
  ]),

  // Level 8: 5x5 with 6 numbers - harder
  createLevel(8, 5, 5, [
    { row: 0, col: 0, num: 1 },
    { row: 0, col: 2, num: 2 },
    { row: 1, col: 4, num: 3 },
    { row: 3, col: 3, num: 4 },
    { row: 4, col: 1, num: 5 },
    { row: 4, col: 4, num: 6 },
  ]),

  // Level 9: 6x5 with 5 numbers
  createLevel(9, 5, 6, [
    { row: 0, col: 0, num: 1 },
    { row: 0, col: 5, num: 2 },
    { row: 2, col: 3, num: 3 },
    { row: 4, col: 0, num: 4 },
    { row: 4, col: 5, num: 5 },
  ]),

  // Level 10: 6x6 with 6 numbers - final challenge
  createLevel(10, 6, 6, [
    { row: 0, col: 0, num: 1 },
    { row: 0, col: 5, num: 2 },
    { row: 2, col: 3, num: 3 },
    { row: 3, col: 1, num: 4 },
    { row: 5, col: 2, num: 5 },
    { row: 5, col: 5, num: 6 },
  ]),
];

export const ZIP_COLORS = {
  background: "#F2F2F2",
  card: "#FFFFFF",
  cellEmpty: "transparent",
  cellFilled: "transparent",
  cellNumbered: "transparent",
  path: "#00B87C", // Green
  pathGlow: "#00E096",
  numberText: "#FFFFFF",
  success: "#10b981",
  error: "#ef4444",
  accent: "#00B87C", // Green
  gridLine: "#000000",
  text: "#000000",
};
