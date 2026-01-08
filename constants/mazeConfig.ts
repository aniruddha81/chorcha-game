// Maze Configuration Constants

export interface MazeLevel {
    level: number;
    maze: string[][];
    timeLimit: number; // seconds
    baseScore: number;
    timeBonusMultiplier: number;
}

// Cell types
export const CELL_TYPES = {
    PATH: '0',
    WALL: '1',
    START: 'S',
    EXIT: 'E',
} as const;

// Predefined maze layouts - increasing difficulty
export const MAZE_LEVELS: MazeLevel[] = [
    {
        level: 1,
        timeLimit: 60,
        baseScore: 100,
        timeBonusMultiplier: 2,
        maze: [
            ['S', '0', '1', '1', '1', '1', '1'],
            ['1', '0', '0', '0', '0', '0', '1'],
            ['1', '1', '1', '1', '1', '0', '1'],
            ['1', '0', '0', '0', '0', '0', '1'],
            ['1', '0', '1', '1', '1', '1', '1'],
            ['1', '0', '0', '0', '0', '0', 'E'],
            ['1', '1', '1', '1', '1', '1', '1'],
        ],
    },
    {
        level: 2,
        timeLimit: 75,
        baseScore: 150,
        timeBonusMultiplier: 2,
        maze: [
            ['S', '0', '0', '1', '0', '0', '0', '1'],
            ['1', '1', '0', '1', '0', '1', '0', '1'],
            ['1', '0', '0', '0', '0', '1', '0', '1'],
            ['1', '0', '1', '1', '1', '1', '0', '1'],
            ['1', '0', '0', '0', '0', '0', '0', '1'],
            ['1', '1', '1', '0', '1', '1', '0', '1'],
            ['1', '0', '0', '0', '1', '0', '0', '1'],
            ['1', '0', '1', '1', '1', '0', '1', 'E'],
        ],
    },
    {
        level: 3,
        timeLimit: 90,
        baseScore: 200,
        timeBonusMultiplier: 3,
        maze: [
            ['S', '0', '1', '0', '0', '0', '1', '0', '0'],
            ['1', '0', '1', '0', '1', '0', '1', '0', '1'],
            ['1', '0', '0', '0', '1', '0', '0', '0', '1'],
            ['1', '1', '1', '0', '1', '1', '1', '0', '1'],
            ['1', '0', '0', '0', '0', '0', '1', '0', '1'],
            ['1', '0', '1', '1', '1', '0', '1', '0', '1'],
            ['1', '0', '1', '0', '0', '0', '0', '0', '1'],
            ['1', '0', '1', '0', '1', '1', '1', '1', '1'],
            ['1', '0', '0', '0', '0', '0', '0', '0', 'E'],
        ],
    },
    {
        level: 4,
        timeLimit: 100,
        baseScore: 300,
        timeBonusMultiplier: 3,
        maze: [
            ['S', '0', '0', '1', '0', '0', '0', '1', '0', '0'],
            ['1', '1', '0', '1', '0', '1', '0', '1', '1', '0'],
            ['0', '0', '0', '0', '0', '1', '0', '0', '0', '0'],
            ['0', '1', '1', '1', '0', '1', '1', '1', '1', '0'],
            ['0', '0', '0', '1', '0', '0', '0', '0', '1', '0'],
            ['1', '1', '0', '1', '1', '1', '1', '0', '1', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '1', '1', '0', '1', '1', '0', '1', '1', '1'],
            ['0', '0', '0', '0', '1', '0', '0', '0', '0', '0'],
            ['1', '1', '1', '0', '1', '0', '1', '1', '1', 'E'],
        ],
    },
    {
        level: 5,
        timeLimit: 120,
        baseScore: 500,
        timeBonusMultiplier: 4,
        maze: [
            ['S', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1'],
            ['1', '0', '1', '0', '1', '0', '1', '0', '1', '0', '1'],
            ['1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '1'],
            ['1', '0', '1', '1', '1', '1', '1', '0', '1', '0', '1'],
            ['1', '0', '0', '0', '0', '0', '1', '0', '1', '0', '0'],
            ['1', '1', '1', '1', '1', '0', '1', '0', '1', '1', '0'],
            ['1', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0'],
            ['1', '0', '1', '0', '1', '1', '1', '1', '1', '1', '0'],
            ['1', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['1', '0', '1', '1', '1', '1', '0', '1', '1', '1', '1'],
            ['1', '0', '0', '0', '0', '0', '0', '0', '0', '0', 'E'],
        ],
    },
];

// Maze colors - Traditional Black & White
export const MAZE_COLORS = {
    background: '#ffffff',
    path: '#ffffff',
    wall: '#000000',
    start: '#000000', // We might use icons so color matters less, but keep it dark
    exit: '#000000',
    player: '#000000',
    playerGlow: 'rgba(0,0,0,0.1)',
    trail: 'rgba(0,0,0,0.05)',
    wallThickness: 6, // Thicker walls requested (4px-6px)
};

// Mascot messages based on game state
export const MASCOT_MESSAGES = {
    idle: "Ready to explore the maze? Let's go!",
    start: 'Swipe to move! Find the exit!',
    playing: [
        "You're doing great!",
        'Keep going!',
        'Follow the path!',
        "You've got this!",
    ],
    hurry: [
        'Hurry up! Time is running out!',
        'Quick! Find the exit!',
        "Almost out of time!",
    ],
    almostThere: [
        "You're so close!",
        'The exit is near!',
        'Almost there!',
    ],
    won: [
        'Amazing! You escaped!',
        'Brilliant navigation!',
        'You did it!',
    ],
    lost: [
        "Time's up! Try again!",
        "Don't give up!",
        'You can do it next time!',
    ],
};

// Game configuration
export const GAME_CONFIG = {
    minSwipeDistance: 30, // minimum swipe distance in pixels
    animationDuration: 150, // player movement animation duration in ms
    hurryTimeThreshold: 15, // seconds remaining to show hurry messages
};
