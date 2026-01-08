/**
 * DraggableBlock Component
 * A draggable weight block for the balance scale game
 */
import {
    formatWeight,
    getDecimalBlockColor,
} from "@/constants/balancedBlockSets";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { BLOCK_SIZE, BlockData, LayoutRect } from "../../types/types";

interface DraggableBlockProps {
    block: BlockData;
    onDrop: (blockId: string, zone: "left" | "right" | "available") => void;
    leftPanLayout: LayoutRect;
    rightPanLayout: LayoutRect;
    disabled: boolean;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
    block,
    onDrop,
    leftPanLayout,
    rightPanLayout,
    disabled,
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const zIndex = useSharedValue(1);
    const isDragging = useSharedValue(false);

    const blockColor = getDecimalBlockColor(block.weight);

    const gesture = Gesture.Pan()
        .enabled(!disabled)
        .onStart(() => {
            isDragging.value = true;
            scale.value = withSpring(1.15);
            zIndex.value = 100;
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            isDragging.value = false;
            scale.value = withSpring(1);
            zIndex.value = 1;

            // Calculate absolute position
            const absoluteX = event.absoluteX;
            const absoluteY = event.absoluteY;

            // Determine drop zone
            let dropZone: "left" | "right" | "available" = "available";

            if (
                absoluteX >= leftPanLayout.x &&
                absoluteX <= leftPanLayout.x + leftPanLayout.width &&
                absoluteY >= leftPanLayout.y &&
                absoluteY <= leftPanLayout.y + leftPanLayout.height
            ) {
                dropZone = "left";
            } else if (
                absoluteX >= rightPanLayout.x &&
                absoluteX <= rightPanLayout.x + rightPanLayout.width &&
                absoluteY >= rightPanLayout.y &&
                absoluteY <= rightPanLayout.y + rightPanLayout.height
            ) {
                dropZone = "right";
            }

            translateX.value = withSpring(0);
            translateY.value = withSpring(0);

            runOnJS(onDrop)(block.id, dropZone);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        zIndex: zIndex.value,
        opacity: isDragging.value ? 0.9 : 1,
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[
                    styles.block,
                    animatedStyle,
                    { backgroundColor: blockColor, opacity: disabled ? 0.5 : 1 },
                ]}
            >
                <Text style={styles.blockText}>{formatWeight(block.weight)}</Text>
                <Text style={styles.blockUnit}>kg</Text>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    block: {
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    blockText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    blockUnit: {
        color: "rgba(0,0,0,0.6)",
        fontSize: 10,
    },
});
