// activities/HistoryList.tsx
import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Activity } from "../../utils/obtenerDatosSupabase";

interface HistoryListProps {
  activities: Activity[];
  categories: { id: string; title: string }[];
}

const HistoryList: React.FC<HistoryListProps> = ({
  activities,
  categories,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historial de Actividades</Text>

      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color="#A0A0A0" />
          <Text style={styles.emptyText}>
            No hay actividades completadas aún
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{activities.length}</Text>
              <Text style={styles.statLabel}>Total completadas</Text>
            </View>
          </View>

          {activities.map((activity) => (
            <View key={activity.id} style={styles.card}>
              <View style={styles.imageContainer}>
                {activity.image ? (
                  <Image
                    source={{ uri: activity.image }}
                    style={styles.image}
                  />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={24} color="#A0A0A0" />
                  </View>
                )}
              </View>

              <View style={styles.content}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.category}>
                  {categories.find((c) => c.id === activity.category_id)
                    ?.title || "Sin categoría"}
                </Text>
                {activity.last_updated && (
                  <Text style={styles.date}>
                    {formatDate(activity.last_updated)}
                  </Text>
                )}
              </View>

              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FB",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#8F9BB3",
    marginTop: 16,
    textAlign: "center",
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6B8BFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#8F9BB3",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  imagePlaceholder: {
    backgroundColor: "#E1E6EF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: "#8F9BB3",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#6B8BFF",
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});

export default HistoryList;
