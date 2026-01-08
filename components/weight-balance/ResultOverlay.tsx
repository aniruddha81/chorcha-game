/**
 * ResultOverlay Component
 * Win/Lose overlay screen for the weight balance game
 */
import { COLORS } from "@/constants/gameConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GameStatus } from "../../types/types";

interface ResultOverlayProps {
    status: GameStatus;
    levelPoints: number;
    timeBonus: number;
    availableBlocksCount: number;
    isBalanced: boolean;
    onNext: () => void;
    onRetry: () => void;
    onHome: () => void;
    isLastLevel: boolean;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({
    status,
    levelPoints,
    timeBonus,
    availableBlocksCount,
    isBalanced,
    onNext,
    onRetry,
    onHome,
    isLastLevel,
}) => {
    if (status !== "WIN" && status !== "LOSE") return null;

    const isWin = status === "WIN";

    return (
        <Animated.View
            entering={FadeInDown.springify()}
            style={styles.overlay}
        >
            <View style={styles.card}>
                <LinearGradient
                    colors={
                        isWin
                            ? ["rgba(74, 222, 128, 0.2)", "rgba(74, 222, 128, 0.05)"]
                            : ["rgba(248, 113, 113, 0.2)", "rgba(248, 113, 113, 0.05)"]
                    }
                    style={styles.gradient}
                >
                    <Ionicons
                        name={isWin ? "trophy" : "close-circle"}
                        size={60}
                        color={isWin ? COLORS.success : COLORS.error}
                    />
                    <Text
                        style={[
                            styles.title,
                            { color: isWin ? COLORS.success : COLORS.error },
                        ]}
                    >
                        {isWin ? "🎉 Balanced!" : "❌ Not Balanced"}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isWin
                            ? "Perfect equilibrium!"
                            : availableBlocksCount > 0
                                ? `Use ALL blocks! ${availableBlocksCount} remaining`
                                : !isBalanced
                                    ? "The weights are not equal on both sides"
                                    : "Try a different arrangement"}
                    </Text>

                    {isWin && (
                        <View style={styles.stats}>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{levelPoints}</Text>
                                <Text style={styles.statLabel}>Level Points</Text>
                            </View>
                            {timeBonus > 0 && (
                                <View style={styles.stat}>
                                    <Text style={styles.statValue}>{timeBonus}</Text>
                                    <Text style={styles.statLabel}>Time Bonus</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {isWin ? (
                        <TouchableOpacity
                            style={[styles.nextButton, { backgroundColor: COLORS.success }]}
                            onPress={onNext}
                        >
                            <Text style={styles.nextButtonText}>
                                {isLastLevel ? "Play Again" : "Next Level"}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.loseButtons}>
                            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                                <Ionicons name="refresh" size={20} color="#fff" />
                                <Text style={styles.retryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.homeButton} onPress={onHome}>
                                <Ionicons name="home" size={20} color="#a1a1aa" />
                            </TouchableOpacity>
                        </View>
                    )}
                </LinearGradient>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 1000,
    },
    card: {
        width: "100%",
        maxWidth: 340,
        borderRadius: 24,
        overflow: "hidden",
    },
    gradient: {
        padding: 32,
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 16,
    },
    subtitle: {
        color: "#a1a1aa",
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
    },
    stats: {
        flexDirection: "row",
        gap: 32,
        marginTop: 24,
        marginBottom: 24,
    },
    stat: {
        alignItems: "center",
    },
    statValue: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    statLabel: {
        color: "#71717a",
        fontSize: 11,
        marginTop: 4,
    },
    loseButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    nextButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 24,
        marginTop: 24,
    },
    nextButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 20,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    homeButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#27272a",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#3f3f46",
    },
});
