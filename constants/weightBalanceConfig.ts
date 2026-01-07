import { Fraction } from "@/utils/fractionUtils";

export interface LevelConfig {
    level: number;
    targetWeight: Fraction; // Note: This is now dynamically generated, kept for compatibility
    blockCount: number; // Must be even (8 or 10)
    timeLimit: number; // seconds, 0 for unlimited
    description: string;
}

export const WEIGHT_BALANCE_LEVELS: LevelConfig[] = [
    {
        level: 1,
        targetWeight: { numerator: 1, denominator: 2 },
        blockCount: 8,
        timeLimit: 0,
        description: "Warm up! 8 blocks",
    },
    {
        level: 2,
        targetWeight: { numerator: 3, denominator: 4 },
        blockCount: 8,
        timeLimit: 0,
        description: "Getting started",
    },
    {
        level: 3,
        targetWeight: { numerator: 1, denominator: 1 },
        blockCount: 8,
        timeLimit: 90,
        description: "Timed challenge",
    },
    {
        level: 4,
        targetWeight: { numerator: 2, denominator: 3 },
        blockCount: 8,
        timeLimit: 75,
        description: "Tricky thirds",
    },
    {
        level: 5,
        targetWeight: { numerator: 5, denominator: 6 },
        blockCount: 8,
        timeLimit: 60,
        description: "Complex combos",
    },
    {
        level: 6,
        targetWeight: { numerator: 7, denominator: 8 },
        blockCount: 10,
        timeLimit: 90,
        description: "10 blocks!",
    },
    {
        level: 7,
        targetWeight: { numerator: 5, denominator: 4 },
        blockCount: 10,
        timeLimit: 75,
        description: "Expert mode",
    },
    {
        level: 8,
        targetWeight: { numerator: 3, denominator: 2 },
        blockCount: 10,
        timeLimit: 60,
        description: "Speed run",
    },
    {
        level: 9,
        targetWeight: { numerator: 11, denominator: 6 },
        blockCount: 10,
        timeLimit: 50,
        description: "Master class",
    },
    {
        level: 10,
        targetWeight: { numerator: 2, denominator: 1 },
        blockCount: 10,
        timeLimit: 45,
        description: "Grand finale!",
    },
];

export const BALANCE_COLORS = {
    scale: "#52525b",
    scaleLight: "#71717a",
    pan: "#3f3f46",
    panBorder: "#52525b",
    beam: "#a1a1aa",
    pivot: "#fbbf24",
    balanced: "#4ade80",
    leftHeavy: "#f87171",
    rightHeavy: "#60a5fa",
};
