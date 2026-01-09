import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import Svg, { Ellipse } from "react-native-svg";

interface MascotFeedbackProps {
  text: string;
  showBg?: boolean;
  onClose?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const MascotFeedback = ({
  text,
  showBg = true,
  onClose = () => { },
}: MascotFeedbackProps) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    if (!text) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        if (currentIndex >= text.length) {
          clearInterval(interval);
          return prev;
        }
        const nextChar = text.charAt(currentIndex);
        currentIndex++;
        return prev + nextChar;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <Pressable style={styles.container} onPress={onClose}>
      {/* Background SVG - Positioned Absolutely */}
      {showBg === true ? (
        <View style={styles.svgBackground}>
          <Svg width={SCREEN_WIDTH} height="123" viewBox="0 0 393 123">
            <Ellipse cx="195" cy="77.5" rx="243" ry="77.5" fill="#D9D9D9" />
          </Svg>
        </View>
      ) : null}

      <View style={styles.contentWrapper}>
        {/* Mascot Image */}
        <View style={styles.mascotContainer}>
          <Image
            source={require("../assets/images/chorcha-mascot.png")}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        {/* Speech Bubble */}
        {text ? (
          <Animated.View
            entering={ZoomIn}
            key={text}
            style={styles.bubbleContainer}
          >
            <View style={styles.bubble}>
              <Text style={styles.text}>{displayedText}</Text>
            </View>
            {/* Tail Triangle - Positioned to look like the 1st image */}
            <View style={styles.tail} />
          </Animated.View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 200,
    minHeight: 140,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  },
  svgBackground: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    zIndex: 2,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  mascotContainer: {
    width: 120,
    height: 120,
  },
  mascotImage: {
    width: "100%",
    height: "100%",
  },
  bubbleContainer: {
    flex: 1,
    marginBottom: 50,
    marginLeft: -10,
    position: "relative",
  },
  bubble: {
    backgroundColor: "#18181b",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    minHeight: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  tail: {
    position: "absolute",
    left: 20,
    bottom: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderLeftColor: "transparent",
    borderRightWidth: 15,
    borderRightColor: "transparent",
    borderTopWidth: 20,
    borderTopColor: "#18181b",
    transform: [{ rotate: "20deg" }], // Tilts the tail towards the mascot
  },
  text: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
});
