import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../utils/supabase";

export const useFriendProfile = (currentUserId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const loadProfile = useCallback(
    async (userId) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", userId)
          .single();

        if (userError) throw userError;

        setProfile(userData);

        if (userId === currentUserId) {
          setFriendshipStatus("self");
          return;
        }

        const { data: friendshipData, error: friendshipError } = await supabase
          .from("friends")
          .select("*")
          .or(
            `and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`
          );

        if (friendshipError) throw friendshipError;

        if (friendshipData.length > 0) {
          const friendship = friendshipData[0];
          if (friendship.status === "accepted") {
            setFriendshipStatus("friends");
          } else if (friendship.user_id === currentUserId) {
            setFriendshipStatus("request_sent");
          } else {
            setFriendshipStatus("request_received");
          }
        } else {
          setFriendshipStatus("not_friends");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId]
  );

  const sendFriendRequest = useCallback(
    async (friendId) => {
      if (!friendId || !currentUserId) return;

      setIsLoadingAction(true);
      try {
        const { data, error } = await supabase
          .from("friends")
          .insert([
            {
              user_id: currentUserId,
              friend_id: friendId,
              status: "pending",
            },
          ])
          .select();

        if (error) throw error;

        setFriendshipStatus("request_sent");
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Error sending friend request:", err);
        return false;
      } finally {
        setIsLoadingAction(false);
      }
    },
    [currentUserId]
  );

  const acceptFriendRequest = useCallback(
    async (friendId) => {
      if (!friendId || !currentUserId) return;

      setIsLoadingAction(true);
      try {
        const { data: requestData, error: findError } = await supabase
          .from("friends")
          .select("*")
          .eq("user_id", friendId)
          .eq("friend_id", currentUserId)
          .eq("status", "pending")
          .single();

        if (findError) throw findError;
        if (!requestData) throw new Error("Friend request not found");

        const { error: updateError } = await supabase
          .from("friends")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("id", requestData.id);

        if (updateError) throw updateError;

        setFriendshipStatus("friends");
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Error accepting friend request:", err);
        return false;
      } finally {
        setIsLoadingAction(false);
      }
    },
    [currentUserId]
  );

  const removeFriend = useCallback(
    async (friendId) => {
      if (!friendId || !currentUserId) return;

      setIsLoadingAction(true);
      try {
        const { data: friendshipData, error: findError } = await supabase
          .from("friends")
          .select("*")
          .or(
            `and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`
          );

        if (findError) throw findError;

        for (const friendship of friendshipData) {
          const { error: deleteError } = await supabase
            .from("friends")
            .delete()
            .eq("id", friendship.id);

          if (deleteError) throw deleteError;
        }

        setFriendshipStatus("not_friends");
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Error removing friend:", err);
        return false;
      } finally {
        setIsLoadingAction(false);
      }
    },
    [currentUserId]
  );

  return {
    profile,
    loading,
    error,
    friendshipStatus,
    isLoadingAction,
    loadProfile,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
  };
};
