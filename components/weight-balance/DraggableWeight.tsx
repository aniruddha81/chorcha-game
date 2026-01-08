/**
 * DraggableWeight Component
 * A draggable weight for the balance scale game
 */
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { BlockData, LayoutRect } from "../../types/types";
import { WeightBlock } from "./WeightBlock";

interface DraggableWeightProps {
    block: BlockData;
    onDrop: (blockId: string, zone: "left" | "right" | "available") => void;
    leftPanLayout: LayoutRect;
    rightPanLayout: LayoutRect;
    disabled: boolean;
    isAvailable?: boolean;
}

export const DraggableWeight: React.FC<DraggableWeightProps> = ({
    block,
    onDrop,
    leftPanLayout,
    rightPanLayout,
    disabled,
    isAvailable = true,
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const zIndex = useSharedValue(1);
    const isDragging = useSharedValue(false);

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const gesture = Gesture.Pan()
        .enabled(!disabled)
        .onStart(() => {
            isDragging.value = true;
            scale.value = withSpring(1.15);
            zIndex.value = 100;
            runOnJS(triggerHaptic)();
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

            // Determine drop zone with more generous hit detection
            let dropZone: "left" | "right" | "available" = "available";

            // Check left pan
            if (
                absoluteX >= leftPanLayout.x - 20 &&
                absoluteX <= leftPanLayout.x + leftPanLayout.width + 20 &&
                absoluteY >= leftPanLayout.y - 40 &&
                absoluteY <= leftPanLayout.y + leftPanLayout.height + 40
            ) {
                dropZone = "left";
            }
            // Check right pan
            else if (
                absoluteX >= rightPanLayout.x - 20 &&
                absoluteX <= rightPanLayout.x + rightPanLayout.width + 20 &&
                absoluteY >= rightPanLayout.y - 40 &&
                absoluteY <= rightPanLayout.y + rightPanLayout.height + 40
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
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[
                    styles.container,
                    animatedStyle,
                    disabled && styles.disabled,
                    !isAvailable && styles.onScale,
                ]}
            >
                <WeightBlock
                    weight={block.weight}
                    size={isAvailable ? "medium" : "small"}
                    isDragging={false}
                />
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    disabled: {
        opacity: 0.5,
    },
    onScale: {
        // Smaller when on scale
    },
});
