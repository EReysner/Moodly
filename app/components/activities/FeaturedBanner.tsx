import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const FeaturedBanner = ({ currentCategory }) => {
  const getBannerContent = () => {
    switch (currentCategory.id) {
      case "1":
        return {
          title: "Mejora tu concentración",
          description: `${currentCategory.activities.length} actividades para tu bienestar emocional`,
          icon: currentCategory.tabIcon,
          action: "Explorar"
        };
      case "2":
        return {
          title: "Reduce tu estrés",
          description: `${currentCategory.activities.length} ejercicios para aliviar la tensión`,
          icon: currentCategory.tabIcon,
          action: "Comenzar"
        };
      case "3":
        return {
          title: "Aprende más sobre bienestar",
          description: `${currentCategory.activities.length} lecturas para tu crecimiento personal`,
          icon: currentCategory.tabIcon,
          action: "Leer"
        };
      case "4":
        return {
          title: "Mejora tu ambiente",
          description: `${currentCategory.activities.length} sonidos para crear el espacio ideal`,
          icon: currentCategory.tabIcon,
          action: "Escuchar"
        };
      default:
        return {
          title: "Descubre actividades",
          description: "Encuentra lo que necesitas para mejorar tu día",
          icon: "analytics-outline",
          action: "Explorar"
        };
    }
  };

  const content = getBannerContent();

  return (
    <Animated.View 
      style={styles.featuredContainer}
      entering={FadeIn.duration(400)}
    >
      <View 
        style={[
          styles.featuredGradient, 
          {backgroundColor: `${currentCategory.color}20`}
        ]}
      >
        <View style={styles.featuredContent}>
          <View style={styles.featuredTextContent}>
            <Text style={styles.featuredTitle}>{content.title}</Text>
            <Text style={styles.featuredDescription}>{content.description}</Text>
            <TouchableOpacity 
              style={[
                styles.featuredButton,
                {backgroundColor: currentCategory.color}
              ]}
            >
              <Text style={styles.featuredButtonText}>{content.action}</Text>
            </TouchableOpacity>
          </View>
          <View style={[
            styles.featuredIconContainer,
            {backgroundColor: `${currentCategory.color}30`}
          ]}>
            <Ionicons name={content.icon} size={50} color={currentCategory.color} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  featuredContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredGradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredContent: {
    flexDirection: "row",
    padding: 20,
  },
  featuredTextContent: {
    flex: 1,
    paddingRight: 10,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: "#4D5A76",
    marginBottom: 12,
    lineHeight: 20,
  },
  featuredButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  featuredButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  featuredIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  }
});

export default FeaturedBanner;