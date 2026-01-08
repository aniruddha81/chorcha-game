/**
 * Shared types and constants for Weight Balance game
 */
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Layout dimensions
export const SCALE_WIDTH = SCREEN_WIDTH - 60;
export const PAN_WIDTH = (SCALE_WIDTH - 60) / 2;
export const BLOCK_SIZE = 60;

// Game status
export type GameStatus = "PLAYING" | "CHECKING" | "WIN" | "LOSE";

// Block data interface
export interface BlockData {
    id: string;
    weight: number; // Decimal weight like 1.2, 1.5, 0.8
    position: "available" | "left" | "right";
}

// Layout interface
export interface LayoutRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
