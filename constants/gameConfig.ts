export interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  activeCells: number;
  showDuration: number; // ms
  gridSize: number; // percentage of screen width or fixed size
}

// Maximum grid size - cells will scale to fit within this
export const MAX_GRID_SIZE = 320;

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    rows: 3,
    cols: 3,
    activeCells: 3,
    showDuration: 4000,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 2,
    rows: 3,
    cols: 3,
    activeCells: 4,
    showDuration: 1500,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 3,
    rows: 4,
    cols: 3,
    activeCells: 4,
    showDuration: 1800,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 4,
    rows: 4,
    cols: 4,
    activeCells: 5,
    showDuration: 2000,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 5,
    rows: 4,
    cols: 4,
    activeCells: 6,
    showDuration: 2000,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 6,
    rows: 5,
    cols: 4,
    activeCells: 6,
    showDuration: 2200,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 7,
    rows: 5,
    cols: 5,
    activeCells: 7,
    showDuration: 2500,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 8,
    rows: 5,
    cols: 5,
    activeCells: 8,
    showDuration: 2500,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 9,
    rows: 6,
    cols: 5,
    activeCells: 9,
    showDuration: 2800,
    gridSize: MAX_GRID_SIZE,
  },
  {
    level: 10,
    rows: 6,
    cols: 6,
    activeCells: 10,
    showDuration: 3000,
    gridSize: MAX_GRID_SIZE,
  },
];

export const COLORS = {
  background: "#f0f0f0",
  card: "#7b7b87", // zinc-900
  primary: "#22d3ee", // cyan-400
  success: "#4ade80", // green-400
  error: "#f87171", // red-400
  inactive: "#D9D9D9", // zinc-800
};
