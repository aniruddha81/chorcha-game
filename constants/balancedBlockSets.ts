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
export const EIGHT_BLOCK_SETS: DecimalBlockSet[] = [
    // Easy sets (difficulty 1) - simple numbers
    {
        id: 1,
        difficulty: 1,
        // Left: 1.0 + 0.5 + 0.3 + 0.2 = 2.0
        leftBlocks: [1.0, 0.5, 0.3, 0.2],
        // Right: 0.8 + 0.6 + 0.4 + 0.2 = 2.0
        rightBlocks: [0.8, 0.6, 0.4, 0.2],
        targetPerSide: 2.0,
    },
    {
        id: 2,
        difficulty: 1,
        // Left: 1.5 + 0.5 + 0.5 + 0.5 = 3.0
        leftBlocks: [1.5, 0.5, 0.5, 0.5],
        // Right: 1.0 + 1.0 + 0.5 + 0.5 = 3.0
        rightBlocks: [1.0, 1.0, 0.5, 0.5],
        targetPerSide: 3.0,
    },
    {
        id: 3,
        difficulty: 1,
        // Left: 0.5 + 0.5 + 0.5 + 0.5 = 2.0
        leftBlocks: [0.5, 0.5, 0.5, 0.5],
        // Right: 1.0 + 0.4 + 0.4 + 0.2 = 2.0
        rightBlocks: [1.0, 0.4, 0.4, 0.2],
        targetPerSide: 2.0,
    },
    {
        id: 4,
        difficulty: 1,
        // Left: 1.2 + 0.8 + 0.5 + 0.5 = 3.0
        leftBlocks: [1.2, 0.8, 0.5, 0.5],
        // Right: 1.5 + 0.6 + 0.6 + 0.3 = 3.0
        rightBlocks: [1.5, 0.6, 0.6, 0.3],
        targetPerSide: 3.0,
    },
    // Medium sets (difficulty 2)
    {
        id: 5,
        difficulty: 2,
        // Left: 1.8 + 0.7 + 0.3 + 0.2 = 3.0
        leftBlocks: [1.8, 0.7, 0.3, 0.2],
        // Right: 1.2 + 0.9 + 0.5 + 0.4 = 3.0
        rightBlocks: [1.2, 0.9, 0.5, 0.4],
        targetPerSide: 3.0,
    },
    {
        id: 6,
        difficulty: 2,
        // Left: 1.5 + 1.0 + 0.8 + 0.7 = 4.0
        leftBlocks: [1.5, 1.0, 0.8, 0.7],
        // Right: 1.2 + 1.2 + 0.9 + 0.7 = 4.0
        rightBlocks: [1.2, 1.2, 0.9, 0.7],
        targetPerSide: 4.0,
    },
    {
        id: 7,
        difficulty: 2,
        // Left: 2.0 + 0.6 + 0.5 + 0.4 = 3.5
        leftBlocks: [2.0, 0.6, 0.5, 0.4],
        // Right: 1.5 + 0.8 + 0.7 + 0.5 = 3.5
        rightBlocks: [1.5, 0.8, 0.7, 0.5],
        targetPerSide: 3.5,
    },
    {
        id: 8,
        difficulty: 2,
        // Left: 1.8 + 1.2 + 0.5 + 0.5 = 4.0
        leftBlocks: [1.8, 1.2, 0.5, 0.5],
        // Right: 1.5 + 1.0 + 0.8 + 0.7 = 4.0
        rightBlocks: [1.5, 1.0, 0.8, 0.7],
        targetPerSide: 4.0,
    },
    // Hard sets (difficulty 3)
    {
        id: 9,
        difficulty: 3,
        // Left: 2.5 + 1.2 + 0.8 + 0.5 = 5.0
        leftBlocks: [2.5, 1.2, 0.8, 0.5],
        // Right: 1.8 + 1.5 + 1.0 + 0.7 = 5.0
        rightBlocks: [1.8, 1.5, 1.0, 0.7],
        targetPerSide: 5.0,
    },
    {
        id: 10,
        difficulty: 3,
        // Left: 2.2 + 1.3 + 0.9 + 0.6 = 5.0
        leftBlocks: [2.2, 1.3, 0.9, 0.6],
        // Right: 1.8 + 1.2 + 1.2 + 0.8 = 5.0
        rightBlocks: [1.8, 1.2, 1.2, 0.8],
        targetPerSide: 5.0,
    },
];

// 10-block sets (5 + 5) - Each side sums to targetPerSide
export const TEN_BLOCK_SETS: DecimalBlockSet[] = [
    // Easy 10-block sets (difficulty 1)
    {
        id: 11,
        difficulty: 1,
        // Left: 1.0 + 0.5 + 0.5 + 0.5 + 0.5 = 3.0
        leftBlocks: [1.0, 0.5, 0.5, 0.5, 0.5],
        // Right: 1.5 + 0.5 + 0.4 + 0.4 + 0.2 = 3.0
        rightBlocks: [1.5, 0.5, 0.4, 0.4, 0.2],
        targetPerSide: 3.0,
    },
    {
        id: 12,
        difficulty: 1,
        // Left: 1.2 + 0.8 + 0.5 + 0.3 + 0.2 = 3.0
        leftBlocks: [1.2, 0.8, 0.5, 0.3, 0.2],
        // Right: 1.0 + 0.6 + 0.6 + 0.5 + 0.3 = 3.0
        rightBlocks: [1.0, 0.6, 0.6, 0.5, 0.3],
        targetPerSide: 3.0,
    },
    // Medium 10-block sets (difficulty 2)
    {
        id: 13,
        difficulty: 2,
        // Left: 1.5 + 1.0 + 0.8 + 0.4 + 0.3 = 4.0
        leftBlocks: [1.5, 1.0, 0.8, 0.4, 0.3],
        // Right: 1.2 + 1.2 + 0.6 + 0.5 + 0.5 = 4.0
        rightBlocks: [1.2, 1.2, 0.6, 0.5, 0.5],
        targetPerSide: 4.0,
    },
    {
        id: 14,
        difficulty: 2,
        // Left: 1.8 + 0.9 + 0.6 + 0.4 + 0.3 = 4.0
        leftBlocks: [1.8, 0.9, 0.6, 0.4, 0.3],
        // Right: 1.5 + 0.8 + 0.7 + 0.5 + 0.5 = 4.0
        rightBlocks: [1.5, 0.8, 0.7, 0.5, 0.5],
        targetPerSide: 4.0,
    },
    {
        id: 15,
        difficulty: 2,
        // Left: 2.0 + 1.0 + 0.5 + 0.3 + 0.2 = 4.0
        leftBlocks: [2.0, 1.0, 0.5, 0.3, 0.2],
        // Right: 1.5 + 1.2 + 0.5 + 0.5 + 0.3 = 4.0
        rightBlocks: [1.5, 1.2, 0.5, 0.5, 0.3],
        targetPerSide: 4.0,
    },
    // Hard 10-block sets (difficulty 3)
    {
        id: 16,
        difficulty: 3,
        // Left: 2.5 + 1.2 + 0.8 + 0.3 + 0.2 = 5.0
        leftBlocks: [2.5, 1.2, 0.8, 0.3, 0.2],
        // Right: 1.8 + 1.5 + 0.7 + 0.6 + 0.4 = 5.0
        rightBlocks: [1.8, 1.5, 0.7, 0.6, 0.4],
        targetPerSide: 5.0,
    },
    {
        id: 17,
        difficulty: 3,
        // Left: 2.2 + 1.5 + 0.8 + 0.3 + 0.2 = 5.0
        leftBlocks: [2.2, 1.5, 0.8, 0.3, 0.2],
        // Right: 1.8 + 1.2 + 1.0 + 0.5 + 0.5 = 5.0
        rightBlocks: [1.8, 1.2, 1.0, 0.5, 0.5],
        targetPerSide: 5.0,
    },
    {
        id: 18,
        difficulty: 3,
        // Left: 2.0 + 1.8 + 0.6 + 0.4 + 0.2 = 5.0
        leftBlocks: [2.0, 1.8, 0.6, 0.4, 0.2],
        // Right: 1.5 + 1.5 + 1.0 + 0.5 + 0.5 = 5.0
        rightBlocks: [1.5, 1.5, 1.0, 0.5, 0.5],
        targetPerSide: 5.0,
    },
    {
        id: 19,
        difficulty: 3,
        // Left: 2.5 + 1.5 + 0.5 + 0.3 + 0.2 = 5.0
        leftBlocks: [2.5, 1.5, 0.5, 0.3, 0.2],
        // Right: 2.0 + 1.2 + 0.8 + 0.6 + 0.4 = 5.0
        rightBlocks: [2.0, 1.2, 0.8, 0.6, 0.4],
        targetPerSide: 5.0,
    },
    {
        id: 20,
        difficulty: 3,
        // Left: 2.8 + 1.2 + 0.5 + 0.3 + 0.2 = 5.0
        leftBlocks: [2.8, 1.2, 0.5, 0.3, 0.2],
        // Right: 1.8 + 1.5 + 0.9 + 0.5 + 0.3 = 5.0
        rightBlocks: [1.8, 1.5, 0.9, 0.5, 0.3],
        targetPerSide: 5.0,
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
 * Get a random balanced block set for a given level
 * @param level - Game level (1-10)
 * @param useEightBlocks - If true, use 8-block sets, else 10-block sets
 * @returns A balanced block set with all blocks shuffled together
 */
export function getRandomDecimalBlockSet(
    level: number,
    useEightBlocks: boolean = true
): { blocks: number[]; targetPerSide: number } {
    const sets = useEightBlocks ? EIGHT_BLOCK_SETS : TEN_BLOCK_SETS;

    // Determine difficulty based on level
    let difficulty: 1 | 2 | 3;
    if (level <= 3) {
        difficulty = 1;
    } else if (level <= 6) {
        difficulty = 2;
    } else {
        difficulty = 3;
    }

    // Filter sets by difficulty
    const matchingSets = sets.filter(s => s.difficulty === difficulty);

    // Pick a random set (or fallback to any set)
    const availableSets = matchingSets.length > 0 ? matchingSets : sets;
    const selectedSet = availableSets[Math.floor(Math.random() * availableSets.length)];

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
    if (weight <= 0.5) return '#22d3ee'; // cyan - light
    if (weight <= 1.0) return '#4ade80'; // green - medium light
    if (weight <= 1.5) return '#fbbf24'; // amber - medium
    if (weight <= 2.0) return '#fb923c'; // orange - medium heavy
    return '#f87171'; // red - heavy
}

/**
 * Format a decimal weight for display
 */
export function formatWeight(weight: number): string {
    // Remove trailing zeros after decimal point
    return weight.toFixed(1).replace(/\.0$/, '');
}
