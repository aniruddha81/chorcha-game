import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

interface WeightBlockProps {
    weight: number;
    size?: "small" | "medium" | "large";
    style?: ViewStyle;
    isDragging?: boolean;
}

export const WeightBlock: React.FC<WeightBlockProps> = ({
    weight,
    size = "medium",
    style,
    isDragging = false,
}) => {
    const dimensions = {
        small: { width: 44, height: 50, fontSize: 16, labelSize: 8 },
        medium: { width: 61, height: 70, fontSize: 20, labelSize: 10 },
        large: { width: 78, height: 90, fontSize: 24, labelSize: 12 },
    };

    const { width, height, fontSize, labelSize } = dimensions[size];

    const formatWeight = (w: number): string => {
        if (Number.isInteger(w)) {
            return w.toString();
        }
        return w.toFixed(1);
    };

    return (
        <View style={[styles.container, { width, height }, isDragging && styles.dragging, style]}>
            {/* Kettlebell Shape from weignt.svg */}
            <Svg width={width} height={height} viewBox="0 0 220 260">
                {/* Handle back (centered) */}
                <Path
                    d="M85 50 a25 25 0 0 1 50 0 v30 q0 10 -10 10 h-30 q-10 0 -10 -10 z"
                    fill="#6F7F86"
                />

                {/* Handle front (centered) */}
                <Path
                    d="M95 50 a20 20 0 0 1 40 0 v30 q0 10 -10 10 h-20 q-10 0 -10 -10 z"
                    fill="#55656C"
                />

                {/* Body shadow */}
                <Path
                    d="M55 60 h130 l15 155 q1 5 -4 5 h-122 q-5 0 -4 -5 z"
                    fill="#8F9DA8"
                />

                {/* Main body */}
                <Path
                    d="M35 60 h130 l-15 155 q-1 5 -6 5 h-118 q-5 0 -6 -5 z"
                    fill="#AEBAC6"
                />
            </Svg>

            {/* Weight label - Centered in the body area */}
            <View style={styles.labelContainer}>
                <Text style={[styles.weightText, { fontSize }]}>{formatWeight(weight)}</Text>
                <Text style={[styles.unitText, { fontSize: labelSize }]}> kg</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {

        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    dragging: {
        opacity: 0.85,
        transform: [{ scale: 1.05 }],
    },
    labelContainer: {
        position: "absolute",
        top: "52%",
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "baseline",
    },
    weightText: {
        fontSize: 28,
        fontWeight: "semibold",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    unitText: {
        color: "#000/50",
        fontSize: 28,
        fontWeight: "semibold",
    },
});
