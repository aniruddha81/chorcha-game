import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

interface MascotFeedbackProps {
  text: string;
}

export const MascotFeedback = ({ text }: MascotFeedbackProps) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // Reset and start typing
    setDisplayedText("");
    if (!text) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      // Use functional state to append reliably
      setDisplayedText((prev) => {
        if (currentIndex >= text.length) {
          clearInterval(interval);
          return prev;
        }
        const nextChar = text.charAt(currentIndex);
        currentIndex++;
        return prev + nextChar;
      });
    }, 40); // 40ms typing speed

    return () => clearInterval(interval);
  }, [text]);

  return (
    <View style={styles.container}>
      {/* Cartoon Mascot Placeholder - Rive Animation goes here */}
      <View style={styles.mascotPlaceholder}>
        <Image source={require("../assets/images/chorcha-mascot.png")} />
      </View>

      {/* Speech Bubble */}
      {text ? (
        <Animated.View
          entering={ZoomIn}
          key={text}
          style={styles.bubbleContainer}
        >
          {/* Tail Triangle */}
          <View style={styles.tail} />

          <View style={styles.bubble}>
            <Text style={styles.text}>{displayedText}</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120, // Adjust based on mascot size
    paddingHorizontal: 20,
    width: "100%",
  },
  mascotPlaceholder: {
    width: 100,
    height: 100,
    // User requested NO content here, just space.
  },
  bubbleContainer: {
    flex: 1,
    marginBottom: 40,
    marginLeft: 10,
    position: "relative",
  },
  bubble: {
    backgroundColor: "#18181b", // Zinc-900 / Black
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minHeight: 50,
    justifyContent: "center",
  },
  tail: {
    position: "absolute",
    left: -10,
    bottom: 15,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: "transparent",
    borderRightWidth: 15,
    borderRightColor: "#18181b", // Match bubble color
    borderBottomWidth: 10,
    borderBottomColor: "transparent",
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System", // Or user's font
  },
});
