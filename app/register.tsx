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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "./utils/supabase";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    try {
      if (!name || !email || !password) {
        setErrorMessage("Todos los campos son obligatorios.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage("El formato del correo electrónico no es válido.");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      setIsLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        handleAuthError(authError);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("usuarios")
          .insert([{ 
            id: authData.user.id, 
            nombre: name.trim(), 
            email: email.trim()
          }]);

        if (profileError) {
          setErrorMessage("Error al guardar el perfil de usuario.");
          console.error("Error saving profile:", profileError);
          return;
        }

        console.log("Usuario registrado y perfil guardado:", authData.user);
        setErrorMessage("");
        
        setTimeout(() => {
          router.replace("/inicio");
        }, 100);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ha ocurrido un error inesperado");
      console.error("Error inesperado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    console.log("Auth error:", error.message);
    
    if (error.message.includes("User already registered")) {
      setErrorMessage("Este correo electrónico ya está registrado.");
    } else if (error.message.includes("invalid email")) {
      setErrorMessage("El correo electrónico no es válido.");
    } else if (error.message.includes("password is required")) {
      setErrorMessage("La contraseña es obligatoria.");
    } else if (
      error.message.includes("Password should be at least 6 characters")
    ) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
    } else {
      setErrorMessage("Error de registro: " + error.message);
    }
  };

  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      router.replace("/");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'moodly://register'
        }
      });
      
      if (error) {
        console.error("Error de autenticación con Google:", error.message);
        setErrorMessage("No se pudo registrar con Google");
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setErrorMessage("Ha ocurrido un error inesperado");
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
              <Text style={styles.welcomeText}>Crear una cuenta</Text>
              <Text style={styles.subtitle}>
                Únete a Moodly y comienza tu viaje hacia el bienestar
              </Text>
            </Animated.View>
            
            <Animated.View 
              style={styles.formContainer}
              entering={FadeIn.duration(800).delay(200)}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#8F9BB3" />
                  <TextInput
                    placeholder="Tu nombre"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setErrorMessage("");
                    }}
                    style={styles.input}
                    placeholderTextColor="#8F9BB3"
                  />
                </View>
              </View>

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
                    placeholder="Crea una contraseña segura"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMessage("");
                    }}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    placeholderTextColor="#8F9BB3"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#8F9BB3"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.passwordHint}>
                  La contraseña debe tener al menos 6 caracteres
                </Text>
              </View>
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#FF5C8A" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Crear cuenta</Text>
                )}
              </TouchableOpacity>

              <View style={styles.orContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>o</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
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

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.termsText}>
              Al registrarte, aceptas nuestros{" "}
              <Text style={styles.termsLink}>Términos de Servicio</Text> y{" "}
              <Text style={styles.termsLink}>Política de Privacidad</Text>
            </Text>
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
    paddingBottom: 30,
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
    marginTop: height * 0.01,
    marginBottom: height * 0.03,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  welcomeText: {
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
    paddingHorizontal: 20,
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
  passwordHint: {
    fontSize: 12,
    color: "#8F9BB3",
    marginTop: 6,
    marginLeft: 2,
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
  registerButton: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  loginLink: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 4,
  },
  termsText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 16,
    marginHorizontal: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: "#FFFFFF",
    fontWeight: "600",
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

export default Register;