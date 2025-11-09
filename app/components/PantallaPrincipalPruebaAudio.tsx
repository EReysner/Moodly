import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";

export default function PantallaPrincipal() {
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState("");
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      Alert.alert("Grabando", "La grabación ha comenzado");
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar la grabación: " + error.message);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      Alert.alert("Éxito", `Audio guardado en: ${uri}`);
    } catch (error) {
      Alert.alert("Error", "Error al detener la grabación: " + error.message);
    }
  };

  const playRecording = async () => {
    if (!recordedUri) {
      Alert.alert("Error", "No hay audio grabado para reproducir");
      return;
    }

    try {
      const { sound: playbackSound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );
      setSound(playbackSound);
      setIsPlaying(true);

      playbackSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      await playbackSound.playAsync();
    } catch (error) {
      Alert.alert("Error", "Error al reproducir el audio: " + error.message);
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          recording ? styles.stopButton : styles.recordButton,
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {recording ? "🛑 Detener grabación" : "🎤 Comenzar grabación"}
        </Text>
      </TouchableOpacity>

      {recordedUri && (
        <TouchableOpacity
          style={[
            styles.button,
            isPlaying ? styles.stopButton : styles.playButton,
          ]}
          onPress={isPlaying ? stopPlayback : playRecording}
        >
          <Text style={styles.buttonText}>
            {isPlaying ? "⏹ Detener reproducción" : "▶ Reproducir grabación"}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.uriText}>
        {recordedUri
          ? `Audio grabado: ${recordedUri.split("/").pop()}`
          : "Presiona 'Comenzar grabación'"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: "#FF3B30",
  },
  playButton: {
    backgroundColor: "#34C759", 
  },
  stopButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  uriText: {
    marginTop: 20,
    color: "#333",
    fontSize: 14,
    textAlign: "center",
  },
});
