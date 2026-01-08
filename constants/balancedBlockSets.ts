/**
 * Predefined balanced block sets for the weight balance game.
 * Uses simple decimal numbers (0.1, 0.2, 0.5, 1.0, 1.2, 1.5, etc.)
 * 
 * Each set contains blocks that can be perfectly split into two equal groups.
 * When used in game, leftBlocks and rightBlocks are combined and shuffled.
 */

export interface DecimalBlockSet {
    id: number;
    difficulty: 1 | 2 | 3; // 1 = easy, 2 = medium, 3 = hard
    leftBlocks: number[];   // Weights for left side
    rightBlocks: number[];  // Weights for right side (sum equals left side)
    targetPerSide: number;  // Sum of either side
}

// 8-block sets (4 + 4) - Each side sums to targetPerSide
// User provided sets for specific levels
export const LEVEL_SETS: DecimalBlockSet[] = [
    // Set 1: 1, 2.5, 4, 5.5 (Target 6.5)
    {
        id: 1,
        difficulty: 1,
        leftBlocks: [1, 5.5],
        rightBlocks: [2.5, 4],
        targetPerSide: 6.5,
    },
    // Set 2: 2, 3.5, 5.5, 7 (Target 9)
    {
        id: 2,
        difficulty: 1,
        leftBlocks: [2, 7],
        rightBlocks: [3.5, 5.5],
        targetPerSide: 9,
    },
    // Set 3: 1.2, 2.2, 5.2, 4.2 (Target 6.4)
    // Note: User equation was 2.2+5.2 != 1.2+4.2. Corrected to 1.2+5.2 = 2.2+4.2
    {
        id: 3,
        difficulty: 1,
        leftBlocks: [1.2, 5.2],
        rightBlocks: [2.2, 4.2],
        targetPerSide: 6.4,
    },
    // Set 4: 22, 24, 48, 50 (Target 72)
    {
        id: 4,
        difficulty: 2,
        leftBlocks: [22, 50],
        rightBlocks: [24, 48],
        targetPerSide: 72,
    },
    // Set 5: 3, 2, 7, 10, 12 (Target 17)
    {
        id: 5,
        difficulty: 2,
        leftBlocks: [3, 2, 12],
        rightBlocks: [7, 10],
        targetPerSide: 17,
    },
    // Set 6: 3, 5, 6, 8, 10 (Target 16)
    {
        id: 6,
        difficulty: 2,
        leftBlocks: [3, 5, 8],
        rightBlocks: [6, 10],
        targetPerSide: 16,
    },
    // Set 7: 3.5, 5.5, 8, 9, 10 (Target 18)
    {
        id: 7,
        difficulty: 2,
        leftBlocks: [3.5, 5.5, 9],
        rightBlocks: [8, 10],
        targetPerSide: 18,
    },
    // Set 8: 2, 1, 4, 5, 6, 8 (Target 13)
    {
        id: 8,
        difficulty: 3,
        leftBlocks: [1, 2, 4, 6],
        rightBlocks: [5, 8],
        targetPerSide: 13,
    },
    // Set 9: 4, 5, 3, 7, 8, 9 (Target 18)
    {
        id: 9,
        difficulty: 3,
        leftBlocks: [4, 5, 9],
        rightBlocks: [3, 7, 8],
        targetPerSide: 18,
    },
    // Set 10: 4, 6, 7, 8, 9 (Target 17)
    {
        id: 10,
        difficulty: 3,
        leftBlocks: [4, 6, 7],
        rightBlocks: [8, 9],
        targetPerSide: 17,
    },
];

/**
 * Fisher-Yates shuffle for blocks
 */
function shuffleBlocks(blocks: number[]): number[] {
    const shuffled = [...blocks];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get the specific block set for a given level
 * @param level - Game level (1-10)
 * @param _useEightBlocks - Ignored now, using fixed sets
 * @returns A balanced block set with all blocks shuffled together
 */
export function getRandomDecimalBlockSet(
    level: number,
    _useEightBlocks: boolean = true
): { blocks: number[]; targetPerSide: number } {
    // Map level to index (Level 1 -> Index 0)
    // Wrap around if level > 10
    const setIndex = (level - 1) % LEVEL_SETS.length;
    const selectedSet = LEVEL_SETS[setIndex];

    // Combine and shuffle all blocks
    const allBlocks = [...selectedSet.leftBlocks, ...selectedSet.rightBlocks];
    const shuffledBlocks = shuffleBlocks(allBlocks);

    return {
        blocks: shuffledBlocks,
        targetPerSide: selectedSet.targetPerSide,
    };
}

/**
 * Get color for a decimal block based on its value
 */
export function getDecimalBlockColor(weight: number): string {
    if (weight <= 3.0) return '#22d3ee'; // cyan - light
    if (weight <= 6.0) return '#4ade80'; // green - medium light
    if (weight <= 10.0) return '#fbbf24'; // amber - medium
    if (weight <= 25.0) return '#fb923c'; // orange - medium heavy
    return '#f87171'; // red - heavy
}

/**
 * Format a decimal weight for display
 */
export function formatWeight(weight: number): string {
    // Remove trailing zeros after decimal point
    return weight.toFixed(1).replace(/\.0$/, '');
}
