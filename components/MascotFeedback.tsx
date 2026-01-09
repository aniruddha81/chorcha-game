import React, { Component, useEffect, useMemo, useState } from "react";
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
import Rive, { Fit } from "rive-react-native";

export type MascotMood = "explain" | "angry" | "happy";

interface MascotFeedbackProps {
  text: string;
  mood?: MascotMood;
  showBg?: boolean;
  onClose?: () => void;
}

/* eslint-disable @typescript-eslint/no-require-imports */
const RIVE_SOURCES: Record<MascotMood, number> = {
  explain: require("../assets/mascot_explain.riv"),
  angry: require("../assets/mascot_angry.riv"),
  happy: require("../assets/mascot_happy.riv"),
};

const FALLBACK_IMAGE = require("../assets/images/chorcha-mascot.png");
/* eslint-enable @typescript-eslint/no-require-imports */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Error boundary to catch Rive errors (e.g., in Expo Go where native modules aren't available)
interface RiveErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface RiveErrorBoundaryState {
  hasError: boolean;
}

class RiveErrorBoundary extends Component<
  RiveErrorBoundaryProps,
  RiveErrorBoundaryState
> {
  constructor(props: RiveErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RiveErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Rive failed to load, using fallback image:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const MascotFeedback = ({
  text,
  mood = "explain",
  showBg = true,
  onClose = () => { },
}: MascotFeedbackProps) => {
  const [displayedText, setDisplayedText] = useState("");

  const riveSource = useMemo(() => RIVE_SOURCES[mood], [mood]);

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

  const fallbackImage = (
    <Image
      source={FALLBACK_IMAGE}
      style={styles.mascotImage}
      resizeMode="contain"
    />
  );

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
        {/* Mascot Rive Animation with Fallback */}
        <View style={styles.mascotContainer}>
          <RiveErrorBoundary fallback={fallbackImage}>
            <Rive
              key={mood}
              source={riveSource}
              fit={Fit.Contain}
              autoplay={true}
              style={styles.mascotImage}
            />
          </RiveErrorBoundary>
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
