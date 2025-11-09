import { useState, useEffect } from "react";
import {
  fetchCategoriesWithActivities,
  fetchUserProgress,
  fetchUserActivityHistory,
  toggleFavoriteActivity,
  updateUserActivityProgress,
  saveMoodEntry,
  getTodaysMood,
  getMoodHistory,
  Activity,
  Category,
  ActivityHistory,
  MoodEntry,
} from "../../../utils/obtenerDatosSupabase";
import { supabase } from "@/app/utils/supabase";

export const useActivities = () => {
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [dailyProgress, setDailyProgress] = useState({
    completed: 0,
    goal: 3,
    lastUpdated: new Date().toDateString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAndResetDailyProgress = () => {
    const today = new Date().toDateString();
    if (dailyProgress.lastUpdated !== today) {
      setDailyProgress({
        completed: 0,
        goal: 3,
        lastUpdated: today,
      });
      setUserProgress({});
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          activities:
            category.activities?.map((activity) => ({
              ...activity,
              progress: 0,
              content: activity.content,
            })) || [],
        }))
      );
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      checkAndResetDailyProgress();

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const [
          categoriesData,
          progressData,
          historyData,
          moodData,
          moodHistoryData,
        ] = await Promise.all([
          fetchCategoriesWithActivities(authUser.id),
          fetchUserProgress(authUser.id),
          fetchUserActivityHistory(authUser.id),
          getTodaysMood(authUser.id),
          getMoodHistory(authUser.id),
        ]);

        setTodayMood(moodData);
        setMoodHistory(moodHistoryData);

        const today = new Date().toDateString();
        const completedToday = historyData.filter((item) => {
          const itemDate = new Date(item.last_updated).toDateString();
          return item.progress >= 100 && itemDate === today;
        }).length;

        setDailyProgress({
          completed: completedToday,
          goal: 3,
          lastUpdated: today,
        });
        setActivityHistory(historyData);

        const enrichedCategories = categoriesData.map((category) => ({
          ...category,
          tabIcon: category.tab_icon,
          activities:
            category.activities?.map((activity) => ({
              ...activity,
              progress: progressData[activity.id] || 0,
            })) || [],
        }));

        setCategories(enrichedCategories);
        setUserProgress(progressData);
      }
    } catch (err) {
      setError("Error al cargar los datos");
      console.error("Error in loadData:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDailyMood = async (moodIndex: number) => {
    if (!user) return false;

    try {
      const success = await saveMoodEntry(user.id, moodIndex);
      if (success) {
        setTodayMood(moodIndex);
        const updatedHistory = await getMoodHistory(user.id);
        setMoodHistory(updatedHistory);
      }
      return success;
    } catch (error) {
      console.error("Error saving mood:", error);
      return false;
    }
  };

  const handleToggleFavorite = async (
    activityId: string,
    isFavorite: boolean
  ) => {
    if (!user) return false;

    try {
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          activities:
            category.activities?.map((activity) =>
              activity.id === activityId
                ? { ...activity, favorite: !isFavorite }
                : activity
            ) || [],
        }))
      );

      const success = await toggleFavoriteActivity(
        user.id,
        activityId,
        isFavorite
      );

      if (!success) {
        setCategories((prev) =>
          prev.map((category) => ({
            ...category,
            activities:
              category.activities?.map((activity) =>
                activity.id === activityId
                  ? { ...activity, favorite: isFavorite }
                  : activity
              ) || [],
          }))
        );
      }

      return success;
    } catch (error) {
      console.error("Error in handleToggleFavorite:", error);
      return false;
    }
  };

  const updateProgress = async (activityId: string, progress: number) => {
    try {
      if (!user) return false;

      const clampedProgress = Math.min(100, Math.max(0, progress));
      const wasCompleted = userProgress[activityId] >= 100;
      const nowCompleted = clampedProgress >= 100;
      const today = new Date().toDateString();

      if (dailyProgress.lastUpdated === today || nowCompleted) {
        const success = await updateUserActivityProgress(
          user.id,
          activityId,
          clampedProgress
        );

        if (success) {
          setUserProgress((prev) => ({
            ...prev,
            [activityId]: clampedProgress,
          }));
          setCategories((prev) =>
            prev.map((category) => ({
              ...category,
              activities:
                category.activities?.map((a) =>
                  a.id === activityId ? { ...a, progress: clampedProgress } : a
                ) || [],
            }))
          );

          if (!wasCompleted && nowCompleted) {
            setDailyProgress((prev) => ({
              ...prev,
              completed: prev.completed + 1,
              lastUpdated: today,
            }));

            const newHistoryItem = {
              id: Date.now(),
              user_id: user.id,
              activity_id: activityId,
              progress: clampedProgress,
              last_updated: new Date().toISOString(),
              activity_title: categories
                .flatMap((c) => c.activities || [])
                .find((a) => a.id === activityId)?.title,
              activity_duration: categories
                .flatMap((c) => c.activities || [])
                .find((a) => a.id === activityId)?.duration,
              category_name: categories.find((c) =>
                c.activities?.some((a) => a.id === activityId)
              )?.title,
            };

            setActivityHistory((prev) => [newHistoryItem, ...prev]);
          } else if (wasCompleted && !nowCompleted) {
            setDailyProgress((prev) => ({
              ...prev,
              completed: Math.max(0, prev.completed - 1),
              lastUpdated: today,
            }));
          }

          const updatedHistory = await fetchUserActivityHistory(user.id);
          setActivityHistory(updatedHistory);
        }
        return success;
      }
      return false;
    } catch (err) {
      console.error("Error in updateProgress:", err);
      return false;
    }
  };

  useEffect(() => {
    const today = new Date().toDateString();
    if (dailyProgress.lastUpdated !== today) {
      checkAndResetDailyProgress();
    }
  }, [dailyProgress.lastUpdated]);

  useEffect(() => {
    loadData();
  }, []);

  return {
    categories,
    userProgress,
    dailyProgress,
    activityHistory,
    moodHistory,
    todayMood,
    isLoading,
    error,
    toggleFavoriteActivity: handleToggleFavorite,
    updateProgress,
    saveDailyMood,
    refresh: loadData,
    user,
  };
};
