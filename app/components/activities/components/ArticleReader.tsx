import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
} from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface ArticleReaderProps {
  content: string;
  title?: string;
  onClose?: () => void;
}

const ArticleReader: React.FC<ArticleReaderProps> = ({
  content,
  title,
  onClose,
}) => {
  const [controlsVisible, setControlsVisible] = useState(false);
  const scrollY = useSharedValue(0);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState<"sans-serif" | "serif">(
    "sans-serif"
  );
  const [darkMode, setDarkMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleShowControls = () => {
    setControlsVisible((prev) => !prev);
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [1, 0], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -20],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const controlsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(showControls ? 0 : 100) }],
    opacity: withSpring(showControls ? 1 : 0),
  }));

  const toggleControls = () => {
    setShowControls((prev) => !prev);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (showControls) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 5000);
    }
  };

  const adjustFontSize = (change: number) => {
    setFontSize((prev) => Math.min(22, Math.max(14, prev + change)));
  };

  const renderTextLine = (line: string, lineIndex: number) => {
    if (line.trim() === "") {
      return <View key={`empty-${lineIndex}`} style={{ height: fontSize }} />;
    }

    const isBullet = line.trim().startsWith("- ");
    const isNumbered = /^\d+\.\s/.test(line.trim());

    let marker = "";
    let content = line;
    if (isBullet) {
      marker = "•";
      content = line.trim().substring(2);
    } else if (isNumbered) {
      marker = line.trim().match(/^\d+\./)?.[0] || "";
      content = line.trim().replace(/^\d+\.\s*/, "");
    }

    const parts = [];
    let lastIndex = 0;
    const regex = /(\*\*([^\*]+)\*\*|\*([^\*]+)\*)/g;
    let match;
    let key = 0;
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <Text
            key={key++}
            style={[
              styles.baseText,
              { fontSize },
              fontFamily === "serif" && styles.serifFont,
              darkMode && styles.darkText,
            ]}
          >
            {content.substring(lastIndex, match.index)}
          </Text>
        );
      }
      if (match[2]) {
        parts.push(
          <Text
            key={key++}
            style={[
              styles.baseText,
              styles.boldText,
              { fontSize },
              fontFamily === "serif" && styles.serifFont,
              darkMode && styles.darkText,
            ]}
          >
            {match[2]}
          </Text>
        );
      } else if (match[3]) {
        parts.push(
          <Text
            key={key++}
            style={[
              styles.baseText,
              styles.italicText,
              { fontSize },
              fontFamily === "serif" && styles.serifFont,
              darkMode && styles.darkText,
            ]}
          >
            {match[3]}
          </Text>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(
        <Text
          key={key++}
          style={[
            styles.baseText,
            { fontSize },
            fontFamily === "serif" && styles.serifFont,
            darkMode && styles.darkText,
          ]}
        >
          {content.substring(lastIndex)}
        </Text>
      );
    }

    return (
      <View
        key={`line-${lineIndex}`}
        style={[
          styles.lineContainer,
          (isBullet || isNumbered) && styles.listItemContainer,
        ]}
      >
        {(isBullet || isNumbered) && (
          <Text style={[styles.listBullet, darkMode && styles.darkText]}>
            {marker + " "}
          </Text>
        )}
        <Text
          style={[
            styles.baseText,
            { fontSize },
            fontFamily === "serif" && styles.serifFont,
            darkMode && styles.darkText,
          ]}
        >
          {parts}
        </Text>
      </View>
    );
  };

  const formatContent = (content: string) => {
    const normalizedContent = content.replace(/\\n/g, "\n");

    const paragraphs = normalizedContent.split("\n\n");

    return paragraphs.map((paragraph, paraIndex) => {
      const lines = paragraph.split("\n");

      return (
        <View key={`para-${paraIndex}`} style={styles.paragraphContainer}>
          {lines.map((line, lineIndex) => renderTextLine(line, lineIndex))}
        </View>
      );
    });
  };

  return (
    <Animated.View
      style={[styles.container, darkMode && styles.darkContainer]}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <Animated.View
        style={[styles.header, headerStyle, darkMode && styles.darkHeader]}
      >
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons
            name="chevron-down"
            size={28}
            color={darkMode ? "#E0E0E0" : "#5E6B8B"}
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <TouchableOpacity onPress={handleShowControls} activeOpacity={0.85}>
            <LinearGradient
              colors={["#6B8BFF", "#A78BFA"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="options" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => (scrollY.value = e.nativeEvent.contentOffset.y)}
        onTouchStart={toggleControls}
      >
        <View style={styles.contentContainer}>
          {title && (
            <Text
              style={[
                styles.title,
                darkMode && styles.darkText,
                { fontSize: fontSize + 6 },
                fontFamily === "serif" && styles.serifFont,
              ]}
            >
              {title}
            </Text>
          )}

          <View style={[styles.divider, darkMode && styles.darkDivider]} />

          {formatContent(content)}
        </View>
      </ScrollView>

      {controlsVisible && (
        <Animated.View
          style={[styles.controlsContainer, darkMode && styles.darkControls]}
        >
          <View style={styles.controlsRow}>
            <View style={styles.fontSizeContainer}>
              <TouchableOpacity
                onPress={() => setFontSize((prev) => Math.max(14, prev - 1))}
                disabled={fontSize <= 14}
                style={[
                  styles.controlButton,
                  darkMode && styles.darkControlButton,
                ]}
              >
                <Ionicons
                  name="remove-outline"
                  size={20}
                  color={darkMode ? "#E0E0E0" : "#5E6B8B"}
                />
              </TouchableOpacity>

              <View
                style={[
                  styles.fontSizeDisplay,
                  darkMode && styles.darkFontSizeDisplay,
                ]}
              >
                <Text
                  style={[styles.fontSizeText, darkMode && styles.darkText]}
                >
                  {fontSize}px
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setFontSize((prev) => Math.min(22, prev + 1))}
                disabled={fontSize >= 22}
                style={[
                  styles.controlButton,
                  darkMode && styles.darkControlButton,
                ]}
              >
                <Ionicons
                  name="add-outline"
                  size={20}
                  color={darkMode ? "#E0E0E0" : "#5E6B8B"}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() =>
                setFontFamily((prev) =>
                  prev === "sans-serif" ? "serif" : "sans-serif"
                )
              }
              style={[
                styles.fontTypeButton,
                darkMode && styles.darkFontTypeButton,
              ]}
            >
              <Text style={[styles.controlLabel, darkMode && styles.darkText]}>
                {fontFamily === "sans-serif" ? "Sans" : "Serif"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDarkMode(!darkMode)}
              style={[styles.modeButton, darkMode && styles.activeModeButton]}
            >
              <Ionicons
                name={darkMode ? "sunny" : "moon"}
                size={20}
                color={darkMode ? "#121212" : "#5E6B8B"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${100}%` },
                darkMode && styles.darkProgressBar,
              ]}
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
    backgroundColor: "rgba(248, 250, 255, 0.9)",
    justifyContent: "space-between",
  },
  darkHeader: {
    backgroundColor: "rgba(18, 18, 18, 0.9)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(107, 139, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59",
    marginLeft: 15,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 100,
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 15,
    lineHeight: 36,
  },
  baseText: {
    lineHeight: 28,
    color: "#4D5A76",
  },
  boldText: {
    fontWeight: "700",
  },
  italicText: {
    fontStyle: "italic",
  },
  headingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3E4A6B",
    marginVertical: 10,
  },
  headingContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  paragraphContainer: {
    marginBottom: 20,
  },
  lineContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  listItemContainer: {
    marginLeft: 10,
  },
  listBullet: {
    marginRight: 8,
    color: "#4D5A76",
  },
  listItemText: {
    flex: 1,
  },
  serifFont: {
    fontFamily: "serif",
  },
  darkText: {
    color: "#E0E0E0",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(107, 139, 255, 0.2)",
    marginVertical: 20,
  },
  darkDivider: {
    backgroundColor: "rgba(167, 139, 250, 0.2)",
  },
  completionSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(107, 139, 255, 0.08)",
  },
  darkCompletionSection: {
    backgroundColor: "rgba(167, 139, 250, 0.08)",
  },
  completionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#5E6B8B",
    marginLeft: 12,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  darkControls: {
    backgroundColor: "#2A2A2A",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  fontSizeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(107, 139, 255, 0.1)",
  },
  darkControlButton: {
    backgroundColor: "rgba(167, 139, 250, 0.1)",
  },
  fontSizeDisplay: {
    minWidth: 50,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(107, 139, 255, 0.1)",
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  darkFontSizeDisplay: {
    backgroundColor: "rgba(167, 139, 250, 0.1)",
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5E6B8B",
  },
  fontTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(107, 139, 255, 0.1)",
  },
  darkFontTypeButton: {
    backgroundColor: "rgba(167, 139, 250, 0.1)",
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5E6B8B",
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(107, 139, 255, 0.1)",
  },
  activeModeButton: {
    backgroundColor: "#E0E0E0",
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(107, 139, 255, 0.2)",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6B8BFF",
  },
  darkProgressBar: {
    backgroundColor: "#A78BFA",
  },
  gradientButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default ArticleReader;
