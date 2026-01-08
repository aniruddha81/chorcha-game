/**
 * GameHeader Component
 * Header displaying level info and score for weight balance game
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GameHeaderProps {
    level: number;
    score: number;
    onBack?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
    level,
    score,
    onBack,
}) => {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color="#52525b" />
            </TouchableOpacity>

            <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Level {level}</Text>
            </View>

            <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{score}</Text>
                <Text style={styles.scoreLabel}>pt</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    levelContainer: {
        flex: 1,
        alignItems: "flex-start",
        marginLeft: 16,
    },
    levelText: {
        color: "#27272a",
        fontSize: 18,
        fontWeight: "600",
    },
    scoreContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 2,
    },
    scoreValue: {
        color: "#27272a",
        fontSize: 20,
        fontWeight: "bold",
    },
    scoreLabel: {
        color: "#71717a",
        fontSize: 14,
        fontWeight: "500",
    },
});
