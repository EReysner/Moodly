import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import ActivityReader from "./components/ArticleReader";

const { width, height } = Dimensions.get("window");

interface ActivityDetailsProps {
  activity: {
    id: string;
    title: string;
    duration: string;
    favorite: boolean;
    description: string;
    image: string;
    audio_url?: string;
    progress?: number;
    content?: string;
  };
  currentCategory: {
    id: string;
    title: string;
    color: string;
    tabIcon: string;
    activities?: any[];
  };
  onClose: () => void;
  updateProgress: (activityId: string, progress: number) => Promise<boolean>;
}

const ActivityDetails: React.FC<ActivityDetailsProps> = ({
  activity,
  onClose,
  currentCategory,
  updateProgress,
}) => {
  const scrollY = useSharedValue(0);
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progressUpdated, setProgressUpdated] = useState(false);
  const progressUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showReader, setShowReader] = useState(false);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolate.CLAMP),
  }));

  const imageOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.7], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(scrollY.value, [0, 100], [1, 0.95]) }],
  }));

  const updateAudioProgress = async (currentPos: number, totalDur: number) => {
    if (totalDur > 0) {
      const newProgress = Math.min(
        100,
        Math.round((currentPos / totalDur) * 100)
      );

      if (
        Math.abs(newProgress - (activity.progress || 0)) >= 5 ||
        newProgress === 100
      ) {
        const success = await updateProgress(activity.id, newProgress);

        if (success) {
          setProgressUpdated(true);
          if (progressUpdateTimeout.current) {
            clearTimeout(progressUpdateTimeout.current);
          }
          progressUpdateTimeout.current = setTimeout(() => {
            setProgressUpdated(false);
          }, 2000);
        }
      }
    }
  };

  const handlePrimaryAction = async () => {
    try {
      if (currentCategory.id === "4" && activity.audio_url) {
        if (isPlaying) {
          await pauseSound();
        } else {
          await playSound();
        }
      } else {
        const success = await updateProgress(activity.id, 100);
        if (success) {
          setProgressUpdated(true);
          setTimeout(() => setProgressUpdated(false), 2000);
        }
        if (currentCategory.id === "3") {
          setShowReader(true); 
        }
      }
    } catch (error) {
      console.error("Error en acción principal:", error);
    }
  };

  const playSound = async () => {
    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
        setIsLoading(false);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: activity.audio_url },
        { shouldPlay: true },
        async (status) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis || 0);
            setIsLoading(false);

            if (status.isPlaying) {
              await updateAudioProgress(
                status.positionMillis || 0,
                status.durationMillis || 0
              );
            }

            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
              await updateProgress(activity.id, 100);
              setProgressUpdated(true);
              setTimeout(() => setProgressUpdated(false), 2000);
            }
          }
        }
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error al reproducir:", error);
      setIsLoading(false);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.pauseAsync();
          setIsPlaying(false);
          setPosition(status.positionMillis || 0);

          if (status.durationMillis) {
            await updateAudioProgress(
              status.positionMillis || 0,
              status.durationMillis
            );
          }
        }
      } catch (error) {
        console.error("Error al pausar:", error);
      }
    }
  };

  const handleSliderValueChange = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);

      if (duration > 0) {
        await updateAudioProgress(value, duration);
      }
    }
  };

  const formatTime = (ms: number) => {
    if (isNaN(ms)) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch((error) => {
          console.error("Error al liberar sonido:", error);
        });
      }
      if (progressUpdateTimeout.current) {
        clearTimeout(progressUpdateTimeout.current);
      }
    };
  }, [sound]);

  return (
    <Animated.View
      style={styles.detailsContainer}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      {showReader ? (
        <ActivityReader
          content={activity.content ?? ""}
          title={activity.title}
          key={activity.id}
          onClose={() => setShowReader(false)}
        />
      ) : (
        <>
          <StatusBar barStyle="light-content" />

          <Animated.View style={[styles.detailsHeaderContainer, headerStyle]}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsActionButton}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.ScrollView
            style={styles.detailsScrollView}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              scrollY.value = event.nativeEvent.contentOffset.y;
            }}
          >
            <Animated.View style={[styles.detailsImageContainer, imageOpacity]}>
              {activity.image ? (
                <Image
                  source={{ uri: activity.image }}
                  style={styles.detailsImage}
                />
              ) : (
                <LinearGradient
                  colors={[currentCategory.color, `${currentCategory.color}80`]}
                  style={styles.detailsImagePlaceholder}
                >
                  <Ionicons
                    name={currentCategory.tabIcon}
                    size={70}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              )}

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.detailsGradientOverlay}
              />

              <View style={styles.detailsTitleContainer}>
                <Text style={styles.detailsTitle}>{activity.title}</Text>
                <View style={styles.detailsMetaContainer}>
                  <View style={styles.detailsMeta}>
                    <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.detailsDuration}>
                      {activity.duration}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.favoriteButtonDetails}>
                    <Ionicons
                      name={activity.favorite ? "heart" : "heart-outline"}
                      size={24}
                      color={activity.favorite ? "#FF6B6B" : "#FFFFFF"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            <View style={styles.detailsContentContainer}>
              <Text style={styles.detailsDescriptionTitle}>Descripción</Text>
              <Text style={styles.detailsDescription}>
                {activity.description}
              </Text>

              <View style={styles.actionButtonsContainer}>
                {currentCategory.id === "4" && activity.audio_url ? (
                  <View style={styles.audioPlayerContainer}>
                    <TouchableOpacity
                      onPress={isPlaying ? pauseSound : playSound}
                      style={styles.playButton}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Ionicons
                          name={isPlaying ? "pause" : "play"}
                          size={28}
                          color="#FFFFFF"
                        />
                      )}
                    </TouchableOpacity>

                    <View style={styles.progressContainer}>
                      <Text style={styles.timeText}>
                        {formatTime(position)}
                      </Text>
                      <Slider
                        style={styles.progressBar}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onSlidingComplete={handleSliderValueChange}
                        minimumTrackTintColor="#FFFFFF"
                        maximumTrackTintColor="rgba(255,255,255,0.5)"
                        thumbTintColor="#FFFFFF"
                        disabled={duration === 0 || isLoading}
                      />
                      <Text style={styles.timeText}>
                        {formatTime(duration)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={handlePrimaryAction}
                  >
                    <LinearGradient
                      colors={["#6B8BFF", "#A78BFA"]}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons
                        name={
                          currentCategory.id === "3" ? "book-outline" : "play"
                        }
                        size={22}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>
                        {currentCategory.id === "3"
                          ? "Leer artículo"
                          : "Iniciar"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.secondaryActionButton}>
                  <Ionicons name="download-outline" size={22} color="#6B8BFF" />
                </TouchableOpacity>
              </View>

              {progressUpdated && (
                <View style={styles.progressUpdatedFeedback}>
                  <Text style={styles.progressUpdatedText}>
                    Progreso guardado
                  </Text>
                </View>
              )}

              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>
                  Recomendado para ti
                </Text>
                <Animated.ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recommendationsScroll}
                >
                  {currentCategory.activities
                    ?.filter((item) => item.id !== activity.id)
                    ?.slice(0, 3)
                    ?.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.recommendedItem}
                      >
                        {item.image ? (
                          <Image
                            source={{ uri: item.image }}
                            style={styles.recommendedImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.recommendedImage,
                              { backgroundColor: "#E1E6EF" },
                            ]}
                          >
                            <Ionicons
                              name="image-outline"
                              size={20}
                              color="#A0A0A0"
                            />
                          </View>
                        )}
                        <Text style={styles.recommendedTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.recommendedDuration}>
                          {item.duration}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </Animated.ScrollView>
              </View>
            </View>
          </Animated.ScrollView>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  detailsHeaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    zIndex: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsImageContainer: {
    height: height * 0.45,
    width: "100%",
    position: "relative",
  },
  detailsImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  detailsImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsGradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.2,
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  detailsTitleContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  detailsTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  detailsMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsMeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  detailsDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  favoriteButtonDetails: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsContentContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  detailsDescriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 10,
  },
  detailsDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4D5A76",
    marginBottom: 24,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  primaryActionButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gradientButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F0F4FF",
  },
  recommendationsContainer: {
    marginTop: 10,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 16,
  },
  recommendationsScroll: {
    paddingRight: 20,
  },
  recommendedItem: {
    width: width * 0.4,
    marginRight: 12,
  },
  recommendedImage: {
    width: "100%",
    height: width * 0.25,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 4,
  },
  recommendedDuration: {
    fontSize: 12,
    color: "#8F9BB3",
  },
  audioPlayerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6B8BFF",
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
  },
  playButton: {
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 4,
    marginHorizontal: 8,
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 12,
    width: 40,
    textAlign: "center",
    opacity: 0.8,
  },
  progressUpdatedFeedback: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 20,
  },
  progressUpdatedText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});

export default ActivityDetails;
