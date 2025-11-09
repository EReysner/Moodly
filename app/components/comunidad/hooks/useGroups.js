import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../utils/supabase";
import { Alert } from "react-native";

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  const fetchAvailableUsers = async (friendsList) => {
    console.log("Fetching available users with friendsList:", friendsList);
    try {
      if (friendsList && friendsList.length > 0) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .in("id", friendsList);
        console.log("Available users data:", data);

        if (error) throw error;
        return data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching available users:", error);
      return [];
    }
  };

  const searchUsers = useCallback((query, users) => {
    if (!query.trim()) return users;

    const lowerQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.nombre?.toLowerCase().includes(lowerQuery) ||
        user.email?.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const checkExistingMember = useCallback(async (groupId, userId) => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return !!data; 
    } catch (err) {
      console.error("Error checking existing member:", err);
      return false;
    }
  }, []);

  const createGroup = useCallback(
    async (name, description, userId, members) => {
      console.log("Creating group:", { name, description, userId, members });
      if (!name || !userId) {
        console.error("Missing required fields for group creation");
        return null;
      }

      setLoading(true);
      let newGroup = null;

      try {
        const { data: group, error: groupError } = await supabase
          .from("groups")
          .insert({
            name,
            description,
            created_by: userId,
          })
          .select()
          .single();

        if (groupError) {
          console.error("Error creating group:", groupError);
          throw groupError;
        }

        console.log("Group created successfully:", group);
        newGroup = group;

        const { error: creatorError } = await supabase
          .from("group_members")
          .insert({
            group_id: group.id,
            user_id: userId,
            is_admin: true,
          });

        if (creatorError) {
          console.error("Error adding creator to group:", creatorError);
          throw creatorError;
        }

        console.log("Creator added to group successfully");

        if (members && members.length > 0) {
          console.log(`Adding ${members.length} members to group ${group.id}`);

          let successCount = 0;
          let failCount = 0;

          for (const memberId of members) {
            console.log(
              `Attempting to add member ${memberId} to group ${group.id}`
            );

            const isMember = await checkExistingMember(group.id, memberId);
            if (isMember) {
              console.log(`Member ${memberId} is already in the group`);
              failCount++;
              continue;
            }

            const { error: memberError } = await supabase
              .from("group_members")
              .insert({
                group_id: group.id,
                user_id: memberId,
                is_admin: false,
              });

            if (memberError) {
              console.error(`Error adding member ${memberId}:`, memberError);
              failCount++;
            } else {
              console.log(`Member ${memberId} added successfully`);
              successCount++;
            }
          }

          console.log(
            `Added ${successCount} members successfully, ${failCount} failed`
          );
        }

        return newGroup;
      } catch (err) {
        console.error("Group creation process failed:", err.message);

        if (newGroup) {
          console.log("Returning group despite member addition errors");
          return newGroup;
        }

        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [checkExistingMember]
  );

  const fetchUserGroups = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          group_id,
          is_admin,
          groups:group_id(
            id,
            name,
            description,
            created_at,
            avatar_url,
            created_by
          )
        `
        )
        .eq("user_id", userId);

      if (error) throw error;

      const formattedGroups = data.map((item) => ({
        ...item.groups,
        is_admin: item.is_admin,
      }));

      setUserGroups(formattedGroups);
      return formattedGroups;
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", "No se pudieron cargar tus grupos");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveGroup = useCallback(async (groupId, userId) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (error) throw error;

      setUserGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== groupId)
      );

      return true;
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", "No pudiste salir del grupo");
      return false;
    }
  }, []);

  const fetchGroupMessages = useCallback(async (groupId) => {
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          group_id,
          user:user_id(id, nombre, avatar_url)
        `
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
      return [];
    }
  }, []);

  const sendGroupMessage = useCallback(async (groupId, userId, message) => {
    try {
      const { error } = await supabase.from("group_messages").insert({
        group_id: groupId,
        user_id: userId,
        content: message,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      return false;
    }
  }, []);

  const fetchGroupMembers = useCallback(async (groupId) => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          user_id,
          is_admin,
          usuario:user_id(id, nombre, email, avatar_url)
        `
        )
        .eq("group_id", groupId);

      if (error) throw error;

      const formattedMembers = data.map((item) => ({
        ...item.usuario,
        is_admin: item.is_admin,
      }));

      return formattedMembers;
    } catch (err) {
      console.error("Error al cargar miembros:", err);
      return [];
    }
  }, []);

  return {
    groups,
    userGroups,
    loading,
    error,
    availableUsers,
    fetchAvailableUsers,
    searchUsers,
    createGroup,
    fetchUserGroups,
    leaveGroup,
    fetchGroupMessages,
    sendGroupMessage,
    fetchGroupMembers,
  };
};
