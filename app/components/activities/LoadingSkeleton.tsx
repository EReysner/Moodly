import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const LoadingSkeleton = () => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.ease }),
        withTiming(0.5, { duration: 500, easing: Easing.ease })
      ),
      -1, 
      true 
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.bannerSkeleton, pulseStyle]} />

      <Animated.View style={[styles.trackerSkeleton, pulseStyle]}>
        <View style={styles.trackerHeader}>
          <View style={styles.trackerTitleSkeleton} />
          <View style={styles.trackerIconSkeleton} />
        </View>
        <View style={styles.trackerBarSkeleton} />
        <View style={styles.trackerStatsSkeleton} />
      </Animated.View>

      <Animated.View style={[styles.moodSkeleton, pulseStyle]}>
        <View style={styles.moodTitleSkeleton} />
        <View style={styles.moodOptionsContainer}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.moodOptionSkeleton}>
              <View style={styles.moodCircleSkeleton} />
              <View style={styles.moodTextSkeleton} />
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.headerContainer}>
        <View style={styles.headerTitleSkeleton} />
        <View style={styles.headerActionSkeleton} />
      </View>

      {[1, 2, 3, 4].map((item) => (
        <Animated.View key={item} style={[styles.cardSkeleton, pulseStyle]}>
          <View style={styles.cardImageSkeleton} />
          <View style={styles.cardContentSkeleton}>
            <View style={styles.cardTitleSkeleton} />
            <View style={styles.cardSubtitleSkeleton} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F9FB",
  },
  bannerSkeleton: {
    height: 150,
    borderRadius: 20,
    backgroundColor: "#E1E6EF",
    marginBottom: 20,
  },
  trackerSkeleton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  trackerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  trackerTitleSkeleton: {
    height: 16,
    width: "40%",
    backgroundColor: "#E1E6EF",
    borderRadius: 4,
  },
  trackerIconSkeleton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: "#E1E6EF",
  },
  trackerBarSkeleton: {
    height: 10,
    backgroundColor: "#E1E6EF",
    borderRadius: 5,
    marginBottom: 10,
  },
  trackerStatsSkeleton: {
    height: 12,
    width: "60%",
    backgroundColor: "#E1E6EF",
    borderRadius: 3,
  },
  moodSkeleton: {
    marginBottom: 20,
  },
  moodTitleSkeleton: {
    height: 18,
    width: "50%",
    backgroundColor: "#E1E6EF",
    borderRadius: 4,
    marginBottom: 16,
  },
  moodOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodOptionSkeleton: {
    alignItems: "center",
  },
  moodCircleSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E1E6EF",
    marginBottom: 8,
  },
  moodTextSkeleton: {
    height: 12,
    width: 50,
    backgroundColor: "#E1E6EF",
    borderRadius: 3,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitleSkeleton: {
    height: 18,
    width: "40%",
    backgroundColor: "#E1E6EF",
    borderRadius: 4,
  },
  headerActionSkeleton: {
    height: 14,
    width: "20%",
    backgroundColor: "#E1E6EF",
    borderRadius: 3,
  },
  cardSkeleton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageSkeleton: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#E1E6EF",
    marginRight: 15,
  },
  cardContentSkeleton: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitleSkeleton: {
    height: 16,
    width: "80%",
    backgroundColor: "#E1E6EF",
    borderRadius: 4,
    marginBottom: 8,
  },
  cardSubtitleSkeleton: {
    height: 12,
    width: "50%",
    backgroundColor: "#E1E6EF",
    borderRadius: 4,
  },
});

export default LoadingSkeleton;