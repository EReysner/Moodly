import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ActivityCard = ({ activity, toggleFavorite, onPress, index }) => {
  const handleFavoritePress = () => {
    if (typeof toggleFavorite === "function") {
      toggleFavorite();
    }
  };

  return (
    <AnimatedTouchable
      style={styles.activityCard}
      onPress={onPress}
      entering={FadeIn.delay(index * 100)}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
        style={styles.cardGradient}
      >
        <View style={styles.cardImageContainer}>
          {activity.image ? (
            <Image
              source={{ uri: activity.image }}
              style={styles.activityImage}
              resizeMode="cover"
              onError={(e) =>
                console.log("Error loading image:", e.nativeEvent.error)
              }
            />
          ) : (
            <View
              style={[styles.activityImage, { backgroundColor: "#E1E6EF" }]}
            >
              <Ionicons name="image-outline" size={24} color="#A0A0A0" />
            </View>
          )}

          {activity.progress >= 100 && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {activity.title}
          </Text>
          <View style={styles.activityMetaRow}>
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={14} color="#8F9BB3" />
              <Text style={styles.activityDuration}>{activity.duration}</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={
                    activity.progress >= 100
                      ? ["#4CAF50", "#81C784"]
                      : ["#6B8BFF", "#A78BFA"]
                  }
                  style={[
                    styles.progressFill,
                    { width: `${activity.progress}%` },
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text
                style={[
                  styles.progressText,
                  activity.progress >= 100 && { color: "#4CAF50" },
                ]}
              >
                {activity.progress}%
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleFavoritePress}
          style={styles.favoriteButton}
        >
          <View
            style={
              activity.favorite
                ? styles.favoriteIconActive
                : styles.favoriteIcon
            }
          >
            <Ionicons
              name={activity.favorite ? "heart" : "heart-outline"}
              size={20}
              color={activity.favorite ? "#FFFFFF" : "#A0A0A0"}
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  activityCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  cardGradient: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  cardImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 15,
    position: "relative",
  },
  activityImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activityContent: {
    flex: 1,
    justifyContent: "center",
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 6,
  },
  activityMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityDuration: {
    fontSize: 14,
    color: "#8F9BB3",
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  progressBar: {
    width: 50,
    height: 4,
    backgroundColor: "#E1E6EF",
    borderRadius: 2,
    marginRight: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#8F9BB3",
  },
  favoriteButton: {
    padding: 5,
    marginLeft: 10,
  },
  favoriteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteIconActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ActivityCard;
