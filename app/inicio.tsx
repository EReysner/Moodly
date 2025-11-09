import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import PantallaPrincipal from "./components/PantallaPrincipal";
import Perfil from "./components/Perfil";
import Actividades from "./components/Actividades";
import { View, Text, Animated } from "react-native";
import Comunidad from "./components/comunidad";
import { supabase } from "./utils/supabase";
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ iconName, color, focused }) => {
  const scaleValue = new Animated.Value(focused ? 1.2 : 1);

  Animated.timing(scaleValue, {
    toValue: focused ? 1.2 : 1,
    duration: 200,
    useNativeDriver: true,
  }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <MaterialIcons name={iconName} size={28} color={color} />
    </Animated.View>
  );
};

export default function InicioTabs() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };

    fetchUser();
  }, []);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => {
          let iconName = "home";
          if (route.name === "Inicio") iconName = "home";
          else if (route.name === "Actividades")
            iconName = "add-circle-outline";
          else if (route.name === "Comunidad") iconName = "people";
          else if (route.name === "Perfil") iconName = "person";
          return (
            <TabBarIcon iconName={iconName} color={color} focused={focused} />
          );
        },

        tabBarActiveTintColor: "#1F41BB",
        tabBarInactiveTintColor: "#A1A7B3",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 70,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          paddingBottom: 8,
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={PantallaPrincipal}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Actividades"
        component={Actividades}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Comunidad" options={{ headerShown: false }}>
        {() => <Comunidad user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
