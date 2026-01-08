/**
 * ScaleBalance Component
 * A beautiful, realistic animated balance scale matching the reference design
 * With triangle ropes (A-shape), shorter beam (240px), and edge-connected ropes
 * Visual update: Full Green Circle joints (#29CC57)
 * Physics update: Correct reversed tilt and arc motion (ropes stay attached)
 */
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { BlockData, LayoutRect } from "../../types/types";
import { DraggableWeight } from "./DraggableWeight";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCALE_SIZE = Math.min(SCREEN_WIDTH - 80, 240); // Shorter bar (240px)
const JOINT_OFFSET = 10; // Rope connection very close to the edge (User set to 10)
const ARM_LENGTH = SCALE_SIZE / 2 - JOINT_OFFSET; // Radius of rotation
const PAN_WIDTH = 90;
const PAN_HEIGHT = 25;
const ROPE_HEIGHT = 150;

// Configurable Stand Height and Base Size
const STAND_HEIGHT = 250; // User set to 250
const BEAM_Y = 25;

// BeamBase (SVG Base) Sizing
const BEAM_BASE_WIDTH = 120;
const BEAM_BASE_SVG_WIDTH = 300;
const BEAM_BASE_SVG_HEIGHT = 180;
const BEAM_BASE_SCALE = BEAM_BASE_WIDTH / BEAM_BASE_SVG_WIDTH; // 0.4
const BEAM_BASE_HEIGHT = BEAM_BASE_SVG_HEIGHT * BEAM_BASE_SCALE; // 72

// The updated BeamBase SVG has content starting at y=60 (Blue block)
// So top 60px of the 180px height are empty.
// We need to extend the column down to meet the visual top.
const BEAM_SVG_CONTENT_Y = 60;
const VISIBLE_TOP_OFFSET = BEAM_SVG_CONTENT_Y * BEAM_BASE_SCALE; // 24px

// Column Calculation
// Connect from Beam (25) down to top of BeamBase (STAND_HEIGHT - 72).
// Add VISIBLE_TOP_OFFSET to penetrate the empty space.
// Add overlap (+5) to ensure no gap.
const STAND_COLUMN_HEIGHT = (STAND_HEIGHT - BEAM_BASE_HEIGHT - BEAM_Y) + VISIBLE_TOP_OFFSET + 5;


/**
 * ScalePan Component
 * Inlined from assets/svgs/scale-pan.svg
 */
interface SvgProps {
    width?: number | string;
    height?: number | string;
}

const ScalePan: React.FC<SvgProps> = ({ width, height }) => (
    <Svg width={width || 102} height={height || 35} viewBox="0 0 102 35" fill="none">
        <Path fillRule="evenodd" clipRule="evenodd" d="M93.1455 15.2486L51.2156 10.2003L9.30493 15.2486V20.032C9.30493 28.2661 22.6781 35 39.0297 35H63.4207C79.7723 35 93.1455 28.2657 93.1455 20.032V15.2486Z" fill="#29CC57" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M95.0858 15.1349H78.3453H74.7248V19.8203C74.7248 28.0544 61.3516 34.7883 45 34.7883H65.3617C81.7133 34.7883 95.0865 28.054 95.0865 19.8203L95.0858 15.1349Z" fill="#048E21" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M96.3214 20.1392C99.4416 20.1392 102 17.6224 102 14.5529V5.72546C102 2.65599 99.4416 0.139191 96.3214 0.139191C66.1069 0.139191 35.8924 0.139191 5.65893 0.139191C5.09711 0.139191 4.53462 0.234758 4.01152 0.387129C1.68613 1.09285 0 3.22805 0 5.72546V14.5529C0 17.0503 1.68613 19.1862 4.01152 19.8913C4.53462 20.0436 5.09711 20.1392 5.65893 20.1392H96.3214Z" fill="#365E7D" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M80.9942 17.0642C80.0228 18.7991 78.1374 20 76 20H92.7112H96.3063C99.4348 20 102 17.4832 102 14.4137V5.58627C102 2.5168 99.4348 0 96.3063 0H92.7112H76C79.1285 0 81.6739 2.5168 81.6739 5.58627V14.4137C81.6739 15.3674 81.441 16.2823 80.9942 17.0642Z" fill="#2B4D66" />
    </Svg>
);

const BeamBase: React.FC<SvgProps> = ({ width, height }) => (
    <Svg width={width || 300} height={height || 180} viewBox="0 0 300 180" fill="none">
        <Rect x="90" y="60" width="120" height="70" rx="30" fill="#365E7D" />
        <Rect x="140" y="60" width="120" height="70" rx="30" fill="#2C4A63" />
        <Rect x="50" y="100" width="200" height="60" rx="30" fill="#2ECC71" />
        <Rect x="160" y="100" width="140" height="60" rx="30" fill="#1E9E4A" />
    </Svg>
);

interface ScaleBalanceProps {
    leftWeight: number;
    rightWeight: number;
    leftBlocks: BlockData[];
    rightBlocks: BlockData[];
    isBalanced: boolean;
    isShaking: boolean;
    onDrop: (blockId: string, zone: "left" | "right" | "available") => void;
    leftPanLayout: LayoutRect;
    rightPanLayout: LayoutRect;
}

export const ScaleBalance: React.FC<ScaleBalanceProps> = ({
    leftWeight,
    rightWeight,
    leftBlocks,
    rightBlocks,
    isBalanced,
    isShaking,
    onDrop,
    leftPanLayout,
    rightPanLayout,
}) => {
    const tiltAngle = useSharedValue(0);
    const shakeX = useSharedValue(0);

    // Calculate tilt based on weight difference
    useEffect(() => {
        const diff = rightWeight - leftWeight;
        const maxTilt = 18;
        const newTilt = Math.max(-maxTilt, Math.min(maxTilt, diff * 8));
        tiltAngle.value = withSpring(newTilt, { damping: 12, stiffness: 90 });
    }, [leftWeight, rightWeight, tiltAngle]);

    useEffect(() => {
        if (isShaking) {
            shakeX.value = withSequence(
                withTiming(-8, { duration: 50 }),
                withRepeat(withTiming(8, { duration: 100 }), 4, true),
                withTiming(0, { duration: 50 })
            );
        }
    }, [isShaking, shakeX]);

    const beamStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${tiltAngle.value}deg` },
            { translateX: shakeX.value },
        ],
    }));

    const leftPanStyle = useAnimatedStyle(() => {
        const rad = tiltAngle.value * (Math.PI / 180);
        const translateY = -Math.sin(rad) * ARM_LENGTH;
        const translateX = ARM_LENGTH * (1 - Math.cos(rad));
        return {
            transform: [
                { translateX: translateX },
                { translateY: translateY },
            ],
        };
    });

    const rightPanStyle = useAnimatedStyle(() => {
        const rad = tiltAngle.value * (Math.PI / 180);
        const translateY = Math.sin(rad) * ARM_LENGTH;
        const translateX = ARM_LENGTH * (Math.cos(rad) - 1);
        return {
            transform: [
                { translateX: translateX },
                { translateY: translateY },
            ],
        };
    });

    // Colors
    const jointColor = "#29CC57";
    const armColor = isBalanced ? jointColor : "#29CC57";
    const pivotColor = "#ef5777";
    const ropeColor = "#CBE4E7";

    // Rope Triangle Path
    const centerX = (PAN_WIDTH + 20) / 2;
    const ropeTrianglePath = `
        M ${centerX} 8 
        L 10 ${ROPE_HEIGHT} 
        M ${centerX} 8 
        L ${PAN_WIDTH + 10} ${ROPE_HEIGHT}
    `;

    return (
        <View style={styles.container}>
            {/* Scale Stand */}
            <View style={styles.standContainer}>
                {/* 1. Base Image */}
                <View style={{ position: "absolute", bottom: 0, left: 50 }}>
                    <BeamBase width={BEAM_BASE_WIDTH} height={BEAM_BASE_HEIGHT} />
                </View>

                {/* 2. Vertical Column & Pivot */}
                <Svg width={100} height={STAND_HEIGHT} viewBox={`0 0 100 ${STAND_HEIGHT}`}>
                    <Rect
                        x="45"
                        y={BEAM_Y}
                        width="10"
                        height={STAND_COLUMN_HEIGHT}
                        fill={ropeColor}
                        rx="3"
                    />

                    {/* Pivot Circles */}
                    <Circle cx="50" cy={BEAM_Y} r="14" fill={pivotColor} />
                    <Circle cx="50" cy={BEAM_Y} r="8" fill="#fff" opacity={0.3} />
                </Svg>
            </View>

            {/* Beam */}
            <Animated.View style={[styles.beamContainer, beamStyle]}>
                <Svg width={SCALE_SIZE} height={50} viewBox={`0 0 ${SCALE_SIZE} 50`}>
                    {/* Main Beam */}
                    <Line
                        x1={JOINT_OFFSET + 5}
                        y1={BEAM_Y}
                        x2={SCALE_SIZE - JOINT_OFFSET - 5}
                        y2={BEAM_Y}
                        stroke={armColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Joint Circles */}
                    <Circle cx={JOINT_OFFSET} cy={BEAM_Y} r="8" fill={jointColor} />
                    <Circle cx={SCALE_SIZE - JOINT_OFFSET} cy={BEAM_Y} r="8" fill={jointColor} />
                    {/* Center Connection Point */}
                    <Circle cx={SCALE_SIZE / 2} cy={BEAM_Y} r="8" fill={jointColor} />
                </Svg>
            </Animated.View>

            {/* Pans */}
            <View style={styles.pansContainer}>
                {/* Left Pan */}
                <Animated.View
                    style={[
                        styles.panWrapper,
                        leftPanStyle,
                        { left: JOINT_OFFSET - (PAN_WIDTH + 20) / 2 }
                    ]}
                >
                    <Svg width={PAN_WIDTH + 20} height={ROPE_HEIGHT} viewBox={`0 0 ${PAN_WIDTH + 20} ${ROPE_HEIGHT}`}>
                        <Path
                            d={ropeTrianglePath}
                            stroke={ropeColor}
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <View style={styles.panOuter}>
                        <ScalePan width={PAN_WIDTH + 20} height={PAN_HEIGHT + 15} />
                        <View style={styles.weightsOnPan}>
                            {leftBlocks.map((block, index) => (
                                <View
                                    key={block.id}
                                    style={{
                                        marginHorizontal: -6,
                                        zIndex: index, // Later items on top
                                    }}
                                >
                                    <DraggableWeight
                                        block={block}
                                        onDrop={onDrop}
                                        leftPanLayout={leftPanLayout}
                                        rightPanLayout={rightPanLayout}
                                        disabled={false}
                                        isAvailable={false}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>

                {/* Right Pan */}
                <Animated.View
                    style={[
                        styles.panWrapper,
                        rightPanStyle,
                        { right: JOINT_OFFSET - (PAN_WIDTH + 20) / 2 }
                    ]}
                >
                    <Svg width={PAN_WIDTH + 20} height={ROPE_HEIGHT} viewBox={`0 0 ${PAN_WIDTH + 20} ${ROPE_HEIGHT}`}>
                        <Path
                            d={ropeTrianglePath}
                            stroke={ropeColor}
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <View style={styles.panOuter}>
                        <ScalePan width={PAN_WIDTH + 20} height={PAN_HEIGHT + 15} />
                        <View style={styles.weightsOnPan}>
                            {rightBlocks.map((block, index) => (
                                <View
                                    key={block.id}
                                    style={{
                                        marginHorizontal: -6,
                                        zIndex: index, // Later items on top
                                    }}
                                >
                                    <DraggableWeight
                                        block={block}
                                        onDrop={onDrop}
                                        leftPanLayout={leftPanLayout}
                                        rightPanLayout={rightPanLayout}
                                        disabled={false}
                                        isAvailable={false}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCALE_SIZE,
        height: STAND_HEIGHT,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    standContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        zIndex: 100,
    },
    beamContainer: {
        position: "absolute",
        top: 0,
        zIndex: 11,
    },
    pansContainer: {
        position: "absolute",
        top: 25,
        width: SCALE_SIZE,
        height: STAND_HEIGHT,
        zIndex: 1,
    },
    panWrapper: {
        alignItems: "center",
        width: PAN_WIDTH + 20,
        position: "absolute",
    },
    panOuter: {
        alignItems: "center",
        position: "relative",
    },
    weightsOnPan: {
        position: "absolute",
        bottom: 18,
        width: 130, // Constrain width to force wrapping
        flexDirection: "row",
        flexWrap: "wrap-reverse", // Stack upwards
        justifyContent: "center",
        alignItems: "flex-end",
    },
});
