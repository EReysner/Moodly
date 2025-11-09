import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../utils/supabase";

export const useFriends = (userId) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const loadFriendsData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select(
          `
          id,
          status,
          created_at,
          user_id,
          friend_id,
          user:user_id(id, nombre, email, avatar_url),
          friend:friend_id(id, nombre, email, avatar_url)
        `
        )
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");

      if (friendsError) throw friendsError;

      const formattedFriends = friendsData.map((item) => {
        const isUserInitiator = item.user_id === userId;
        return {
          friendshipId: item.id,
          friendId: isUserInitiator ? item.friend_id : item.user_id,
          friendData: isUserInitiator ? item.friend : item.user,
          createdAt: item.created_at,
          isInitiator: isUserInitiator,
        };
      });

      setFriends(formattedFriends);

      const { data: requestsData, error: requestsError } = await supabase
        .from("friends")
        .select(
          `
          id,
          created_at,
          user_id,
          friend_id,
          sender:user_id(id, nombre, email, avatar_url)
        `
        )
        .eq("friend_id", userId)
        .eq("status", "pending");

      if (requestsError) throw requestsError;

      const formattedRequests = requestsData.map((request) => ({
        id: request.id,
        senderId: request.user_id,
        senderData: request.sender,
        createdAt: request.created_at,
      }));

      setFriendRequests(formattedRequests);
    } catch (err) {
      setError(err.message);
      console.error("Error loading friends data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getFriendIds = useCallback(() => {
    console.log("Obteniendo IDs de amigos...");
    console.log("Lista de amigos:", friends);
    return friends.map((friend) => friend.friendId);
  }, [friends]);

  const searchUsersFriends = useCallback(
    async (query) => {
      if (!query.trim() || !userId) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const friendIds = getFriendIds();
        const requestIds = friendRequests.map((req) => req.senderId);

        const allConnectedIds = [...friendIds, ...requestIds, userId];

        const { data, error } = await supabase
          .from("usuarios")
          .select("id, nombre, email, avatar_url")
          .or(`nombre.ilike.%${query}%,email.ilike.%${query}%`)
          .not("id", "in", `(${allConnectedIds.join(",")})`)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error searching users:", err);
      } finally {
        setSearchLoading(false);
      }
    },
    [userId, getFriendIds, friendRequests]
  );

  const sendFriendRequest = useCallback(
    async (friendId) => {
      if (!userId || !friendId) return;

      try {
        const { data: existing, error: existingError } = await supabase
          .from("friends")
          .select("id, status, user_id, friend_id")
          .or(
            `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
          )
          .single();

        if (existing) {
          if (existing.status === "pending") {
            if (existing.user_id === userId) {
              throw new Error("Ya has enviado una solicitud a este usuario");
            } else {
              throw new Error("Este usuario ya te ha enviado una solicitud");
            }
          }
          throw new Error("Ya son amigos con este usuario");
        }

        const { error } = await supabase.from("friends").insert([
          {
            user_id: userId,
            friend_id: friendId,
            status: "pending",
          },
        ]);

        if (error) throw error;

        await loadFriendsData();
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Error sending friend request:", err);
        return false;
      }
    },
    [userId, loadFriendsData]
  );

  const respondToRequest = useCallback(
    async (requestId, accept) => {
      try {
        if (accept) {
          const { error } = await supabase
            .from("friends")
            .update({ status: "accepted" })
            .eq("id", requestId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("friends")
            .delete()
            .eq("id", requestId);
          if (error) throw error;
        }

        await loadFriendsData();
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Error responding to friend request:", err);
        return false;
      }
    },
    [loadFriendsData]
  );

  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  return {
    friends, 
    friendRequests, 
    loading,
    error,
    searchUsersFriends,
    searchResults,
    searchLoading,
    sendFriendRequest,
    respondToRequest,
    loadFriendsData,
    getFriendIds, 
  };
};
