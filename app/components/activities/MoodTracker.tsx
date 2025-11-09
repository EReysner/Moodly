import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const moods = [
  { emoji: "😊", text: "Bien", color: "#4CAF50" },
  { emoji: "😐", text: "Neutral", color: "#FFC107" },
  { emoji: "😔", text: "Triste", color: "#5C6BC0" },
  { emoji: "😰", text: "Ansioso", color: "#FF7043" },
  { emoji: "😴", text: "Cansado", color: "#78909C" },
];

const MoodTracker = ({ todayMood, moodHistory, saveDailyMood }) => {
  const [showHistory, setShowHistory] = useState(false);
  const hasSelectedMoodToday = todayMood !== null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";

    return date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderHistoryItem = ({ item }) => {
    const moodData = moods[item.mood_index];
    return (
      <View style={styles.historyItem}>
        <View
          style={[
            styles.moodCircle,
            {
              backgroundColor: `${moodData.color}20`,
              borderColor: moodData.color,
            },
          ]}
        >
          <Text style={styles.moodEmoji}>{moodData.emoji}</Text>
        </View>
        <View style={styles.historyItemContent}>
          <Text style={styles.historyItemTitle}>{moodData.text}</Text>
          <Text style={styles.historyItemDate}>
            {formatDate(item.created_at)}
          </Text>
          {item.data_created && item.data_created !== item.created_at && (
            <Text style={styles.historyItemDate}>
              Registrado: {formatDate(item.data_created)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <Animated.View
        style={styles.moodTrackerContainer}
        entering={FadeIn.duration(400).delay(200)}
      >
        <View style={styles.headerRow}>
          <Text style={styles.moodTrackerTitle}>¿Cómo te sientes hoy?</Text>
          {moodHistory.length > 0 && (
            <TouchableOpacity onPress={() => setShowHistory(true)}>
              <Ionicons name="time-outline" size={20} color="#8F9BB3" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.moodOptionsContainer}>
          {moods.map((mood, index) => (
            <TouchableOpacity
              key={index}
              style={styles.moodOption}
              onPress={() => saveDailyMood(index)}
              disabled={hasSelectedMoodToday}
            >
              <View
                style={[
                  styles.moodCircle,
                  {
                    backgroundColor: `${mood.color}20`,
                    borderWidth: todayMood === index ? 2 : 0,
                    borderColor: mood.color,
                    opacity:
                      hasSelectedMoodToday && todayMood !== index ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </View>
              <Text
                style={[
                  styles.moodOptionText,
                  todayMood === index && {
                    color: mood.color,
                    fontWeight: "600",
                  },
                  hasSelectedMoodToday &&
                    todayMood !== index && { opacity: 0.5 },
                ]}
              >
                {mood.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {hasSelectedMoodToday && todayMood !== null && (
          <View style={styles.moodFeedbackContainer}>
            <Text style={styles.moodFeedbackText}>
              {moods[todayMood].text === "Bien" &&
                "¡Genial! Aprovecha para hacer actividades que disfrutes."}
              {moods[todayMood].text === "Neutral" &&
                "Está bien sentirse neutral. ¿Qué tal una meditación corta?"}
              {moods[todayMood].text === "Triste" &&
                "Lamento que te sientas triste. Las lecturas pueden ayudarte."}
              {moods[todayMood].text === "Ansioso" &&
                "La ansiedad puede disminuir con ejercicios de respiración."}
              {moods[todayMood].text === "Cansado" &&
                "El descanso es importante. Prueba sonidos relajantes."}
            </Text>
          </View>
        )}
      </Animated.View>

      <Modal
        visible={showHistory}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowHistory(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="arrow-back" size={24} color="#2E3A59" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tu historial emocional</Text>
          </View>
          {moodHistory.length > 0 ? (
            <FlatList
              data={moodHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.historyList}
            />
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons name="time-outline" size={48} color="#8F9BB3" />
              <Text style={styles.emptyHistoryText}>
                Aún no hay registros de tu estado emocional
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  moodTrackerContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  moodTrackerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E3A59",
  },
  moodOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  moodOption: {
    alignItems: "center",
    maxWidth: width / 6,
  },
  moodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodOptionText: {
    fontSize: 12,
    color: "#8F9BB3",
    textAlign: "center",
  },
  moodFeedbackContainer: {
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  moodFeedbackText: {
    fontSize: 14,
    color: "#4D5A76",
    textAlign: "center",
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E6EF",
    backgroundColor: "#F8F9FB",
  },
  modalCloseButton: {
    padding: 8,
    backgroundColor: "#E1E6EF",
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E3A59",
    textAlign: "center",
    flex: 1,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4FF",
  },
  historyItemContent: {
    marginLeft: 15,
  },
  historyItemTitle: {
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "500",
  },
  historyItemDate: {
    fontSize: 12,
    color: "#8F9BB3",
    marginTop: 2,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: "#8F9BB3",
    marginTop: 15,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default MoodTracker;
