import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  FlatList,
  Modal,
  StatusBar,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import UserProfileModal from "./comunidad/components/UserProfileModal";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useCommunity } from "./comunidad/hooks/useCommunity";
import { useGroups } from "./comunidad/hooks/useGroups";
import { useFriends } from "./comunidad/hooks/useFriends";
import { useFriendProfile } from "./comunidad/hooks/useFriendProfile";
const { width } = Dimensions.get("window");

const AddFriendsModal = ({
  visible,
  onClose,
  friendSearchQuery,
  setFriendSearchQuery,
  searchUsersFriends,
  searchLoading,
  searchResults,
  renderUserSearchResult,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.usersModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Añadir amigos</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#8F9BB3" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#A0A0A0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o email"
              value={friendSearchQuery}
              onChangeText={(text) => {
                setFriendSearchQuery(text);
                if (text.length >= 3) {
                  searchUsersFriends(text);
                } else {
                  searchUsersFriends("");
                }
              }}
              placeholderTextColor="#A0A0A0"
              autoFocus
              returnKeyType="search"
            />
          </View>

          {searchLoading ? (
            <ActivityIndicator size="large" color="#6B8BFF" />
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderUserSearchResult}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#8F9BB3" />
              <Text style={styles.emptyText}>
                {friendSearchQuery
                  ? "No se encontraron usuarios"
                  : "Busca amigos por nombre o email"}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  </Modal>
);

const Comunidad = ({ user }) => {
  console.log("User object:", user);
  const [activeTab, setActiveTab] = useState("posts");
  const [showComments, setShowComments] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newGroupMessage, setNewGroupMessage] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchText, setSearchText] = useState("");

  const messagesListRef = useRef(null);

  const {
    posts,
    loading,
    error,
    addPost,
    addComment,
    likePost,
    fetchPosts,
    fetchComments,
    fetchCommentCounts,
  } = useCommunity();

  const {
    userGroups,
    loading: loadingGroups,
    error: groupsError,
    availableUsers,
    searchUsers,
    fetchAvailableUsers,
    createGroup,
    fetchUserGroups,
    leaveGroup,
    fetchGroupMessages,
    sendGroupMessage,
    fetchGroupMembers,
  } = useGroups();

  const {
    friends,
    getFriendIds,
    friendRequests,
    loading: loadingFriends,
    searchUsersFriends,
    searchResults,
    searchLoading,
    sendFriendRequest,
    respondToRequest,
    loadFriendsData,
  } = useFriends(user?.id);

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    friendshipStatus,
    isLoadingAction,
    loadProfile,
    sendFriendRequest: sendProfileFriendRequest,
    acceptFriendRequest,
    removeFriend,
  } = useFriendProfile(user?.id);

  const getUserAvatar = useCallback(() => {
    const userPost = posts?.find(
      (post) => post.user_id === user.id && post.user?.avatar_url
    );

    if (userPost && userPost.user.avatar_url) {
      return userPost.user.avatar_url;
    }

    return "https://i.imgur.com/mCHMpLT.png";
  }, [posts]);

  const loadPosts = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPosts();
    } finally {
      setRefreshing(false);
    }
  }, [fetchPosts]);

  const loadPostComments = useCallback(
    async (postId) => {
      try {
        const comments = await fetchComments(postId);
        setPostComments(comments);
      } catch (err) {
        Alert.alert("Error", "No se pudieron cargar los comentarios");
      }
    },
    [fetchComments]
  );

  const loadGroupMessages = useCallback(
    async (groupId) => {
      if (!groupId) return;

      setLoadingMessages(true);
      try {
        const messages = await fetchGroupMessages(groupId);
        setGroupMessages(
          messages.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
        );
      } catch (err) {
        Alert.alert("Error", "No se pudieron cargar los mensajes del grupo");
      } finally {
        setLoadingMessages(false);
      }
    },
    [fetchGroupMessages]
  );

  const loadGroupMembers = useCallback(
    async (groupId) => {
      if (!groupId) return;

      setLoadingMembers(true);
      try {
        const members = await fetchGroupMembers(groupId);
        setGroupMembers(members);
      } catch (err) {
        Alert.alert("Error", "No se pudieron cargar los miembros del grupo");
      } finally {
        setLoadingMembers(false);
      }
    },
    [fetchGroupMembers]
  );

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      loadPostComments(selectedPost.id);
    }
  }, [selectedPost]);

  useEffect(() => {
    const loadCommentCounts = async () => {
      if (posts && posts.length > 0) {
        const counts = await fetchCommentCounts();
        setCommentCounts(counts);
      }
    };

    loadCommentCounts();
  }, [posts]);

  useEffect(() => {
    if (showNewGroupModal) {
      const loadUsers = async () => {
        console.log("friends:", friends);
        const friendIds = getFriendIds();
        console.log("Friend IDs:", friendIds);
        const users = await fetchAvailableUsers(friendIds);
        setFilteredUsers(users);
      };
      loadUsers();
    }
  }, [showNewGroupModal, friends]);

  useEffect(() => {
    const result = searchUsers(searchQuery, availableUsers);
    setFilteredUsers(Array.isArray(result) ? result : []);
  }, [searchQuery, availableUsers]);

  useEffect(() => {
    if (activeTab === "chats" && user) {
      fetchUserGroups(user.id);
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (selectedGroup && showGroupChatModal) {
      loadGroupMessages(selectedGroup.id);
    }
  }, [selectedGroup, showGroupChatModal]);

  useEffect(() => {
    if (selectedGroup && showGroupMembersModal) {
      loadGroupMembers(selectedGroup.id);
    }
  }, [selectedGroup, showGroupMembersModal]);

  const handleSearch = (text) => {
    setSearchText(text);
  };
  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;

    try {
      await addPost(newPostText, user.id);
      setShowNewPostModal(false);
      setNewPostText("");
      await loadPosts();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la publicación");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      await addComment(selectedPost.id, newComment, user.id);
      setNewComment("");
      await loadPostComments(selectedPost.id);
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el comentario");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await likePost(postId, user.id);
      await loadPosts();
    } catch (error) {
      Alert.alert("Error", "No se pudo dar like al post");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length < 1) {
      Alert.alert(
        "Datos incompletos",
        "Debes ingresar un nombre y seleccionar al menos 1 miembro"
      );
      return;
    }

    try {
      const newGroup = await createGroup(
        groupName,
        groupDescription,
        user.id,
        selectedUsers
      );

      if (newGroup) {
        await fetchUserGroups(user.id);

        Alert.alert(
          "Grupo creado",
          `"${groupName}" creado con ${selectedUsers.length + 1} miembros`
        );

        setShowNewGroupModal(false);
        setGroupName("");
        setGroupDescription("");
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error("Error al crear grupo:", error);

      if (error.message && error.message.includes("duplicate key value")) {
        Alert.alert(
          "Error",
          "Hubo un problema al agregar algunos miembros al grupo. El grupo se creó, pero puede que no todos los miembros se hayan añadido correctamente."
        );

        setShowNewGroupModal(false);
        setGroupName("");
        setGroupDescription("");
        setSelectedUsers([]);

        await fetchUserGroups(user.id);
      } else {
        Alert.alert("Error", "No se pudo crear el grupo");
      }
    }
  };

  const handleSendGroupMessage = async () => {
    if (!newGroupMessage.trim() || !selectedGroup) return;

    try {
      await sendGroupMessage(selectedGroup.id, user.id, newGroupMessage);
      setNewGroupMessage("");
      await loadGroupMessages(selectedGroup.id);
      setTimeout(() => {
        messagesListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el mensaje");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    Alert.alert(
      "Salir del grupo",
      "¿Estás seguro de que quieres salir de este grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            const success = await leaveGroup(groupId, user.id);
            if (success) {
              await fetchUserGroups(user.id);
            }
          },
        },
      ]
    );
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendFriendRequest = async (friendId) => {
    const success = await sendFriendRequest(friendId);
    if (success) {
      Alert.alert(
        "Solicitud enviada",
        "Tu solicitud de amistad ha sido enviada"
      );
      setFriendSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleRespondToRequest = async (requestId, accept) => {
    const success = await respondToRequest(requestId, accept);
    if (success) {
      Alert.alert(
        accept ? "Solicitud aceptada" : "Solicitud rechazada",
        accept ? "Ahora son amigos" : "Solicitud rechazada"
      );
    }
  };

  const handleUserSelect = async (userId) => {
    setSelectedUserId(userId);
    await loadProfile(userId);
    setShowProfileModal(true);
  };

  const renderPost = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={styles.postCard}
        entering={FadeInDown.duration(400).delay(index * 100)}
      >
        <View style={styles.postHeader}>
          <TouchableOpacity onPress={() => handleUserSelect(item.user_id)}>
            <Image
              source={{
                uri: item.user?.avatar_url || "https://i.imgur.com/mCHMpLT.png",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.postUserInfo}>
            <TouchableOpacity onPress={() => handleUserSelect(item.user_id)}>
              <Text style={styles.userName}>
                {item.user?.nombre || "Usuario"}
              </Text>
            </TouchableOpacity>
            <View style={styles.moodTimeContainer}>
              <Ionicons name="time-outline" size={14} color="#8F9BB3" />
              <Text style={styles.postTime}>
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => handleLikePost(item.id)}
          >
            <Ionicons
              name={item.likes?.includes(user.id) ? "heart" : "heart-outline"}
              size={20}
              color={item.likes?.includes(user.id) ? "#FF3B30" : "#8F9BB3"}
            />
            <Text style={styles.actionText}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedPost(item);
              setShowComments(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#8F9BB3" />
            <Text style={styles.actionText}>{commentCounts[item.id] || 0}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    ),
    [user.id, commentCounts]
  );

  const renderComment = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={styles.commentCard}
        entering={FadeIn.duration(300).delay(index * 50)}
      >
        <Image
          source={{
            uri: item.user?.avatar_url || "https://i.imgur.com/mCHMpLT.png",
          }}
          style={styles.smallAvatar}
        />
        <View style={styles.commentContent}>
          <Text style={styles.commentName}>
            {item.user?.nombre || "Usuario"}
          </Text>
          <Text style={styles.commentText}>{item.content}</Text>
          <View style={styles.commentFooter}>
            <Text style={styles.commentTime}>
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </Animated.View>
    ),
    []
  );

  const renderUserItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleUserSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.userAvatarContainer}>
          <Image
            source={{
              uri: item.avatar_url || "https://i.imgur.com/mCHMpLT.png",
            }}
            style={styles.smallAvatar}
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.mutualFriends}>{item.email}</Text>
        </View>

        {selectedUsers.includes(item.id) ? (
          <Ionicons name="checkbox" size={24} color="#6B8BFF" />
        ) : (
          <Ionicons name="square-outline" size={24} color="#E4E9F2" />
        )}
      </TouchableOpacity>
    ),
    [selectedUsers]
  );

  const renderGroupItem = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={styles.groupCard}
        entering={FadeInDown.duration(400).delay(index * 100)}
      >
        <View style={styles.groupCardHeader}>
          <Image
            source={{
              uri: item.avatar_url || "https://i.imgur.com/mCHMpLT.png",
            }}
            style={styles.groupAvatar}
          />
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupMembers}>
              {item.is_admin ? "Administrador • " : ""}
              Creado el {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.groupOptionsButton}
            onPress={() => handleLeaveGroup(item.id)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#8F9BB3" />
          </TouchableOpacity>
        </View>

        {item.description && (
          <Text style={styles.groupDescription}>{item.description}</Text>
        )}

        <View style={styles.groupActions}>
          <TouchableOpacity
            style={styles.groupActionButton}
            onPress={() => {
              setSelectedGroup(item);
              setShowGroupChatModal(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6B8BFF" />
            <Text style={styles.groupActionText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.groupActionButton}
            onPress={() => {
              setSelectedGroup(item);
              setShowGroupMembersModal(true);
            }}
          >
            <Ionicons name="people-outline" size={20} color="#6B8BFF" />
            <Text style={styles.groupActionText}>Miembros</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    ),
    []
  );

  const renderGroupMessage = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={[
          styles.messageCard,
          item.user_id === user.id ? styles.userMessage : styles.otherMessage,
        ]}
        entering={FadeIn.duration(300).delay(index * 50)}
      >
        {item.user_id !== user.id && (
          <Image
            source={{
              uri: item.user?.avatar_url || "https://i.imgur.com/mCHMpLT.png",
            }}
            style={styles.messageAvatar}
          />
        )}

        <View
          style={[
            styles.messageContent,
            item.user_id === user.id
              ? styles.userMessageContent
              : styles.otherMessageContent,
          ]}
        >
          {item.user_id !== user.id && (
            <Text style={styles.messageName}>
              {item.user?.nombre || "Usuario"}
            </Text>
          )}

          <Text style={styles.messageText}>{item.content}</Text>

          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Animated.View>
    ),
    [user.id]
  );

  const renderGroupMember = useCallback(
    ({ item }) => (
      <View style={styles.memberItem}>
        <Image
          source={{
            uri: item.avatar_url || "https://i.imgur.com/mCHMpLT.png",
          }}
          style={styles.smallAvatar}
        />

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.nombre || "Usuario"}</Text>
          <Text style={styles.memberRole}>
            {item.is_admin ? "Administrador" : "Miembro"}
          </Text>
        </View>

        {item.id === user.id ? (
          <Text style={styles.currentUserLabel}>Tú</Text>
        ) : (
          <TouchableOpacity style={styles.memberAction}>
            <Ionicons name="chatbubble-outline" size={22} color="#6B8BFF" />
          </TouchableOpacity>
        )}
      </View>
    ),
    [user.id]
  );

  const renderUserSearchResult = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleSendFriendRequest(item.id)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.avatar_url || "https://i.imgur.com/mCHMpLT.png" }}
          style={styles.smallAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <Ionicons name="person-add-outline" size={24} color="#6B8BFF" />
      </TouchableOpacity>
    ),
    []
  );

  const renderFriendRequest = useCallback(
    ({ item }) => (
      <View style={styles.friendRequestItem}>
        <Image
          source={{
            uri:
              item.senderData.avatar_url || "https://i.imgur.com/mCHMpLT.png",
          }}
          style={styles.smallAvatar}
        />
        <View style={styles.friendRequestInfo}>
          <Text style={styles.userName}>{item.senderData.nombre}</Text>
          <Text style={styles.requestText}>Quiere ser tu amigo</Text>
          <Text style={styles.requestTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.friendRequestActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleRespondToRequest(item.id, true)}
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRespondToRequest(item.id, false)}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    []
  );

  const NotificationsModal = () => (
    <Modal
      visible={showNotifications}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowNotifications(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.usersModal, { height: "50%" }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Solicitudes de amistad</Text>
            <TouchableOpacity
              onPress={() => setShowNotifications(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#8F9BB3" />
            </TouchableOpacity>
          </View>
          {loadingFriends ? (
            <ActivityIndicator size="large" color="#6B8BFF" />
          ) : friendRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={48} color="#8F9BB3" />
              <Text style={styles.emptyText}>
                No tienes solicitudes pendientes
              </Text>
            </View>
          ) : (
            <FlatList
              data={friendRequests}
              renderItem={renderFriendRequest}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        {showSearchInput ? (
          <View style={styles.searchInputContainer}>
            <TouchableOpacity
              onPress={() => setShowSearchInput(false)}
              style={styles.searchBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#6B8BFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInputExpanded}
              placeholder="Buscar en la comunidad..."
              placeholderTextColor="#8F9BB3"
              value={searchText}
              onChangeText={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {searchText ? (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                style={styles.searchClearButton}
              >
                <Ionicons name="close-circle" size={20} color="#C5CEE0" />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>Comunidad</Text>
            <Text style={styles.headerSubtitle}>Conecta con otros</Text>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowSearchInput(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={22} color="#2E3A59" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowAddFriendsModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="person-add-outline" size={22} color="#2E3A59" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowNotifications(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#2E3A59"
                />
                {friendRequests.length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {friendRequests.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "posts" && styles.activeTab]}
          onPress={() => setActiveTab("posts")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "posts" && styles.activeTabText,
            ]}
          >
            Publicaciones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "chats" && styles.activeTab]}
          onPress={() => setActiveTab("chats")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "chats" && styles.activeTabText,
            ]}
          >
            Mensajes
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === "posts" ? (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadPosts}
              colors={["#6B8BFF"]}
              tintColor="#6B8BFF"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setShowNewPostModal(true)}
            activeOpacity={0.7}
          >
            <Image
              source={{
                uri: getUserAvatar(),
              }}
              style={styles.smallAvatar}
            />
            <Text style={styles.createPostText}>¿Cómo te sientes hoy?</Text>
          </TouchableOpacity>

          {loading && posts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B8BFF" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error al cargar publicaciones
              </Text>
              <TouchableOpacity onPress={loadPosts}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay publicaciones aún</Text>
              <Text style={styles.emptySubtext}>
                Sé el primero en compartir algo con la comunidad
              </Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={loadingGroups}
              onRefresh={() => fetchUserGroups(user.id)}
              colors={["#6B8BFF"]}
              tintColor="#6B8BFF"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <TouchableOpacity
            style={styles.groupButton}
            onPress={() => setShowNewGroupModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.groupIcon}>
              <Ionicons name="people-outline" size={24} color="#6B8BFF" />
            </View>
            <Text style={styles.groupButtonText}>Crear nuevo grupo</Text>
          </TouchableOpacity>

          {loadingGroups && userGroups.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B8BFF" />
            </View>
          ) : groupsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error al cargar tus grupos</Text>
              <TouchableOpacity onPress={() => fetchUserGroups(user.id)}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : userGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={50} color="#DFE3EB" />
              <Text style={styles.emptyText}>No perteneces a ningún grupo</Text>
              <Text style={styles.emptySubtext}>
                Crea un grupo nuevo o pide a alguien que te invite
              </Text>
            </View>
          ) : (
            <FlatList
              data={userGroups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </ScrollView>
      )}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComments(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.commentsModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comentarios</Text>
                <TouchableOpacity
                  onPress={() => setShowComments(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#8F9BB3" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={postComments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.commentsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={styles.noCommentsText}>
                    No hay comentarios aún
                  </Text>
                }
              />

              <View style={styles.commentInputContainer}>
                <Image
                  source={{
                    uri: user.avatar_url || "https://i.imgur.com/mCHMpLT.png",
                  }}
                  style={styles.smallAvatar}
                />
                <TextInput
                  style={styles.commentInput}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor="#A0A0A0"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleAddComment}
                />
                <TouchableOpacity
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="send"
                    size={24}
                    color={newComment.trim() ? "#6B8BFF" : "#C5CEE0"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={showNewGroupModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewGroupModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.groupModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Crear grupo</Text>
                <TouchableOpacity
                  onPress={() => setShowNewGroupModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#8F9BB3" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.groupNameInput}
                placeholder="Nombre del grupo"
                placeholderTextColor="#A0A0A0"
                value={groupName}
                onChangeText={setGroupName}
                returnKeyType="next"
              />

              <TextInput
                style={styles.groupDescriptionInput}
                placeholder="Descripción (opcional)"
                placeholderTextColor="#A0A0A0"
                value={groupDescription}
                onChangeText={setGroupDescription}
                returnKeyType="next"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.sectionTitle}>
                Seleccionar miembros ({selectedUsers.length})
              </Text>

              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#A0A0A0" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar usuarios..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#6B8BFF"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <FlatList
                  data={filteredUsers.filter((u) => u.id !== user.id)} 
                  renderItem={renderUserItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.groupUsersList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="people" size={40} color="#DFE3EB" />
                      <Text style={styles.emptyListText}>
                        {searchQuery
                          ? "No se encontraron amigos"
                          : "No tienes amigos agregados aún"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowNewGroupModal(false);
                          setShowAddFriendsModal(true);
                        }}
                        style={styles.addFriendsButton}
                      >
                        <Text style={styles.addFriendsButtonText}>
                          Añadir amigos
                        </Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              )}

              <TouchableOpacity
                style={[
                  styles.createGroupButton,
                  !groupName && styles.disabledButton,
                ]}
                onPress={handleCreateGroup}
                disabled={!groupName}
                activeOpacity={0.7}
              >
                <Text style={styles.createGroupButtonText}>Crear grupo</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showNewPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewPostModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.postModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva publicación</Text>
                <TouchableOpacity
                  onPress={() => setShowNewPostModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#8F9BB3" />
                </TouchableOpacity>
              </View>

              <View style={styles.postInputContainer}>
                <Image
                  source={{
                    uri: user.avatar_url || "https://i.imgur.com/mCHMpLT.png",
                  }}
                  style={styles.smallAvatar}
                />
                <TextInput
                  style={styles.postInput}
                  placeholder="¿Qué quieres compartir con la comunidad?"
                  placeholderTextColor="#A0A0A0"
                  value={newPostText}
                  onChangeText={setNewPostText}
                  multiline
                  autoFocus
                />
              </View>

              <View style={styles.postOptions}>
                <TouchableOpacity style={styles.postOption} activeOpacity={0.7}>
                  <Ionicons name="image-outline" size={24} color="#6B8BFF" />
                  <Text style={styles.postOptionText}>Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postOption} activeOpacity={0.7}>
                  <Ionicons name="happy-outline" size={24} color="#6B8BFF" />
                  <Text style={styles.postOptionText}>Estado</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.postButton,
                  !newPostText.trim() && styles.disabledButton,
                ]}
                onPress={handleCreatePost}
                disabled={!newPostText.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.postButtonText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showGroupChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGroupChatModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.chatModal}>
              <View style={styles.modalHeader}>
                <View style={styles.chatModalTitle}>
                  <Image
                    source={{
                      uri:
                        selectedGroup?.avatar_url ||
                        "https://i.imgur.com/mCHMpLT.png",
                    }}
                    style={styles.chatGroupAvatar}
                  />
                  <Text style={styles.modalTitle}>{selectedGroup?.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowGroupChatModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#8F9BB3" />
                </TouchableOpacity>
              </View>

              {loadingMessages ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6B8BFF" />
                </View>
              ) : (
                <FlatList
                  ref={messagesListRef}
                  data={groupMessages}
                  renderItem={renderGroupMessage}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.messagesList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  inverted={false}
                  onContentSizeChange={() => {
                    messagesListRef.current?.scrollToEnd({ animated: true });
                  }}
                  onLayout={() => {
                    messagesListRef.current?.scrollToEnd({ animated: true });
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyMessagesContainer}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={50}
                        color="#DFE3EB"
                      />
                      <Text style={styles.emptyText}>No hay mensajes aún</Text>
                      <Text style={styles.emptySubtext}>
                        ¡Sé el primero en enviar un mensaje!
                      </Text>
                    </View>
                  }
                />
              )}

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Escribe un mensaje..."
                  placeholderTextColor="#A0A0A0"
                  value={newGroupMessage}
                  onChangeText={setNewGroupMessage}
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleSendGroupMessage}
                />
                <TouchableOpacity
                  onPress={handleSendGroupMessage}
                  disabled={!newGroupMessage.trim()}
                  activeOpacity={0.7}
                  style={styles.sendButton}
                >
                  <Ionicons
                    name="send"
                    size={24}
                    color={newGroupMessage.trim() ? "#6B8BFF" : "#C5CEE0"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showGroupMembersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGroupMembersModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.membersModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Miembros del grupo</Text>
                <TouchableOpacity
                  onPress={() => setShowGroupMembersModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#8F9BB3" />
                </TouchableOpacity>
              </View>

              {loadingMembers ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6B8BFF" />
                </View>
              ) : (
                <FlatList
                  data={groupMembers}
                  renderItem={renderGroupMember}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.membersList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="people" size={50} color="#DFE3EB" />
                      <Text style={styles.emptyText}>No hay miembros</Text>
                    </View>
                  }
                />
              )}

              {selectedGroup?.is_admin && (
                <TouchableOpacity
                  style={styles.addMembersButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-add" size={20} color="#FFFFFF" />
                  <Text style={styles.addMembersText}>Añadir miembros</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <AddFriendsModal
        visible={showAddFriendsModal}
        onClose={() => {
          setShowAddFriendsModal(false);
          setFriendSearchQuery("");
          searchUsersFriends("");
        }}
        friendSearchQuery={friendSearchQuery}
        setFriendSearchQuery={setFriendSearchQuery}
        searchUsersFriends={searchUsersFriends}
        searchLoading={searchLoading}
        searchResults={searchResults}
        renderUserSearchResult={renderUserSearchResult}
      />
      <NotificationsModal />
      <UserProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        friendshipStatus={friendshipStatus}
        isLoadingAction={isLoadingAction}
        onSendRequest={() => sendProfileFriendRequest(selectedUserId)}
        onAcceptRequest={() => acceptFriendRequest(selectedUserId)}
        onRemoveFriend={() => removeFriend(selectedUserId)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A2138",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#8F9BB3",
    marginTop: 4,
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: "row",
    position: "absolute",
    right: 20,
    top: 20,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 16,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderRadius: 12,
    position: "relative",
  },
  activeTab: {
    backgroundColor: "#EEF2FF",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8F9BB3",
  },
  activeTabText: {
    color: "#6B8BFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 18,
    margin: 16,
    borderRadius: 16,
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F4F8",
  },
  createPostText: {
    marginLeft: 14,
    color: "#8F9BB3",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F4F8",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#F3F6FF",
  },
  smallAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: "#F3F6FF",
  },
  postUserInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
    letterSpacing: -0.3,
  },
  moodTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  postTime: {
    fontSize: 12,
    color: "#8F9BB3",
    marginLeft: 6,
  },
  postContent: {
    fontSize: 16,
    color: "#2E3A59",
    lineHeight: 24,
    marginBottom: 18,
    letterSpacing: -0.2,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F8F9FB",
  },
  actionText: {
    fontSize: 14,
    color: "#8F9BB3",
    marginLeft: 4,
    fontWeight: "500",
  },
  groupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 18,
    margin: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F4F8",
  },
  groupIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  groupButtonText: {
    color: "#2E3A59",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  commentsModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
    width: "100%",
  },
  chatModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    height: "90%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  usersModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
    width: "100%",
  },
  groupModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
    width: "100%",
  },
  membersModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "70%",
    width: "100%",
  },
  postModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "60%",
    width: "100%",
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
    paddingBottom: 16,
  },
  chatModalTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatGroupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A2138",
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
  },
  commentsList: {
    paddingBottom: 16,
  },
  messagesList: {
    paddingVertical: 16,
    flexGrow: 1,
    paddingBottom: 10, // Espacio adicional al final
  },
  membersList: {
    paddingBottom: 16,
  },
  commentCard: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  commentContent: {
    flex: 1,
    marginLeft: 14,
  },
  commentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E3A59",
    letterSpacing: -0.3,
  },
  commentText: {
    fontSize: 15,
    color: "#2E3A59",
    marginTop: 6,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  commentTime: {
    fontSize: 12,
    color: "#8F9BB3",
    marginRight: 16,
  },
  commentLike: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  commentLikesCount: {
    fontSize: 12,
    color: "#FF3B30",
    marginLeft: 2,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 24,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  commentInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    color: "#2E3A59",
    maxHeight: 100,
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2E3A59",
    padding: 0,
    height: 40,
    marginLeft: 10,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  userAvatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  mutualFriends: {
    fontSize: 13,
    color: "#8F9BB3",
    marginTop: 2,
  },
  groupNameInput: {
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#2E3A59",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  groupDescriptionInput: {
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#2E3A59",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    height: 100,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8F9BB3",
    marginBottom: 12,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groupUsersList: {
    paddingBottom: 20,
  },
  createGroupButton: {
    backgroundColor: "#6B8BFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#BDC8E5",
    shadowOpacity: 0.1,
  },
  createGroupButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  postInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    color: "#2E3A59",
    maxHeight: 150,
    minHeight: 80,
    padding: 0,
    marginLeft: 14,
    lineHeight: 24,
  },
  postOptions: {
    flexDirection: "row",
    marginBottom: 24,
  },
  postOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F7F9FC",
  },
  postOptionText: {
    color: "#6B8BFF",
    fontSize: 15,
    marginLeft: 8,
    fontWeight: "500",
  },
  postButton: {
    backgroundColor: "#6B8BFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F4F8",
    marginHorizontal: 16,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 12,
    fontSize: 16,
  },
  retryText: {
    color: "#6B8BFF",
    fontWeight: "600",
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 30,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#2E3A59",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 16,
  },
  emptySubtext: {
    color: "#8F9BB3",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "80%",
  },
  noCommentsText: {
    textAlign: "center",
    color: "#8F9BB3",
    marginTop: 20,
    fontSize: 15,
  },
  emptyListText: {
    textAlign: "center",
    color: "#8F9BB3",
    marginTop: 12,
    fontSize: 15,
  },
  developmentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 20,
  },
  developmentText: {
    color: "#8F9BB3",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  // Estilos para grupos
  groupCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F4F8",
  },
  groupCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    backgroundColor: "#EEF2FF",
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2E3A59",
    letterSpacing: -0.3,
  },
  groupMembers: {
    fontSize: 13,
    color: "#8F9BB3",
    marginTop: 2,
  },
  groupDescription: {
    fontSize: 15,
    color: "#2E3A59",
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  groupActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F1F4F8",
    paddingTop: 14,
  },
  groupActionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F7F9FC",
  },
  groupActionText: {
    fontSize: 14,
    color: "#6B8BFF",
    marginLeft: 6,
    fontWeight: "500",
  },
  groupOptionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
  },
  // Estilos para mensajes
  messageCard: {
    flexDirection: "row",
    marginVertical: 6,
    paddingHorizontal: 12,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "100%",
  },
  userMessageContent: {
    backgroundColor: "#a7b9fc",
    borderBottomRightRadius: 4,
  },
  otherMessageContent: {
    backgroundColor: "#F7F9FC",
    borderBottomLeftRadius: 4,
  },
  messageName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#2E3A59",
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: "#8F9BB3",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  // Estilos para miembros
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  memberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
    letterSpacing: -0.3,
  },
  memberRole: {
    fontSize: 13,
    color: "#8F9BB3",
    marginTop: 2,
  },
  memberAction: {
    padding: 6,
  },
  currentUserLabel: {
    fontSize: 13,
    color: "#6B8BFF",
    fontWeight: "600",
    backgroundColor: "#EEF2FF",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  addMembersButton: {
    backgroundColor: "#6B8BFF",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  addMembersText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F3FA",
    alignItems: "center",
    justifyContent: "center",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
  },
  userEmail: {
    fontSize: 14,
    color: "#8F9BB3",
    marginTop: 2,
  },
  friendRequestItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  friendRequestInfo: {
    flex: 1,
    marginLeft: 15,
  },
  requestText: {
    fontSize: 14,
    color: "#8F9BB3",
    marginTop: 2,
  },
  requestTime: {
    fontSize: 12,
    color: "#8F9BB3",
    marginTop: 4,
  },
  friendRequestActions: {
    flexDirection: "row",
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: "#8F9BB3",
    textAlign: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  addFriendsButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#6B8BFF",
    borderRadius: 20,
  },
  addFriendsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  searchInputExpanded: {
    flex: 1,
    fontSize: 16,
    color: "#2E3A59",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchBackButton: {
    marginRight: 8,
    padding: 4,
  },
  searchClearButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default Comunidad;
