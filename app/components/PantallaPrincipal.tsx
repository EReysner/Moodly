import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";
import { useChatAssistant } from "./hooks/useChatAssistant";
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const { width } = Dimensions.get("window");
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const PantallaPrincipal = () => {
  const {
    messages,
    isLoading: isLoadingMessages,
    addMessage,
    clearMessages,
    setMessages,
  } = useChatAssistant(
    "Hola, soy tu asistente psicológico. ¿Cómo te sientes hoy?"
  );

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);
  
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const recording = useRef(null);
  const timerRef = useRef(null);
  const transcriptionIntervalRef = useRef(null);
  const liveMessageRef = useRef(null);

  const BACKEND_BASE_URL = "";
  const CHAT_URL = `${BACKEND_BASE_URL}`;

  const suggestions = [
    "Me siento triste últimamente",
    "Tengo problemas para dormir",
    "Me cuesta concentrarme",
    "Me siento ansioso",
  ];
  useEffect(() => {
    if (messages.length <= 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setShowSuggestions(false);

    const userMessage = {
      text: text,
      fromUser: true,
      timestamp: new Date(),
    };

    await addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.fromUser ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      conversationHistory.push({
        role: "user",
        parts: [{ text }],
      });

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error al comunicarse con el servidor: ${response.status}`
        );
      }

      const data = await response.json();

      const botMessage = {
        text: data.response || data.message,
        fromUser: false,
        timestamp: new Date(),
        metadata: data.metadata,
      };

      await addMessage(botMessage);
    } catch (error) {
      console.error("Error:", error);

      const errorMessage = {
        text: "Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
        fromUser: false,
        timestamp: new Date(),
        isError: true,
      };

      await addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      setErrorMessage('');
      setLiveTranscript('');
      console.log("Iniciando grabación con transcripción en tiempo real...");
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Se requiere permiso para acceder al micrófono');
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });
      
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 96000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 96000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };
      
      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      recording.current = newRecording;
      setIsRecording(true);
      
      const liveMessage = {
        text: "Escuchando...",
        fromUser: true,
        timestamp: new Date(),
        isVoiceMessage: true,
        isLiveTranscription: true
      };
      
      liveMessageRef.current = liveMessage;
      await addMessage(liveMessage);
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      transcriptionIntervalRef.current = setInterval(async () => {
        try {
          if (recording.current && recordingTime >= 1) {
            const tempRecording = recording.current;
            
            await tempRecording.stopAndUnloadAsync();
            const uri = tempRecording.getURI();
            
            const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
            recording.current = newRecording;
            
            await processLiveTranscription(uri);
          }
        } catch (err) {
          console.error("Error en transcripción parcial:", err);
        }
      }, 3000); 
      
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      setErrorMessage(`Error al iniciar grabación: ${error.message}`);
    }
  };
  
  const processLiveTranscription = async (audioUri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        console.log("Archivo de audio no encontrado");
        return;
      }
      
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      const speechResponse = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: 'audio/m4a',
          partial: true
        }),
        timeout: 5000,
      });
      
      try {
        await FileSystem.deleteAsync(audioUri);
      } catch (e) {
        console.log("No se pudo eliminar archivo temporal", e);
      }
      
      if (!speechResponse.ok) {
        console.log(`Error en transcripción: ${speechResponse.status}`);
        return;
      }
      
      const speechData = await speechResponse.json();
      const partialText = speechData.text || '';
      
      if (partialText.trim()) {
        setLiveTranscript(prev => {
          const newText = prev ? `${prev} ${partialText}` : partialText;
          
          if (liveMessageRef.current) {
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg === liveMessageRef.current ? 
                  { ...msg, text: newText } : 
                  msg
              )
            );
          }
          
          return newText;
        });
      }
    } catch (error) {
      console.error('Error en transcripción en vivo:', error);
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Deteniendo grabación...");
      
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
        transcriptionIntervalRef.current = null;
      }
      
      if (!recording.current) {
        console.log("No hay grabación activa");
        return;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      
      setIsRecording(false);
      recording.current = null;
      
      if (liveTranscript.trim()) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.isLiveTranscription ? 
              { ...msg, isLiveTranscription: false } : 
              msg
          )
        );
        
        await sendMessage(liveTranscript);
        
        setLiveTranscript('');
        liveMessageRef.current = null;
      }
      else if (uri) {
        if (liveMessageRef.current) {
          setMessages(prevMessages => 
            prevMessages.filter(msg => !msg.isLiveTranscription)
          );
          liveMessageRef.current = null;
        }
        
        await processAudioMessage(uri);
      } else {
        setErrorMessage("No se pudo obtener el audio grabado");
      }
      
    } catch (error) {
      console.error('Error al detener la grabación:', error);
      setErrorMessage(`Error al procesar audio: ${error.message}`);
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
        transcriptionIntervalRef.current = null;
      }
      recording.current = null;
      liveMessageRef.current = null;
    }
  };
  
  const processAudioMessage = async (audioUri) => {
    try {
      setIsLoading(true);
      setIsProcessingAudio(true);
      setErrorMessage('');
      
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error("No se encontró el archivo de audio grabado");
      }
      
      const processingMessage = {
        text: "Procesando tu mensaje de voz...",
        fromUser: false,
        timestamp: new Date(),
        isProcessing: true
      };
      
      await addMessage(processingMessage);
      
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      let speechResponse;
      try {
        speechResponse = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: 'audio/m4a'
          }),
          timeout: 15000,
        });
      } catch (fetchError) {
        console.error("Error de conexión:", fetchError);
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
      }
      
      try {
        await FileSystem.deleteAsync(audioUri);
      } catch (deleteError) {
        console.log("No se pudo eliminar archivo temporal:", deleteError);
      }
      
      if (!speechResponse.ok) {
        const statusCode = speechResponse.status;
        
        if (statusCode === 503) {
          throw new Error("El servicio de reconocimiento de voz está temporalmente no disponible. Inténtalo más tarde.");
        } else if (statusCode === 429) {
          throw new Error("Demasiadas solicitudes. Por favor, espera un momento antes de intentar nuevamente.");
        } else if (statusCode >= 500) {
          throw new Error("Error en el servidor. El servicio de reconocimiento de voz está experimentando problemas.");
        } else if (statusCode === 413) {
          throw new Error("El audio es demasiado largo. Intenta con un mensaje más corto.");
        } else {
          throw new Error(`Error en reconocimiento de voz: ${statusCode}`);
        }
      }
      
      const speechData = await speechResponse.json();
      const recognizedText = speechData.text;
      
      if (!recognizedText || recognizedText.trim() === '') {
        throw new Error("No se pudo reconocer ningún texto en el audio. Intenta hablar más claro o en un ambiente con menos ruido.");
      }
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg !== processingMessage)
      );
      
      console.log("Texto reconocido:", recognizedText);
      
      const userMessage = {
        text: recognizedText,
        fromUser: true,
        timestamp: new Date(),
        isVoiceMessage: true
      };
      
      await addMessage(userMessage);
      
      await sendMessage(recognizedText);
      
    } catch (error) {
      console.error('Error al procesar audio:', error);
      
      let errorMsg = error.message;
      if (error.message.includes("500")) {
        errorMsg = "Error en el servidor. El servicio de procesamiento de voz podría estar temporalmente no disponible.";
      } else if (error.message.includes("503")) {
        errorMsg = "El servicio de reconocimiento de voz no está disponible en este momento. Por favor, intenta más tarde o usa el chat de texto.";
      } else if (error.message.includes("timeout")) {
        errorMsg = "La solicitud ha tardado demasiado tiempo. Por favor, intenta con un mensaje más corto.";
      } else if (error.message.includes("No se pudo conectar")) {
        errorMsg = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }
      
      setErrorMessage(`Error: ${errorMsg}`);
      
      const errorMessage = {
        text: "Lo siento, ocurrió un error al procesar tu mensaje de voz. " + errorMsg,
        fromUser: false,
        timestamp: new Date(),
        isError: true
      };
      
      await addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setIsProcessingAudio(false);
    }
  };
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
      }
      
      if (recording.current) {
        try {
          recording.current.stopAndUnloadAsync();
        } catch (error) {
          console.error("Error al limpiar grabación:", error);
        }
      }
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.fromUser;
    const isError = item.isError;
    const isFirst = index === 0;
    const isVoiceMessage = item.isVoiceMessage;
    const isLiveTranscription = item.isLiveTranscription;

    return (
      <Animated.View
        entering={
          isUser
            ? SlideInRight.duration(300).delay(100)
            : FadeIn.duration(400).delay(200)
        }
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Image
              source={require("../assets/images/bot-avatar.png")}
              style={styles.avatar}
              defaultSource={require("../assets/images/bot-avatar.png")}
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser
              ? styles.userBubble
              : isError
              ? styles.errorBubble
              : styles.botBubble,
            isFirst && !isUser && styles.welcomeBubble,
            isLiveTranscription && styles.liveTranscriptionBubble
          ]}
        >
          {isFirst && !isUser && (
            <Text style={styles.welcomeTitle}>Moodly - Asistente</Text>
          )}

          <Text
            style={[
              styles.messageText,
              isUser || isError ? styles.lightText : styles.darkText,
            ]}
          >
            {item.text}
            {isLiveTranscription && (
              <Text style={styles.blinkingCursor}>|</Text>
            )}
          </Text>

          {isVoiceMessage && (
            <View style={styles.voiceMessageIndicator}>
              <Ionicons 
                name="mic" 
                size={12} 
                color={isUser ? "white" : "#6B8BFF"} 
                style={{marginRight: 4}}
              />
              <Text 
                style={[
                  styles.voiceMessageText,
                  isUser ? styles.lightText : {color: "#6B8BFF"}
                ]}
              >
                {isLiveTranscription ? "Transcribiendo..." : "Mensaje de voz"}
              </Text>
            </View>
          )}

          {!isUser && item.metadata && item.metadata.emocion && (
            <View
              style={[
                styles.badgeContainer,
                getEmotionColor(item.metadata.emocion),
              ]}
            >
              <Text style={styles.badgeText}>
                {getEmotionIcon(item.metadata.emocion)} {item.metadata.emocion}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.timeText,
              isUser || isError ? styles.lightText : styles.darkText,
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const getEmotionColor = (emotion) => {
    const emotionColors = {
      Alegría: { backgroundColor: "#4CAF50" },
      Tristeza: { backgroundColor: "#5C6BC0" },
      Enojo: { backgroundColor: "#F44336" },
      Miedo: { backgroundColor: "#FF9800" },
      Sorpresa: { backgroundColor: "#9C27B0" },
      Neutral: { backgroundColor: "#78909C" },
      Ansiedad: { backgroundColor: "#FF7043" },
    };

    return emotionColors[emotion] || { backgroundColor: "#6c757d" };
  };

  const getEmotionIcon = (emotion) => {
    const emotionIcons = {
      Alegría: "😊",
      Tristeza: "😔",
      Enojo: "😠",
      Miedo: "😨",
      Sorpresa: "😮",
      Neutral: "😐",
      Ansiedad: "😰",
    };

    return emotionIcons[emotion] || "🧠";
  };

  const renderFooter = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../assets/images/bot-avatar.png")}
            style={styles.avatar}
            defaultSource={require("../assets/images/bot-avatar.png")}
          />
        </View>
        <View style={styles.loadingBubble}>
          <View style={styles.typingContainer}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (!showSuggestions || messages.length > 1) return null;

    return (
      <Animated.View
        style={styles.suggestionsContainer}
        entering={FadeInUp.duration(500).delay(500)}
      >
        <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
        <View style={styles.suggestionsRow}>
          {suggestions.map((suggestion, index) => (
            <AnimatedTouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => sendMessage(suggestion)}
              entering={FadeIn.duration(400).delay(800 + index * 100)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </AnimatedTouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderErrorMessage = () => {
    if (!errorMessage) return null;

    return (
      <Animated.View 
        style={styles.errorContainer} 
        entering={FadeIn.duration(300)}
      >
        <Ionicons name="alert-circle" size={18} color="#FF5C8A" />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity onPress={() => setErrorMessage('')}>
          <Ionicons name="close-circle" size={18} color="#FF5C8A" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderProcessingAudio = () => {
    if (!isProcessingAudio) return null;

    return (
      <Animated.View 
        style={styles.processingContainer} 
        entering={FadeIn.duration(300)}
      >
        <ActivityIndicator size="small" color="#6B8BFF" style={{marginRight: 8}} />
        <Text style={styles.processingText}>Procesando mensaje de voz...</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#6B8BFF" />

      <View style={styles.container}>
        <Animated.View style={styles.header} entering={FadeIn.duration(400)}>
          <View style={styles.headerLeftContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="analytics-outline" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.headerText}>Asistente Psicológico</Text>
              <Text style={styles.headerSubtext}>
                Siempre a tu lado para ayudarte
              </Text>
            </View>
          </View>

          <View style={styles.headerRightContent}>
            <TouchableOpacity
              style={[styles.voiceModeButton, isVoiceModeActive && styles.voiceModeActive]}
              onPress={() => {
                const newMode = !isVoiceModeActive;
                setIsVoiceModeActive(newMode);
                
                if (newMode) {
                  setErrorMessage("Modo de voz activado. Pulsa el botón para grabar un mensaje.");
                } else {
                  setErrorMessage("Modo de texto activado.");
                }
                setTimeout(() => {
                  setErrorMessage("");
                }, 3000);
              }}
            >
              <Ionicons 
                name={isVoiceModeActive ? "chatbubble-outline" : "mic-outline"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newChatButton}
              onPress={() => {
                clearMessages();
              }}
            >
              <Ionicons name="refresh-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {renderErrorMessage()}

        {renderProcessingAudio()}

        {isLoadingMessages ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#6B8BFF" />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(_, index) => index.toString()}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              ListFooterComponent={renderFooter}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />

            {renderSuggestions()}
          </>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 60}
        >
          {isVoiceModeActive ? (
            <Animated.View
              style={styles.voiceInputContainer}
              entering={FadeInUp.duration(500)}
            >
              {isRecording && (
                <View style={styles.recordingInfo}>
                  <View style={styles.recordingBadge}>
                    <Text style={styles.recordingBadgeText}>REC</Text>
                  </View>
                  <Text style={styles.recordingTime}>
                    {formatRecordingTime(recordingTime)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording ? styles.recordingButton : styles.notRecordingButton,
                  (isLoading || isProcessingAudio) && styles.disabledButton
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isLoading || isProcessingAudio}
              >
                <Ionicons 
                  name={isRecording ? "stop" : "mic"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View
              style={styles.inputContainer}
              entering={FadeInUp.duration(500)}
            >
              <TextInput
                style={styles.input}
                placeholder="Escribe tu mensaje aquí..."
                value={input}
                onChangeText={setInput}
                editable={!isLoading && !isLoadingMessages}
                multiline
                placeholderTextColor="#8F9BB3"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!input.trim() || isLoading || isLoadingMessages) &&
                    styles.disabledButton,
                ]}
                onPress={() => input.trim() && sendMessage(input)}
                disabled={!input.trim() || isLoading || isLoadingMessages}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="paper-plane" size={20} color="white" />
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f0f4ff",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6B8BFF",
    padding: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerLeftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  voiceModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  voiceModeActive: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE8EF",
    margin: 10,
    marginTop: 0,
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: "#FF5C8A",
    fontSize: 14,
    flex: 1,
    marginHorizontal: 8,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6EFFF",
    margin: 10,
    marginTop: 0,
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  processingText: {
    color: "#6B8BFF",
    fontSize: 14,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: "row",
    width: "100%",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  welcomeBubble: {
    backgroundColor: "#F0F4FF",
    borderWidth: 1,
    borderColor: "#E3E5E5",
    maxWidth: "85%",
  },
  welcomeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6B8BFF",
    marginBottom: 6,
  },
  userBubble: {
    backgroundColor: "#6B8BFF",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: "#FF5C8A",
    borderBottomLeftRadius: 4,
  },
  liveTranscriptionBubble: {
    backgroundColor: "#8BA7FF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  lightText: {
    color: "white",
  },
  darkText: {
    color: "#2E3A59",
  },
  blinkingCursor: {
    opacity: 0.7,
    fontWeight: "bold",
  },
  voiceMessageIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  voiceMessageText: {
    fontSize: 10,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.7,
    alignSelf: "flex-end",
  },
  loadingContainer: {
    marginVertical: 8,
    alignItems: "flex-start",
    flexDirection: "row",
  },
  loadingBubble: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#f5f7fa",
    borderBottomLeftRadius: 4,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    width: 52,
    justifyContent: "center",
  },
  typingDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#999",
    marginHorizontal: 3,
    opacity: 0.8,
  },
  badgeContainer: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 40,
    maxHeight: 100,
    color: "#2E3A59",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e3e5e5",
  },
  sendButton: {
    backgroundColor: "#6B8BFF",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 18,
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceInputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingButton: {
    backgroundColor: "#FF5C8A",
  },
  notRecordingButton: {
    backgroundColor: "#6B8BFF",
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
    padding: 8,
    borderRadius: 16,
    marginRight: 16,
  },
  recordingBadge: {
    backgroundColor: "#FF5C8A",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  recordingBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  recordingTime: {
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
  suggestionsContainer: {
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 8,
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  suggestionChip: {
    backgroundColor: "#F0F4FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: "#E3E5E5",
  },
  suggestionText: {
    color: "#6B8BFF",
    fontSize: 13,
  },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B8BFF",
    fontSize: 16,
  },
});

export default PantallaPrincipal;