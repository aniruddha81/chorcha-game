export interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  activeCells: number;
  showDuration: number; // ms
  gridSize: number; // percentage of screen width or fixed size
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    rows: 3,
    cols: 3,
    activeCells: 3,
    showDuration: 1500,
    gridSize: 300,
  },
  {
    level: 2,
    rows: 3,
    cols: 3,
    activeCells: 4,
    showDuration: 1500,
    gridSize: 300,
  },
  {
    level: 3,
    rows: 4,
    cols: 3,
    activeCells: 4,
    showDuration: 1800,
    gridSize: 320,
  },
  {
    level: 4,
    rows: 4,
    cols: 4,
    activeCells: 5,
    showDuration: 2000,
    gridSize: 320,
  },
  {
    level: 5,
    rows: 4,
    cols: 4,
    activeCells: 6,
    showDuration: 2000,
    gridSize: 340,
  },
  {
    level: 6,
    rows: 5,
    cols: 4,
    activeCells: 6,
    showDuration: 2200,
    gridSize: 340,
  },
  {
    level: 7,
    rows: 5,
    cols: 5,
    activeCells: 7,
    showDuration: 2500,
    gridSize: 350,
  },
  {
    level: 8,
    rows: 5,
    cols: 5,
    activeCells: 8,
    showDuration: 2500,
    gridSize: 350,
  },
  {
    level: 9,
    rows: 6,
    cols: 5,
    activeCells: 9,
    showDuration: 2800,
    gridSize: 360,
  },
  {
    level: 10,
    rows: 6,
    cols: 6,
    activeCells: 10,
    showDuration: 3000,
    gridSize: 360,
  },
];

export const COLORS = {
  background: "#f0f0f0", 
  card: "#18181b", // zinc-900
  primary: "#22d3ee", // cyan-400
  success: "#4ade80", // green-400
  error: "#f87171", // red-400
  inactive: "#D9D9D9", // zinc-800
};
