import { supabase } from "./supabase";

export interface Activity {
  id: string;
  title: string;
  duration: string;
  description: string;
  image: string;
  progress?: number;
  audio_url?: string;
  category_id?: string;
  favorite?: boolean; 
  content?: string;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  tab_icon: string;
  color: string;
  activities?: Activity[];
}

export interface ActivityHistory {
  id: number;
  user_id: string;
  activity_id: string;
  progress: number;
  last_updated: string;
  activity_title?: string;
  activity_duration?: string;
  category_name?: string;
  content?: string;
}

export interface MoodEntry {
  id: string;
  mood_index: number;
  created_at: string;
}

export const fetchCategoriesWithActivities = async (
  userId?: string
): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        id,
        title,
        icon,
        tab_icon,
        color,
        activities(
          id,
          title,
          duration,
          description,
          image,
          audio_url,
          category_id,
          content
        )
      `
      )
      .order("id");

    if (error) throw error;

    if (!userId) return data || [];

    const { data: favorites, error: favError } = await supabase
      .from("user_favorites")
      .select("activity_id")
      .eq("user_id", userId);

    if (favError) throw favError;

    const favoriteIds = new Set(favorites?.map((fav) => fav.activity_id) || []);

    return (
      data?.map((category) => ({
        ...category,
        activities:
          category.activities?.map((activity) => ({
            ...activity,
            favorite: favoriteIds.has(activity.id),
          })) || [],
      })) || []
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const fetchUserProgress = async (
  userId: string
): Promise<Record<string, number>> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("user_activity_progress")
      .select("activity_id, progress, last_updated")
      .eq("user_id", userId)
      .gte("last_updated", today.toISOString());

    if (error) throw error;

    return (
      data?.reduce((acc, item) => {
        acc[item.activity_id] = item.progress;
        return acc;
      }, {} as Record<string, number>) || {}
    );
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return {};
  }
};

export const fetchUserActivityHistory = async (
  userId: string
): Promise<ActivityHistory[]> => {
  try {
    const { data, error } = await supabase
      .from("user_activity_progress")
      .select(
        `
        id,
        user_id,
        activity_id,
        progress,
        last_updated,
        activities:activity_id(
          title, 
          duration, 
          category_id,
          categories:category_id(
            title
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("last_updated", { ascending: false });

    if (error) throw error;

    const transformedData =
      data?.map((item) => ({
        ...item,
        activity_title: item.activities?.title,
        activity_duration: item.activities?.duration,
        category_name: item.activities?.categories?.title,
      })) || [];

    return transformedData;
  } catch (error) {
    console.error("Error fetching user activity history:", error);
    return [];
  }
};

export const toggleFavoriteActivity = async (
  userId: string,
  activityId: string,
  isCurrentlyFavorite: boolean
): Promise<boolean> => {
  try {
    if (isCurrentlyFavorite) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("activity_id", activityId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_favorites")
        .insert({ user_id: userId, activity_id: activityId });
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return false;
  }
};

export const updateUserActivityProgress = async (
  userId: string,
  activityId: string,
  progress: number
) => {
  try {
    const { error } = await supabase.from("user_activity_progress").upsert(
      {
        user_id: userId,
        activity_id: activityId,
        progress: Math.min(100, Math.max(0, progress)),
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: "user_id,activity_id",
      }
    );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating progress:", error);
    return false;
  }
};

export const saveMoodEntry = async (
  userId: string,
  moodIndex: number
): Promise<boolean> => {
  try {
    const { error } = await supabase.from("user_mood_history").insert({
      user_id: userId,
      mood_index: moodIndex,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving mood entry:", error);
    return false;
  }
};

export const getTodaysMood = async (userId: string): Promise<number | null> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("user_mood_history")
      .select("mood_index")
      .eq("user_id", userId)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
      .maybeSingle();
    console.log("datamood: ", data);

    if (error) throw error;
    return data?.mood_index ?? null;
  } catch (error) {
    console.error("Error fetching today's mood:", error);
    return null;
  }
};

export const getMoodHistory = async (userId: string): Promise<MoodEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("user_mood_history")
      .select("id, mood_index, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching mood history:", error);
    return [];
  }
};
