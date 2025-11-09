import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable } from "react-native";

const PremiumComparison = ({ onClose }: { onClose: () => void }) => {
  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(300)}>
      <View style={styles.header}>
        <Text style={styles.title}>¡Hazte Premium!</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Cerrar comparativa premium"
        >
          <Ionicons name="close" size={24} color="#6B8BFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Disfruta de la mejor experiencia y desbloquea todo el potencial de
        Moodly
      </Text>

      <View style={styles.comparisonContainer}>
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Gratis</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
              <Text style={styles.featureText}>Acceso básico</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="alert-circle" size={22} color="#FFB300" />
              <Text style={styles.featureText}>Con anuncios</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={22} color="#FF5C8A" />
              <Text style={styles.featureText}>Límite de mensajes</Text>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#6B8BFF", "#A084E8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.planCard, styles.premiumCard]}
        >
          <View style={[styles.planHeader, styles.premiumHeader]}>
            <View style={styles.premiumBadge}>
              <Ionicons
                name="star"
                size={12}
                color="#FFD700"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.premiumBadgeText}>RECOMENDADO</Text>
            </View>
            <Text style={[styles.planTitle, styles.premiumTitle]}>Premium</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={22} color="#FFD700" />
              <Text style={[styles.featureText, styles.premiumFeatureText]}>
                Acceso completo
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={22} color="#FFD700" />
              <Text style={[styles.featureText, styles.premiumFeatureText]}>
                Sin anuncios
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="infinite" size={22} color="#FFD700" />
              <Text style={[styles.featureText, styles.premiumFeatureText]}>
                Mensajes ilimitados
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.subscribeButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
            onPress={onClose}
            accessibilityLabel="Suscribirse a Premium"
          >
            <Ionicons name="sparkles" size={22} color="#6B8BFF" />
            <Text style={styles.subscribeButtonText}>
              ¡Quiero ser Premium! $24.99/mes
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
      <Text style={styles.footnote}>
        Cancela cuando quieras. Sin compromiso.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F8F9FB",
    padding: 20,
    zIndex: 100,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2E3A59",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B8BFF",
    fontWeight: "600",
    marginBottom: 18,
    textAlign: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  comparisonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginBottom: 18,
  },
  planCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 0,
  },
  premiumCard: {
    backgroundColor: undefined, 
    borderWidth: 1.5,
    borderColor: "#FFD700",
    shadowColor: "#6B8BFF",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  planHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4FF",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  premiumHeader: {
    borderBottomColor: "rgba(255,255,255,0.18)",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: "#FFD700",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2E3A59",
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2E3A59",
    letterSpacing: 0.2,
  },
  premiumTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 20,
    letterSpacing: 0.3,
  },
  featuresContainer: {
    padding: 18,
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F4FF",
    paddingBottom: 8,
  },
  featureText: {
    marginLeft: 10,
    color: "#2E3A59",
    fontSize: 15,
    fontWeight: "500",
  },
  premiumFeatureText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.08)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subscribeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    margin: 18,
    borderRadius: 12,
    shadowColor: "#FFD700",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  subscribeButtonText: {
    color: "#2E3A59",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  footnote: {
    textAlign: "center",
    color: "#A0A0A0",
    fontSize: 12,
    marginTop: 10,
  },
});

export default PremiumComparison;
