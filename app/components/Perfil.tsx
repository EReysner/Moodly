import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../utils/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { subirDatosBasicos } from "../utils/subirDatosSupabase";
import { useAvatarUpload } from "./perfil/hooks/useAvatarUpload";
import { Button, Badge, Surface } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

interface ProfileData {
  id?: string;
  nombre?: string;
  email?: string;
  fecha_registro?: string;
  ultimo_acceso?: string;
  avatar_url?: string;
}

const Perfil = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPremium, setShowPremium] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const premiumSectionRef = useRef<View>(null);
  const [stats, setStats] = useState({
    activitiesCompleted: 0,
    streak: 0,
    minutesPracticed: 0,
    favoriteActivity: "Meditación",
  });
  const { uploadAvatar, isUploading: isAvatarUploading } = useAvatarUpload();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUser(user);

          const { data: profileData, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error.message);
          } else {
            setProfile(profileData);
            setStats({
              activitiesCompleted: 12,
              streak: 4,
              minutesPracticed: 85,
              favoriteActivity: "Meditación de atención plena",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase.auth.signOut();
          setLoading(false);
          if (!error) {
            router.push("/");
          } else {
            Alert.alert("Error", "No se pudo cerrar sesión correctamente");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEditProfile = async () => {
    if (!user?.id) return;

    try {
      const avatarUrl = await uploadAvatar(user.id);

      if (avatarUrl) {
        setProfile((prev) => ({
          ...prev,
          avatar_url: avatarUrl,
        }));

        Alert.alert("Éxito", "Avatar actualizado correctamente");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el avatar");
    }
  };

  const handleSettings = async () => {
    alert("Configuración");
  };

  const handleTogglePremium = () => {
    setShowPremium(!showPremium);

    if (!showPremium) {
      setTimeout(() => {
        premiumSectionRef.current?.measure(
          (x, y, width, height, pageX, pageY) => {
            scrollViewRef.current?.scrollTo({ y: pageY - 120, animated: true });
          }
        );
      }, 100);
    }
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    onPress: () => void,
    iconType: "Ionicons" | "MaterialCommunity" = "Ionicons"
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        {iconType === "Ionicons" ? (
          <Ionicons name={icon as any} size={22} color="#6B8BFF" />
        ) : (
          <MaterialCommunityIcons
            name={icon as any}
            size={22}
            color="#6B8BFF"
          />
        )}
      </View>
      <Text style={styles.menuItemText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#C5CEE0" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B8BFF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color="#2E3A59" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={styles.profileHeader}
          entering={FadeIn.duration(500)}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {profile?.nombre?.charAt(0) ||
                      user?.email?.charAt(0).toUpperCase() ||
                      "?"}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={handleEditProfile}
              >
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.nombre || "Usuario de Moodly"}
              </Text>
              <Text style={styles.profileEmail}>
                {profile?.email || user?.email}
              </Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={handleEditProfile}
                >
                  <Text style={styles.editProfileText}>Editar perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumButtonUpdated}
                  onPress={handleTogglePremium}
                >
                  <LinearGradient
                    colors={["#FFD700", "#FFC107"]}
                    style={styles.premiumGradient}
                  >
                    <Ionicons name="sparkles" size={16} color="#2E3A59" />
                    <Text style={styles.premiumButtonText}>Premium</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={styles.statsContainer}
          entering={FadeInUp.delay(200).duration(500)}
        >
          <Text style={styles.sectionTitle}>Tu progreso</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <View
                style={[
                  styles.statsIconContainer,
                  { backgroundColor: "#E3F2FD" },
                ]}
              >
                <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
              </View>
              <Text style={styles.statsValue}>{stats.activitiesCompleted}</Text>
              <Text style={styles.statsLabel}>Actividades completadas</Text>
            </View>

            <View style={styles.statsCard}>
              <View
                style={[
                  styles.statsIconContainer,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Ionicons name="flame" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statsValue}>{stats.streak}</Text>
              <Text style={styles.statsLabel}>Racha actual</Text>
            </View>

            <View style={styles.statsCard}>
              <View
                style={[
                  styles.statsIconContainer,
                  { backgroundColor: "#F3E5F5" },
                ]}
              >
                <Ionicons name="time" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.statsValue}>{stats.minutesPracticed}</Text>
              <Text style={styles.statsLabel}>Minutos totales</Text>
            </View>

            <View style={styles.statsCard}>
              <View
                style={[
                  styles.statsIconContainer,
                  { backgroundColor: "#FFF3E0" },
                ]}
              >
                <Ionicons name="heart" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statsValue}>
                <Ionicons name="star" size={16} color="#FFC107" />
              </Text>
              <Text style={styles.statsLabel}>Actividad favorita</Text>
            </View>
          </View>
        </Animated.View>

        {showPremium && (
          <Animated.View
            ref={premiumSectionRef}
            style={styles.premiumSection}
            entering={FadeInUp.duration(400)}
          >
            <View style={styles.premiumHeaderRow}>
              <Text style={styles.sectionTitle}>Plan Premium</Text>
              <TouchableOpacity
                style={styles.closePremiumButton}
                onPress={() => setShowPremium(false)}
              >
                <Ionicons name="close" size={24} color="#8F9BB3" />
              </TouchableOpacity>
            </View>

            <Surface style={styles.premiumCard}>
              <LinearGradient
                colors={["#7A6CFF", "#6B8BFF", "#5EAAFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.premiumBanner}
              >
                <View style={styles.premiumBannerContent}>
                  <Ionicons name="sparkles" size={32} color="#FFD700" />
                  <View style={styles.premiumTextContainer}>
                    <Text style={styles.premiumTitle}>Mejora a Premium</Text>
                    <Text style={styles.premiumSubtitle}>
                      Desbloquea todo el potencial de Moodly
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.premiumFeatures}>
                {[
                  { title: "Mensajes ilimitados", icon: "infinite-outline" },
                  { title: "Sin anuncios", icon: "shield-checkmark-outline" },
                  { title: "Contenido exclusivo", icon: "star-outline" },
                  {
                    title: "Descargas offline",
                    icon: "cloud-download-outline",
                  },
                  {
                    title: "Estadísticas avanzadas",
                    icon: "stats-chart-outline",
                  },
                ].map((feature, index) => (
                  <View key={index} style={styles.premiumFeatureItem}>
                    <Ionicons
                      name={feature.icon as any}
                      size={22}
                      color="#6B8BFF"
                    />
                    <Text style={styles.premiumFeatureText}>
                      {feature.title}
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4CAF50"
                    />
                  </View>
                ))}
              </View>

              <View style={styles.pricingContainer}>
                <View style={styles.priceCard}>
                  <Text style={styles.planName}>Mensual</Text>
                  <Text style={styles.planPrice}>
                    $99<Text style={styles.planPeriod}>/mes</Text>
                  </Text>
                  <Button
                    mode="outlined"
                    style={[styles.planButton, { borderColor: "#6B8BFF" }]}
                    labelStyle={{ color: "#6B8BFF" }}
                  >
                    Elegir
                  </Button>
                </View>

                <View style={[styles.priceCard, styles.bestValueCard]}>
                  <Badge style={styles.bestValueBadge}>Mejor opción</Badge>
                  <Text style={styles.planName}>Anual</Text>
                  <Text style={styles.planPrice}>
                    $999<Text style={styles.planPeriod}>/año</Text>
                  </Text>
                  <Text style={styles.savingsText}>¡Ahorra un 20%!</Text>
                  <Button
                    mode="contained"
                    style={styles.planButton}
                    buttonColor="#6B8BFF"
                    textColor="#FFFFFF"
                  >
                    Elegir
                  </Button>
                </View>
              </View>

              <TouchableOpacity style={styles.restorePurchaseButton}>
                <Text style={styles.restorePurchaseText}>
                  Restaurar compras
                </Text>
              </TouchableOpacity>
            </Surface>
          </Animated.View>
        )}

        <Animated.View
          style={styles.menuContainer}
          entering={FadeInUp.delay(300).duration(500)}
        >
          <Text style={styles.sectionTitle}>Configuración</Text>

          {renderMenuItem("notifications-outline", "Notificaciones", () =>
            Alert.alert("Notificaciones", "Configura tus notificaciones")
          )}

          {renderMenuItem("moon-outline", "Modo oscuro", () =>
            Alert.alert("Modo oscuro", "Cambia entre modo claro y oscuro")
          )}

          {renderMenuItem("lock-closed-outline", "Privacidad y seguridad", () =>
            Alert.alert("Privacidad", "Configura tus opciones de privacidad")
          )}

          {renderMenuItem("help-circle-outline", "Ayuda y soporte", () =>
            Alert.alert("Ayuda", "Contacta con nuestro equipo de soporte")
          )}

          {renderMenuItem(
            "information-circle-outline",
            "Acerca de Moodly",
            () => Alert.alert("Acerca de", "Versión 1.0.0\nDesarrollado con ♥")
          )}
        </Animated.View>

        <Animated.View
          style={styles.logoutContainer}
          entering={FadeInUp.delay(400).duration(500)}
        >
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E3A59",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8F9BB3",
  },
  profileHeader: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6B8BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6B8BFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#8F9BB3",
    marginBottom: 12,
  },
  editProfileText: {
    color: "#6B8BFF",
    fontWeight: "600",
    fontSize: 14,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statsCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 13,
    color: "#8F9BB3",
    textAlign: "center",
  },
  menuContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "500",
  },
  logoutContainer: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#FF5C8A",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF5C8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  editProfileButton: {
    backgroundColor: "#F0F4FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  premiumButtonText: {
    color: "#2E3A59",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },

  // Nuevos estilos para la sección premium
  premiumSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  premiumHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closePremiumButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    backgroundColor: "#FFFFFF",
  },
  premiumBanner: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  premiumBannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumTextContainer: {
    marginLeft: 16,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  premiumFeatures: {
    padding: 20,
  },
  premiumFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4FF",
  },
  premiumFeatureText: {
    flex: 1,
    fontSize: 16,
    color: "#2E3A59",
    marginLeft: 16,
  },
  pricingContainer: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-between",
  },
  priceCard: {
    width: "47%",
    borderWidth: 1,
    borderColor: "#E4E9F2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  bestValueCard: {
    borderColor: "#6B8BFF",
    borderWidth: 2,
    position: "relative",
    paddingTop: 20,
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: "#FFD700",
    color: "#2E3A59",
    fontSize: 10,
    fontWeight: "bold",
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: "400",
    color: "#8F9BB3",
  },
  savingsText: {
    fontSize: 12,
    color: "#00C853",
    fontWeight: "600",
    marginBottom: 8,
  },
  planButton: {
    width: "100%",
    marginTop: 10,
    borderRadius: 8,
  },
  restorePurchaseButton: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F4FF",
  },
  restorePurchaseText: {
    fontSize: 14,
    color: "#6B8BFF",
  },
  premiumButtonUpdated: {
    borderRadius: 8,
    overflow: "hidden",
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default Perfil;
