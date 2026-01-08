/**
 * GameCard Component
 * A white card container for the game scale display
 */
import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface GameCardProps {
    children: ReactNode;
    style?: ViewStyle;
}

export const GameCard: React.FC<GameCardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        marginHorizontal: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
});
