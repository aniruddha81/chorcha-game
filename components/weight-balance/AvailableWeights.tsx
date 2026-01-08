/**
 * AvailableWeights Component
 * Displays the available weights that can be dragged onto the scale
 */
import React from "react";
import { StyleSheet, View } from "react-native";
import { BlockData, LayoutRect } from "../../types/types";
import { DraggableWeight } from "./DraggableWeight";

interface AvailableWeightsProps {
    blocks: BlockData[];
    onDrop: (blockId: string, zone: "left" | "right" | "available") => void;
    leftPanLayout: LayoutRect;
    rightPanLayout: LayoutRect;
    disabled: boolean;
}

export const AvailableWeights: React.FC<AvailableWeightsProps> = ({
    blocks,
    onDrop,
    leftPanLayout,
    rightPanLayout,
    disabled,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.weightsRow}>
                {blocks.map((block) => (
                    <DraggableWeight
                        key={block.id}
                        block={block}
                        onDrop={onDrop}
                        leftPanLayout={leftPanLayout}
                        rightPanLayout={rightPanLayout}
                        disabled={disabled}
                        isAvailable={true}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    weightsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 16,
    },
});
