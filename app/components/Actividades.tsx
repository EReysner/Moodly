import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from "react-native-reanimated";
import { useActivities } from "./activities/hooks/useActivities";
import { Activity } from "../utils/obtenerDatosSupabase";

import ActivityCard from "./activities/ActivityCard";
import ActivityDetails from "./activities/ActivityDetails";
import EmptyState from "./activities/EmptyState";
import LoadingSkeleton from "./activities/LoadingSkeleton";
import CategoryTabs from "./activities/CategoryTabs";
import ProgressTracker from "./activities/ProgressTracker";
import MoodTracker from "./activities/MoodTracker";
import FeaturedBanner from "./activities/FeaturedBanner";

const { width } = Dimensions.get("window");

const Actividades = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("1");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showSearch, setShowSearch] = useState(false);
  const searchHeight = useSharedValue(0);

  const {
    categories,
    dailyProgress,
    isLoading,
    error,
    toggleFavoriteActivity,
    activityHistory,
    updateProgress,
    refresh,
    user,
    todayMood,
    moodHistory,
    saveDailyMood,
  } = useActivities();

  const handleActivityPress = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const filterActivities = () => {
    const currentCategory = categories.find((cat) => cat.id === activeCategory);
    if (!currentCategory?.activities) return [];

    let activities = [...currentCategory.activities];

    if (searchQuery) {
      activities = activities.filter((activity) =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return activities.sort((a, b) => {
      if (a.favorite === b.favorite) {
        return a.title.localeCompare(b.title);
      }
      return a.favorite ? -1 : 1;
    });
  };

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    height: searchHeight.value,
    opacity: searchHeight.value > 0 ? 1 : 0,
  }));

  const toggleSearch = () => {
    if (showSearch) {
      searchHeight.value = withTiming(0);
      setShowSearch(false);
      setSearchQuery("");
    } else {
      setShowSearch(true);
      searchHeight.value = withTiming(60);
    }
  };

  const currentCategory = categories.find((cat) => cat.id === activeCategory);
  const filteredActivities = filterActivities();

  if (selectedActivity && currentCategory) {
    return (
      <ActivityDetails
        activity={selectedActivity}
        currentCategory={currentCategory}
        onClose={() => setSelectedActivity(null)}
        updateProgress={updateProgress}
      />
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={styles.header}>
        <Text style={styles.headerTitle}>Moodly</Text>
        <Text style={styles.headerSubtitle}>Cuida tu bienestar emocional</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleSearch}>
            <Ionicons name="search-outline" size={22} color="#2E3A59" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={22} color="#2E3A59" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.searchContainerWrapper, searchAnimatedStyle]}
      >
        {showSearch && (
          <Animated.View
            style={styles.searchContainer}
            entering={FadeIn.duration(300)}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#A0A0A0"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={
                currentCategory
                  ? `Buscar en ${currentCategory.title.toLowerCase()}...`
                  : "Buscar..."
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A0A0A0"
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        )}
      </Animated.View>

      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          setSearchQuery={setSearchQuery}
        />
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentCategory && (
            <FeaturedBanner currentCategory={currentCategory} />
          )}

          <ProgressTracker
            completedActivities={dailyProgress.completed}
            totalActivities={dailyProgress.goal}
            activityHistory={activityHistory}
          />

          <MoodTracker
            todayMood={todayMood}
            moodHistory={moodHistory}
            saveDailyMood={saveDailyMood}
          />

          <View style={styles.listHeaderContainer}>
            <Text style={styles.listHeaderTitle}>
              {searchQuery ? "Resultados" : "Actividades recomendadas"}
            </Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver todas</Text>
              <Ionicons name="chevron-forward" size={16} color="#6B8BFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  toggleFavorite={() => {
                    if (!user) {
                      Alert.alert(
                        "Inicia sesión",
                        "Debes iniciar sesión para guardar favoritos",
                        [{ text: "OK" }]
                      );
                      return;
                    }
                    toggleFavoriteActivity(activity.id, activity.favorite);
                  }}
                  onPress={() => handleActivityPress(activity)}
                  index={index}
                />
              ))
            ) : (
              <EmptyState setSearchQuery={setSearchQuery} />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E3A59",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8F9BB3",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    position: "absolute",
    right: 20,
    top: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  searchContainerWrapper: {
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2E3A59",
    padding: 0,
    height: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#6B8BFF",
    marginRight: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: "white",
    fontSize: 16,
  },
});

export default Actividades;
