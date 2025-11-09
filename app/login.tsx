import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "./utils/supabase";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) {
      setErrorMessage("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (error) {
        console.log("Error:", error.message);
        
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage(
            "El correo electrónico o la contraseña son incorrectos"
          );
        } else if (error.message.includes("invalid email")) {
          setErrorMessage("Por favor introduce un correo electrónico válido");
        } else if (error.message.includes("User not found")) {
          setErrorMessage("Este usuario no está registrado");
        } else if (error.message.includes("password is required")) {
          setErrorMessage("La contraseña es obligatoria");
        } else if (
          error.message.includes("Password should be at least 6 characters")
        ) {
          setErrorMessage("La contraseña debe tener al menos 6 caracteres");
        } else {
          setErrorMessage("Ha ocurrido un error. Inténtalo de nuevo");
        }
      } else {
        setErrorMessage("");
        console.log("Login exitoso, redirigiendo...");
        
        setTimeout(() => {
          router.replace("/inicio");
        }, 100);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setErrorMessage("Ha ocurrido un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'moodly://login'
        }
      });
      
      if (error) {
        console.error("Error de autenticación con Google:", error.message);
        setErrorMessage("No se pudo iniciar sesión con Google");
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setErrorMessage("Ha ocurrido un error inesperado");
    }
  };

  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6B8BFF" />
      
      <LinearGradient
        colors={["#8489E8", "#6B8BFF"]}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={styles.headerContainer}
              entering={SlideInRight.duration(400)}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View 
              style={styles.logoContainer}
              entering={FadeIn.duration(800)}
            >
              <Image
                style={styles.logo}
                source={require("./assets/images/logoapps.png")}
              />
              <Text style={styles.welcomeBack}>¡Bienvenido de nuevo!</Text>
              <Text style={styles.subtitle}>
                Ingresa tus credenciales para continuar
              </Text>
            </Animated.View>
            
            <Animated.View 
              style={styles.formContainer}
              entering={FadeIn.duration(800).delay(200)}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#8F9BB3" />
                  <TextInput
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrorMessage("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#8F9BB3"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8F9BB3" />
                  <TextInput
                    placeholder="Tu contraseña"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMessage("");
                    }}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    placeholderTextColor="#8F9BB3"
                  />
                  <TouchableOpacity onPress={toggleShowPassword}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#8F9BB3"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => router.push("/forgot-password")}
              >
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#FF5C8A" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>

              <View style={styles.orContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>o</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogleLogin}
              >
                <Image 
                  source={require('./assets/images/google-icon.png')}
                  style={styles.googleIcon}
                  defaultSource={require('./assets/images/google-icon.png')}
                />
                <Text style={styles.googleButtonText}>
                  Continuar con Google
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿Aún no tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.registerLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        <View style={[styles.decorCircle, styles.circle1]} />
        <View style={[styles.decorCircle, styles.circle2]} />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  headerContainer: {
    width: "100%",
    marginTop: Platform.OS === 'ios' ? 10 : 40,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  backButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.0,
    marginBottom: height * 0.03,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  welcomeBack: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E9F2",
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: "#2E3A59",
    marginLeft: 8,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#6B8BFF",
    fontWeight: "600",
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE8EF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF5C8A",
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#6B8BFF",
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6B8BFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    margin: 3,
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E4E9F2",
  },
  orText: {
    marginHorizontal: 12,
    color: "#8F9BB3",
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: "#E4E9F2",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  registerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  registerLink: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 4,
  },
  // Círculos decorativos
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: -1,
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
    bottom: -width * 0.25,
    left: -width * 0.25,
  },
});

export default Login;