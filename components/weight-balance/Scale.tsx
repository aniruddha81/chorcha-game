/**
 * Scale Component
 * Animated balance scale that tilts based on weight difference
 */
import { BALANCE_COLORS } from "@/constants/weightBalanceConfig";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { PAN_WIDTH, SCALE_WIDTH } from "../../types/types";

interface ScaleProps {
    leftWeight: number;
    rightWeight: number;
    isBalanced: boolean;
    isShaking: boolean;
}

export const Scale: React.FC<ScaleProps> = ({
    leftWeight,
    rightWeight,
    isBalanced,
    isShaking,
}) => {
    const tiltAngle = useSharedValue(0);
    const shakeX = useSharedValue(0);

    // Calculate tilt based on weight difference
    useEffect(() => {
        const diff = leftWeight - rightWeight;
        const maxTilt = 15; // Maximum tilt angle in degrees
        const newTilt = Math.max(-maxTilt, Math.min(maxTilt, diff * 10));
        tiltAngle.value = withSpring(newTilt, { damping: 15, stiffness: 100 });
    }, [leftWeight, rightWeight, tiltAngle]);

    // Shake animation
    useEffect(() => {
        if (isShaking) {
            shakeX.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withRepeat(withTiming(10, { duration: 100 }), 4, true),
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
        const angle = tiltAngle.value * (Math.PI / 180);
        const offsetY = Math.sin(angle) * (SCALE_WIDTH / 4);
        return {
            transform: [{ translateY: offsetY }],
        };
    });

    const rightPanStyle = useAnimatedStyle(() => {
        const angle = tiltAngle.value * (Math.PI / 180);
        const offsetY = -Math.sin(angle) * (SCALE_WIDTH / 4);
        return {
            transform: [{ translateY: offsetY }],
        };
    });

    return (
        <View style={styles.scaleContainer}>
            {/* Pivot/Stand */}
            <View style={styles.scalePivot}>
                <View style={styles.pivotTriangle} />
            </View>

            {/* Beam */}
            <Animated.View style={[styles.scaleBeam, beamStyle]}>
                {/* Left Pan Connection */}
                <View style={[styles.panConnection, { left: 20 }]} />
                {/* Right Pan Connection */}
                <View style={[styles.panConnection, { right: 20 }]} />

                {/* Center Point */}
                <View
                    style={[
                        styles.centerPoint,
                        isBalanced && { backgroundColor: BALANCE_COLORS.balanced },
                    ]}
                />
            </Animated.View>

            {/* Pans Container */}
            <View style={styles.pansContainer}>
                {/* Left Pan */}
                <Animated.View style={[styles.panWrapper, leftPanStyle]}>
                    <View style={styles.panChains}>
                        <View style={styles.chain} />
                        <View style={styles.chain} />
                    </View>
                    <View
                        style={[
                            styles.pan,
                            isBalanced && { borderColor: BALANCE_COLORS.balanced },
                        ]}
                    >
                        <Text style={styles.panLabel}>LEFT</Text>
                        <Text style={styles.panWeight}>
                            {leftWeight > 0 ? leftWeight.toFixed(1) : "0"} kg
                        </Text>
                    </View>
                </Animated.View>

                {/* Right Pan */}
                <Animated.View style={[styles.panWrapper, rightPanStyle]}>
                    <View style={styles.panChains}>
                        <View style={styles.chain} />
                        {/* <View style={styles.chain} /> */}
                    </View>
                    <View
                        style={[
                            styles.pan,
                            isBalanced && { borderColor: BALANCE_COLORS.balanced },
                        ]}
                    >
                        <Text style={styles.panLabel}>RIGHT</Text>
                        <Text style={styles.panWeight}>
                            {rightWeight > 0 ? rightWeight.toFixed(1) : "0"} kg
                        </Text>
                    </View>
                </Animated.View>
            </View>

            {/* Stand Base */}
            <View style={styles.scaleBase} />
        </View>
    );
};

const styles = StyleSheet.create({
    scaleContainer: {
        width: SCALE_WIDTH,
        height: 160,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    scalePivot: {
        position: "absolute",
        bottom: 40,
        alignItems: "center",
    },
    pivotTriangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderBottomWidth: 40,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: BALANCE_COLORS.pivot,
    },
    scaleBeam: {
        position: "absolute",
        top: 40,
        width: SCALE_WIDTH - 40,
        height: 12,
        backgroundColor: BALANCE_COLORS.beam,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    panConnection: {
        position: "absolute",
        top: 10,
        width: 4,
        height: 30,
        backgroundColor: BALANCE_COLORS.scaleLight,
        borderRadius: 2,
    },
    centerPoint: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: BALANCE_COLORS.pivot,
        borderWidth: 3,
        borderColor: BALANCE_COLORS.beam,
    },
    pansContainer: {
        position: "absolute",
        top: 60,
        width: SCALE_WIDTH,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    panWrapper: {
        alignItems: "center",
    },
    panChains: {
        flexDirection: "row",
        gap: 30,
    },
    chain: {
        width: 3,
        height: 20,
        backgroundColor: BALANCE_COLORS.scaleLight,
        borderRadius: 1,
    },
    pan: {
        width: PAN_WIDTH,
        height: 50,
        backgroundColor: BALANCE_COLORS.pan,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: BALANCE_COLORS.panBorder,
        justifyContent: "center",
        alignItems: "center",
    },
    panLabel: {
        color: "#71717a",
        fontSize: 10,
        fontWeight: "600",
    },
    panWeight: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    scaleBase: {
        width: 60,
        height: 10,
        backgroundColor: BALANCE_COLORS.scale,
        borderRadius: 5,
    },
});
