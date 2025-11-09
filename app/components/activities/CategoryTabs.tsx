import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const CategoryTabs = ({
  categories,
  activeCategory,
  setActiveCategory,
  setSearchQuery,
}) => {
  return (
    <View style={styles.tabBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tabItem,
              activeCategory === category.id && styles.activeTabItem,
            ]}
            onPress={() => {
              setActiveCategory(category.id);
              setSearchQuery("");
            }}
          >
            <View
              style={[
                styles.tabGradient,
                activeCategory === category.id && {
                  backgroundColor: `${category.color}20`,
                },
              ]}
            >
              <Ionicons
                name={category.tabIcon}
                size={20}
                color={
                  activeCategory === category.id ? category.color : "#A0A0A0"
                }
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  activeCategory === category.id && {
                    ...styles.activeTabText,
                    color: category.color,
                  },
                ]}
              >
                {category.title}
              </Text>
            </View>
            {activeCategory === category.id && (
              <View
                style={[
                  styles.tabIndicator,
                  { backgroundColor: category.color },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    position: "relative",
  },
  activeTabItem: {
  },
  tabGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8F9BB3",
  },
  activeTabText: {
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    width: "50%",
    height: 3,
    borderRadius: 1.5,
  },
});

export default CategoryTabs;
