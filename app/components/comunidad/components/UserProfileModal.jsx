import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const UserProfileModal = ({
  visible,
  onClose,
  profile,
  friendshipStatus,
  isLoadingAction,
  onSendRequest,
  onAcceptRequest,
  onRemoveFriend,
}) => {
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showPrivateChatModal, setShowPrivateChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const messagesListRef = useRef(null);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleMoreOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDeleteMenu(true);
  };

  const closeDeleteMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDeleteMenu(false);
  };

  const confirmRemoveFriend = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowDeleteMenu(false);
    onRemoveFriend();
  };

  const openPrivateChat = () => {
    setShowPrivateChatModal(true);
    onClose && onClose();
    setLoadingMessages(true);
    setTimeout(() => {
      setMessages([
        {
          id: "1",
          text: "Hola, últimamente me he sentido muy ansioso y no sé cómo manejarlo.",
          sent: false,
          time: "10:30 AM",
        },
        {
          id: "2",
          text: "Te entiendo, a veces yo también me siento así. ¿Quieres hablar de lo que te preocupa?",
          sent: true,
          time: "10:32 AM",
        },
        {
          id: "3",
          text: "Gracias por escucharme. Me cuesta dormir y siento que todo me sobrepasa.",
          sent: false,
          time: "10:33 AM",
        },
      ]);
      setLoadingMessages(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now().toString(),
        text: newMessage,
        sent: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");

      setTimeout(() => {
        const replyMsg = {
          id: (Date.now() + 1).toString(),
          text: "Gracias por tu mensaje. Te responderé pronto.",
          sent: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1500);
    }
  };

  const renderMessage = ({ item }) => {
    return (
      <View
        style={[
          styles.messageBubble,
          item.sent ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{item.time}</Text>
      </View>
    );
  };

  const renderActionButton = () => {
    const ButtonContent = ({ icon, text, color }) => (
      <>
        <Ionicons name={icon} size={20} color="white" />
        <Text style={styles.actionButtonText}>{text}</Text>
      </>
    );

    switch (friendshipStatus) {
      case "not_friends":
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#6B8BFF" }]}
            onPress={onSendRequest}
            disabled={isLoadingAction}
          >
            {isLoadingAction ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonContent icon="person-add" text="Agregar amigo" />
            )}
          </TouchableOpacity>
        );

      case "request_sent":
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FFAA00" }]}
            disabled={true}
          >
            <ButtonContent icon="time" text="Solicitud enviada" />
          </TouchableOpacity>
        );

      case "request_received":
        return (
          <View style={styles.doubleActionContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonSmall,
                { backgroundColor: "#4CD964" },
              ]}
              onPress={onAcceptRequest}
            >
              <ButtonContent icon="checkmark" text="Aceptar" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonSmall,
                { backgroundColor: "#FF3B30" },
              ]}
              onPress={onRemoveFriend}
            >
              <ButtonContent icon="close" text="Rechazar" />
            </TouchableOpacity>
          </View>
        );

      case "friends":
        return (
          <View style={styles.doubleActionContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonSmall,
                { backgroundColor: "#6B8BFF" },
              ]}
              onPress={openPrivateChat}
            >
              <ButtonContent icon="chatbubble" text="Chat" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonSmall,
                { backgroundColor: "#8F9BB3" },
              ]}
              onPress={handleMoreOptions}
            >
              <ButtonContent icon="ellipsis-horizontal" text="" />
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (!profile) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        onRequestClose={onClose}
        statusBarTranslucent={true}
        animationType="none"
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <BlurView intensity={20} style={styles.blurContainer}>
            <TouchableWithoutFeedback onPress={onClose}>
              <View style={styles.backdropTouchable} />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[styles.container, { transform: [{ translateY }] }]}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#6B8BFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil</Text>
                <View style={styles.headerRightPlaceholder} />
              </View>

              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{
                        uri:
                          profile.avatar_url ||
                          "https://i.imgur.com/mCHMpLT.png",
                      }}
                      style={styles.avatar}
                    />
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  </View>

                  <Text style={styles.userName}>{profile.nombre}</Text>
                  <Text style={styles.userHandle}>
                    @{profile.email.split("@")[0]}
                  </Text>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>142</Text>
                      <Text style={styles.statLabel}>Amigos</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>56</Text>
                      <Text style={styles.statLabel}>Grupos</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>1.2K</Text>
                      <Text style={styles.statLabel}>Likes</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  {renderActionButton()}
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>INFORMACIÓN</Text>

                  <View style={styles.infoItem}>
                    <View style={styles.infoIcon}>
                      <Ionicons name="mail-outline" size={20} color="#6B8BFF" />
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>Correo electrónico</Text>
                      <Text style={styles.infoText}>{profile.email}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#6B8BFF"
                      />
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>Miembro desde</Text>
                      <Text style={styles.infoText}>Abril 2023</Text>
                    </View>
                  </View>
                </View>

                {friendshipStatus === "friends" && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>ACTIVIDAD RECIENTE</Text>

                    <View style={styles.activityItem}>
                      <View
                        style={[
                          styles.activityIcon,
                          { backgroundColor: "#FFEEED" },
                        ]}
                      >
                        <Ionicons name="heart" size={16} color="#FF3B30" />
                      </View>
                      <View style={styles.activityTextContainer}>
                        <Text style={styles.activityText}>
                          Le gustó tu publicación
                        </Text>
                        <Text style={styles.activityTime}>Hace 2 días</Text>
                      </View>
                    </View>

                    <View style={styles.activityItem}>
                      <View
                        style={[
                          styles.activityIcon,
                          { backgroundColor: "#EEF2FF" },
                        ]}
                      >
                        <Ionicons name="chatbubble" size={16} color="#6B8BFF" />
                      </View>
                      <View style={styles.activityTextContainer}>
                        <Text style={styles.activityText}>
                          Comentó en tu foto
                        </Text>
                        <Text style={styles.activityTime}>Hace 1 semana</Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </BlurView>
        </Animated.View>

        {showDeleteMenu && (
          <View style={styles.contextMenuBackdrop}>
            <TouchableWithoutFeedback onPress={closeDeleteMenu}>
              <View style={styles.contextMenuTouchable} />
            </TouchableWithoutFeedback>

            <Animated.View style={styles.contextMenu}>
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={confirmRemoveFriend}
              >
                <Ionicons name="trash" size={20} color="#FF3B30" />
                <Text style={[styles.contextMenuText, { color: "#FF3B30" }]}>
                  Eliminar amigo
                </Text>
              </TouchableOpacity>
              <View style={styles.contextMenuSeparator} />
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={closeDeleteMenu}
              >
                <Text style={styles.contextMenuText}>Cancelar</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </Modal>

      <Modal
        visible={showPrivateChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivateChatModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.chatModal}>
              <View style={styles.modalHeader}>
                <View style={styles.userInfoContainer}>
                  <Image
                    source={{
                      uri:
                        profile.avatar_url || "https://i.imgur.com/mCHMpLT.png",
                    }}
                    style={styles.chatUserAvatar}
                  />
                  <View style={styles.userTextInfo}>
                    <Text style={styles.modalTitle}>{profile.nombre}</Text>
                    <Text style={styles.chatStatus}>En línea</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowPrivateChatModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#6B8BFF" />
                </TouchableOpacity>
              </View>

              {loadingMessages ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6B8BFF" />
                </View>
              ) : (
                <FlatList
                  ref={messagesListRef}
                  data={messages}
                  renderItem={renderMessage}
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
                        ¡Envía el primer mensaje!
                      </Text>
                    </View>
                  }
                />
              )}

              <View style={styles.messageInputContainer}>
                <TouchableOpacity
                  style={styles.attachmentButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="attach" size={24} color="#6B8BFF" />
                </TouchableOpacity>

                <TextInput
                  style={styles.messageInput}
                  placeholder="Escribe un mensaje..."
                  placeholderTextColor="#A0A0A0"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleSendMessage}
                />

                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={!newMessage.trim()}
                  activeOpacity={0.7}
                  style={styles.sendButton}
                >
                  <Ionicons
                    name="send"
                    size={24}
                    color={newMessage.trim() ? "#6B8BFF" : "#C5CEE0"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  blurContainer: {
    flex: 1,
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A2138",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  content: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6B8BFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A2138",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userHandle: {
    fontSize: 16,
    color: "#8F9BB3",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2138",
  },
  statLabel: {
    fontSize: 14,
    color: "#8F9BB3",
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonSmall: {
    flex: 1,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  doubleActionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8F9BB3",
    marginBottom: 16,
    letterSpacing: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: "#8F9BB3",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    color: "#1A2138",
    fontWeight: "500",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: "#1A2138",
  },
  activityTime: {
    fontSize: 13,
    color: "#8F9BB3",
    marginTop: 2,
  },
  contextMenuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  contextMenuTouchable: {
    flex: 1,
  },
  contextMenu: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  contextMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  contextMenuText: {
    fontSize: 18,
    color: "#1A2138",
    marginLeft: 16,
  },
  contextMenuSeparator: {
    height: 1,
    backgroundColor: "#F1F4F8",
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  chatModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "90%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 12,
  },
  chatUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userTextInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A2138",
  },
  chatStatus: {
    fontSize: 13,
    color: "#8F9BB3",
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  moreOptionsButton: {
    padding: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#a7b9fc",
    borderBottomRightRadius: 2,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F4F8",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: "#a7b9fc",
  },
  receivedMessageText: {
    color: "#1A2138",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },
  sentMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  receivedMessageTime: {
    color: "#8F9BB3",
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F4F8",
  },
  messageInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F7F9FC",
    borderRadius: 24,
    fontSize: 16,
    color: "#1A2138",
    marginHorizontal: 8,
  },
  attachmentButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#8F9BB3",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#C5CEE0",
    marginTop: 4,
  },
});

export default UserProfileModal;
