/**
 * Fraction Utility Functions
 * Handles fraction parsing, arithmetic, and display for the weight balance game
 */

export interface Fraction {
    numerator: number;
    denominator: number;
}

/**
 * Greatest Common Divisor using Euclidean algorithm
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

/**
 * Least Common Multiple
 */
export function lcm(a: number, b: number): number {
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * Simplify a fraction to its lowest terms
 */
export function simplifyFraction(fraction: Fraction): Fraction {
    const divisor = gcd(fraction.numerator, fraction.denominator);
    return {
        numerator: fraction.numerator / divisor,
        denominator: fraction.denominator / divisor,
    };
}

/**
 * Add two fractions together
 */
export function addFractions(a: Fraction, b: Fraction): Fraction {
    const commonDenom = lcm(a.denominator, b.denominator);
    const newNumerator =
        (a.numerator * (commonDenom / a.denominator)) +
        (b.numerator * (commonDenom / b.denominator));
    return simplifyFraction({ numerator: newNumerator, denominator: commonDenom });
}

/**
 * Sum an array of fractions
 */
export function sumFractions(fractions: Fraction[]): Fraction {
    if (fractions.length === 0) {
        return { numerator: 0, denominator: 1 };
    }
    return fractions.reduce((acc, curr) => addFractions(acc, curr), { numerator: 0, denominator: 1 });
}

/**
 * Convert a fraction to decimal
 */
export function fractionToDecimal(fraction: Fraction): number {
    return fraction.numerator / fraction.denominator;
}

/**
 * Convert decimal to fraction (approximation)
 */
export function decimalToFraction(decimal: number): Fraction {
    const precision = 1000000;
    const gcdVal = gcd(Math.round(decimal * precision), precision);
    return simplifyFraction({
        numerator: Math.round(decimal * precision) / gcdVal,
        denominator: precision / gcdVal,
    });
}

/**
 * Compare two fractions for equality
 */
export function fractionsEqual(a: Fraction, b: Fraction): boolean {
    const simplifiedA = simplifyFraction(a);
    const simplifiedB = simplifyFraction(b);
    return simplifiedA.numerator === simplifiedB.numerator &&
        simplifiedA.denominator === simplifiedB.denominator;
}

/**
 * Compare two fractions: returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareFractions(a: Fraction, b: Fraction): number {
    const decimalA = fractionToDecimal(a);
    const decimalB = fractionToDecimal(b);
    const epsilon = 0.0001; // Small tolerance for floating point comparison

    if (Math.abs(decimalA - decimalB) < epsilon) return 0;
    return decimalA < decimalB ? -1 : 1;
}

/**
 * Format a fraction for display
 */
export function formatFraction(fraction: Fraction): string {
    const simplified = simplifyFraction(fraction);
    if (simplified.denominator === 1) {
        return simplified.numerator.toString();
    }
    return `${simplified.numerator}/${simplified.denominator}`;
}

/**
 * Parse a string like "3/4" or "1.25" into a Fraction
 */
export function parseFraction(input: string): Fraction {
    // Handle decimal
    if (input.includes('.')) {
        const decimal = parseFloat(input);
        return decimalToFraction(decimal);
    }

    // Handle fraction notation
    if (input.includes('/')) {
        const [num, denom] = input.split('/').map(s => parseInt(s.trim(), 10));
        return simplifyFraction({ numerator: num, denominator: denom });
    }

    // Handle whole number
    const num = parseInt(input, 10);
    return { numerator: num, denominator: 1 };
}

/**
 * Check if the total weight equals the target (within tolerance)
 */
export function weightsMatch(total: Fraction, target: Fraction): boolean {
    const totalDecimal = fractionToDecimal(total);
    const targetDecimal = fractionToDecimal(target);
    const epsilon = 0.0001;
    return Math.abs(totalDecimal - targetDecimal) < epsilon;
}

/**
 * Complex fractions pool for generating challenging blocks
 */
const COMPLEX_FRACTIONS: Fraction[] = [
    // Halves and quarters
    { numerator: 1, denominator: 2 },
    { numerator: 1, denominator: 4 },
    { numerator: 3, denominator: 4 },
    // Thirds
    { numerator: 1, denominator: 3 },
    { numerator: 2, denominator: 3 },
    // Sixths
    { numerator: 1, denominator: 6 },
    { numerator: 5, denominator: 6 },
    // Eighths
    { numerator: 1, denominator: 8 },
    { numerator: 3, denominator: 8 },
    { numerator: 5, denominator: 8 },
    { numerator: 7, denominator: 8 },
    // Twelfths
    { numerator: 1, denominator: 12 },
    { numerator: 5, denominator: 12 },
    { numerator: 7, denominator: 12 },
    { numerator: 11, denominator: 12 },
    // Fifths
    { numerator: 1, denominator: 5 },
    { numerator: 2, denominator: 5 },
    { numerator: 3, denominator: 5 },
    { numerator: 4, denominator: 5 },
    // Tenths
    { numerator: 1, denominator: 10 },
    { numerator: 3, denominator: 10 },
    { numerator: 7, denominator: 10 },
    { numerator: 9, denominator: 10 },
];

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate balanced blocks where:
 * - Total blocks = blockCount (must be even: 8 or 10)
 * - Blocks are split into two groups of equal size (blockCount/2 each)
 * - Sum of group A = Sum of group B (this is the target weight per side)
 * - ALL blocks must be used to solve the puzzle
 * 
 * @param blockCount - Total number of blocks (8 or 10)
 * @param level - Difficulty level (affects fraction complexity)
 * @returns Object containing the blocks and the target weight per side
 */
export function generateBalancedBlocks(
    blockCount: number = 8,
    level: number = 1
): { blocks: Fraction[]; targetPerSide: Fraction } {
    // Ensure even block count
    const count = blockCount % 2 === 0 ? blockCount : blockCount + 1;
    const halfCount = count / 2;

    // Select fraction pool based on level
    let fractionPool: Fraction[];
    if (level <= 2) {
        // Easier fractions - halves, quarters, thirds
        fractionPool = COMPLEX_FRACTIONS.filter(f =>
            [2, 3, 4, 6].includes(f.denominator)
        );
    } else if (level <= 5) {
        // Medium - add eighths and sixths
        fractionPool = COMPLEX_FRACTIONS.filter(f =>
            [2, 3, 4, 6, 8].includes(f.denominator)
        );
    } else {
        // Hard - all fractions
        fractionPool = [...COMPLEX_FRACTIONS];
    }

    // Strategy: Generate one group (A), then create matching group (B) with same sum
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        attempts++;

        // Generate group A with random fractions
        const groupA: Fraction[] = [];
        for (let i = 0; i < halfCount; i++) {
            const randomFraction = fractionPool[Math.floor(Math.random() * fractionPool.length)];
            groupA.push({ ...randomFraction });
        }

        // Calculate sum of group A
        const sumA = sumFractions(groupA);
        const targetValue = fractionToDecimal(sumA);

        // Try to build group B that equals sum A
        const groupB = buildMatchingGroup(targetValue, halfCount, fractionPool);

        if (groupB) {
            // Verify the sums match
            const sumB = sumFractions(groupB);
            if (Math.abs(fractionToDecimal(sumA) - fractionToDecimal(sumB)) < 0.0001) {
                // Success! Combine and shuffle all blocks
                const allBlocks = shuffleArray([...groupA, ...groupB]);
                return {
                    blocks: allBlocks,
                    targetPerSide: simplifyFraction(sumA)
                };
            }
        }
    }

    // Fallback: Create a guaranteed solvable set
    return createFallbackBalancedSet(halfCount, level);
}

/**
 * Try to build a group of fractions that sums to the target value
 */
function buildMatchingGroup(
    targetValue: number,
    count: number,
    fractionPool: Fraction[]
): Fraction[] | null {
    // Use backtracking to find a valid combination
    const result: Fraction[] = [];

    if (backtrackBuild(targetValue, count, fractionPool, result, 0.0001)) {
        return result;
    }

    return null;
}

/**
 * Backtracking algorithm to find fractions that sum to target
 */
function backtrackBuild(
    remaining: number,
    count: number,
    pool: Fraction[],
    current: Fraction[],
    epsilon: number
): boolean {
    // Base case: we have enough fractions
    if (current.length === count) {
        return Math.abs(remaining) < epsilon;
    }

    // Prune: if remaining is negative or we can't possibly reach target
    if (remaining < -epsilon) {
        return false;
    }

    // Try each fraction in the pool
    const shuffledPool = shuffleArray(pool);
    for (const fraction of shuffledPool) {
        const value = fractionToDecimal(fraction);

        // Only consider fractions that don't exceed remaining (with some tolerance)
        if (value <= remaining + epsilon) {
            current.push({ ...fraction });

            if (backtrackBuild(remaining - value, count, pool, current, epsilon)) {
                return true;
            }

            current.pop();
        }
    }

    return false;
}

/**
 * Create a guaranteed balanced set using paired fractions
 */
function createFallbackBalancedSet(
    halfCount: number,
    level: number
): { blocks: Fraction[]; targetPerSide: Fraction } {
    // Pre-defined balanced pairs that sum to the same value
    const balancedPairs: { a: Fraction[]; b: Fraction[]; sum: Fraction }[] = [
        {
            a: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 4 }, { numerator: 1, denominator: 8 }, { numerator: 1, denominator: 8 }],
            b: [{ numerator: 3, denominator: 8 }, { numerator: 3, denominator: 8 }, { numerator: 1, denominator: 4 }],
            sum: { numerator: 1, denominator: 1 }
        },
        {
            a: [{ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 6 }, { numerator: 1, denominator: 4 }, { numerator: 1, denominator: 4 }],
            b: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 1, denominator: 6 }],
            sum: { numerator: 1, denominator: 1 }
        },
        {
            a: [{ numerator: 2, denominator: 3 }, { numerator: 1, denominator: 6 }, { numerator: 1, denominator: 4 }, { numerator: 5, denominator: 12 }],
            b: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 }, { numerator: 1, denominator: 4 }, { numerator: 5, denominator: 12 }],
            sum: { numerator: 3, denominator: 2 }
        },
    ];

    // For 4 blocks per side
    const groupA: Fraction[] = [];
    const groupB: Fraction[] = [];
    let targetSum: Fraction = { numerator: 0, denominator: 1 };

    if (halfCount === 4) {
        // Use predefined balanced sets for 4+4
        const presetA: Fraction[] = [
            { numerator: 1, denominator: 2 },
            { numerator: 1, denominator: 3 },
            { numerator: 1, denominator: 6 },
            { numerator: 1, denominator: 4 },
        ];
        const presetB: Fraction[] = [
            { numerator: 3, denominator: 4 },
            { numerator: 1, denominator: 6 },
            { numerator: 1, denominator: 6 },
            { numerator: 1, denominator: 6 },
        ];
        // Both sum to 1.25 = 5/4
        groupA.push(...presetA);
        groupB.push(...presetB);
        targetSum = { numerator: 5, denominator: 4 };
    } else if (halfCount === 5) {
        // For 5 blocks per side
        const presetA: Fraction[] = [
            { numerator: 1, denominator: 2 },
            { numerator: 1, denominator: 4 },
            { numerator: 1, denominator: 4 },
            { numerator: 1, denominator: 3 },
            { numerator: 1, denominator: 6 },
        ];
        const presetB: Fraction[] = [
            { numerator: 2, denominator: 3 },
            { numerator: 1, denominator: 6 },
            { numerator: 1, denominator: 4 },
            { numerator: 1, denominator: 4 },
            { numerator: 1, denominator: 6 },
        ];
        // Both sum to 1.5 = 3/2
        groupA.push(...presetA);
        groupB.push(...presetB);
        targetSum = { numerator: 3, denominator: 2 };
    } else {
        // Default: simple equal fractions
        for (let i = 0; i < halfCount; i++) {
            groupA.push({ numerator: 1, denominator: 4 });
            groupB.push({ numerator: 1, denominator: 4 });
        }
        targetSum = { numerator: halfCount, denominator: 4 };
    }

    const allBlocks = shuffleArray([...groupA, ...groupB]);
    return {
        blocks: allBlocks,
        targetPerSide: simplifyFraction(targetSum)
    };
}

/**
 * Legacy function - kept for compatibility but now wraps generateBalancedBlocks
 */
export function generateBlocks(
    targetFraction: Fraction,
    level: number,
    blockCount: number
): Fraction[] {
    const { blocks } = generateBalancedBlocks(blockCount, level);
    return blocks;
}

/**
 * Get color for a fraction block based on its value
 */
export function getBlockColor(fraction: Fraction): string {
    const value = fractionToDecimal(fraction);
    if (value <= 0.25) return '#22d3ee'; // cyan
    if (value <= 0.5) return '#4ade80'; // green
    if (value <= 0.75) return '#fbbf24'; // amber
    return '#f87171'; // red
}

