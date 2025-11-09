import { useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { supabase } from "./utils/supabase";
import {
  useFonts,
  Poppins_700Bold,
  Poppins_500Medium,
  Poppins_400Regular,
} from "@expo-google-fonts/poppins";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_500Medium,
    Poppins_400Regular,
  });

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/inicio");
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.push("/inicio");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#6B8BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B8BFF" />

      <LinearGradient
        colors={["#8489E8", "#6B8BFF"]}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={styles.contentContainer}
          entering={FadeIn.duration(800)}
        >
          <Animated.View
            style={styles.logoContainer}
            entering={SlideInUp.delay(300).springify()}
          >
            <Image
              style={styles.logo}
              source={require("./assets/images/logoapps.png")}
            />
            <Text style={styles.appSubtitle}>Cuida tu bienestar emocional</Text>
          </Animated.View>

          <Animated.View
            style={styles.cardContainer}
            entering={SlideInUp.delay(500).springify()}
          >
            <View style={styles.card}>
              <Text style={styles.welcomeTitle}>¡Te damos la bienvenida!</Text>
              <Text style={styles.welcomeText}>
                Comienza tu viaje hacia un mejor bienestar emocional con
                técnicas de meditación, ejercicios de respiración y más.
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/register")}
                style={styles.primaryButton}
              >
                <LinearGradient
                  colors={["#8489E8", "#6B8BFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Comenzar</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/login")}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  ¿Ya tienes una cuenta?{" "}
                  <Text style={styles.boldText}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>

        <View style={[styles.decorCircle, styles.circle1]} />
        <View style={[styles.decorCircle, styles.circle2]} />
        <View style={[styles.decorCircle, styles.circle3]} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#8489e8",
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: height * 0.12,
    paddingBottom: 0,
    position: "relative",
    zIndex: 2,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    resizeMode: "contain",
    marginBottom: height * 0.02,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 10,
  },
  cardContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 40,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
    color: "#2E3A59",
    marginBottom: 16,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Poppins_400Regular",
    color: "#8F9BB3",
    marginBottom: 30,
    textAlign: "center",
  },
  primaryButton: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#6B8BFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Poppins_500Medium",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#2E3A59",
  },
  boldText: {
    fontWeight: "600",
    fontFamily: "Poppins_500Medium",
    color: "#6B8BFF",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.5,
    height: width * 0.5,
    bottom: height * 0.35,
    left: -width * 0.25,
  },
  circle3: {
    width: width * 0.3,
    height: width * 0.3,
    top: height * 0.2,
    right: -width * 0.05,
  },
});
