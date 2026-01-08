// Maze Cell with wall data
export interface MazeCell {
    r: number;
    c: number;
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
    visited: boolean;
}

export type MazeGrid = MazeCell[][];

/**
 * Generates a maze using Recursive Backtracker algorithm.
 * Each cell contains wall information (top, right, bottom, left).
 */
export const generateMaze = (rows: number, cols: number): MazeGrid => {
    // Initialize grid with all walls present and unvisited
    const grid: MazeGrid = [];
    for (let r = 0; r < rows; r++) {
        const row: MazeCell[] = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                r,
                c,
                top: true,
                right: true,
                bottom: true,
                left: true,
                visited: false,
            });
        }
        grid.push(row);
    }

    const stack: MazeCell[] = [];
    const startCell = grid[0][0];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const next = getUnvisitedNeighbor(current, grid, rows, cols);

        if (next) {
            next.visited = true;
            removeWalls(current, next);
            stack.push(next);
        } else {
            stack.pop();
        }
    }

    return grid;
};

const getUnvisitedNeighbor = (
    cell: MazeCell,
    grid: MazeGrid,
    rows: number,
    cols: number
): MazeCell | undefined => {
    const neighbors: MazeCell[] = [];
    const { r, c } = cell;

    if (r > 0 && !grid[r - 1][c].visited) neighbors.push(grid[r - 1][c]); // Top
    if (c < cols - 1 && !grid[r][c + 1].visited) neighbors.push(grid[r][c + 1]); // Right
    if (r < rows - 1 && !grid[r + 1][c].visited) neighbors.push(grid[r + 1][c]); // Bottom
    if (c > 0 && !grid[r][c - 1].visited) neighbors.push(grid[r][c - 1]); // Left

    if (neighbors.length > 0) {
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        return neighbors[randomIndex];
    }
    return undefined;
};

const removeWalls = (a: MazeCell, b: MazeCell): void => {
    const dr = a.r - b.r;
    const dc = a.c - b.c;

    if (dr === 1) {
        // a is below b
        a.top = false;
        b.bottom = false;
    } else if (dr === -1) {
        // a is above b
        a.bottom = false;
        b.top = false;
    } else if (dc === 1) {
        // a is right of b
        a.left = false;
        b.right = false;
    } else if (dc === -1) {
        // a is left of b
        a.right = false;
        b.left = false;
    }
};
