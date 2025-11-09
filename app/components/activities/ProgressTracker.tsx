import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { ActivityHistory } from "../../utils/obtenerDatosSupabase";
import { useState } from "react";

interface ProgressTrackerProps {
  completedActivities: number;
  totalActivities?: number;
  activityHistory?: ActivityHistory[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completedActivities,
  totalActivities = 3,
  activityHistory = [],
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const progress = Math.min(
    100,
    Math.round((completedActivities / totalActivities) * 100)
  );

  const getCategoryColor = (category: string, isView = false) => {
    const baseColors: { [key: string]: string } = {
      Meditaciones: "#A78BFA",
      Ejercicios: "#6B8BFF",
      Lecturas: "#4CAF50",
      Sonidos: "#FF9800",
    };
    const color = baseColors[category] || "#E1E6EF";
    return isView ? `${color}20` : color;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const renderHistoryItem = ({ item }: { item: ActivityHistory }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyItemContent}>
        <Text style={styles.historyItemTitle}>
          {item.activity_title || "Actividad"}
        </Text>
        {item.category_name && (
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(item.category_name, true) },
            ]}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                { color: getCategoryColor(item.category_name) },
              ]}
            >
              {item.category_name}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.historyItemMeta}>
        <Text style={styles.historyItemTime}>
          {formatDate(item.last_updated)}
        </Text>
        {item.activity_duration && (
          <Text style={styles.historyItemDuration}>
            {item.activity_duration}
          </Text>
        )}
        <Text
          style={[
            styles.historyItemProgress,
            item.progress >= 100 ? styles.progressCompleted : {},
          ]}
        >
          {item.progress}%
        </Text>
      </View>
    </View>
  );

  const completedActivitiesHistory = activityHistory.filter(
    (item) => item.progress >= 100
  );

  return (
    <>
      <Animated.View
        style={styles.progressTrackerContainer}
        entering={FadeIn.duration(400).delay(100)}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Tu progreso diario</Text>
          {/* <TouchableOpacity onPress={() => setShowHistory(true)}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#8F9BB3"
            />
          </TouchableOpacity> */}
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%` },
              progress >= 100 && styles.progressBarFillCompleted,
            ]}
          />
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.progressStatsText}>
            {completedActivities} de {totalActivities} actividades completadas
          </Text>
          <Text
            style={[
              styles.progressPercentage,
              progress >= 100 && styles.progressPercentageCompleted,
            ]}
          >
            {progress}%
          </Text>
        </View>
        {progress >= 100 && (
          <Text style={styles.completionMessage}>
            ¡Objetivo diario cumplido! 🎉
          </Text>
        )}
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.viewDetailsText}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={14} color="#6B8BFF" />
        </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Historial de Actividades</Text>
          </View>

          <View style={styles.historyStats}>
            <Text style={styles.historyStatsText}>
              Total completadas: {completedActivitiesHistory.length}
            </Text>
          </View>

          {completedActivitiesHistory.length > 0 ? (
            <FlatList
              data={completedActivitiesHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.historyList}
            />
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons name="time-outline" size={48} color="#8F9BB3" />
              <Text style={styles.emptyHistoryText}>
                No hay actividades completadas aún
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  progressTrackerContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E3A59",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E1E6EF",
    borderRadius: 3,
    marginBottom: 10,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#6B8BFF",
    borderRadius: 3,
  },
  progressBarFillCompleted: {
    backgroundColor: "#4CAF50",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressStatsText: {
    fontSize: 12,
    color: "#8F9BB3",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E3A59",
  },
  progressPercentageCompleted: {
    color: "#4CAF50",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#6B8BFF",
    marginRight: 2,
  },
  completionMessage: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  historyStats: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F8F9FB",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E6EF",
    marginBottom: 10,
  },
  historyStatsText: {
    fontSize: 14,
    color: "#2E3A59",
    fontWeight: "600",
    textAlign: "center",
  },
  historyList: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: "#F8F9FB",
  },
  historyItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8F9FB",
  },
  emptyHistoryText: {
    fontSize: 16,
    color: "#8F9BB3",
    marginTop: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  emptyHistoryIcon: {
    backgroundColor: "#E1E6EF",
    padding: 20,
    borderRadius: 50,
    marginBottom: 15,
  },
  progressCompleted: {
    color: "#4CAF50",
  },
  categoryBadge: {
    backgroundColor: "#E1E6EF",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  categoryBadgeText: {
    fontSize: 12,
    color: "#6B8BFF",
    fontWeight: "500",
  },
});

export default ProgressTracker;
