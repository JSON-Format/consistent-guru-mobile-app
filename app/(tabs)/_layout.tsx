import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image,View,Text } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHabitStore } from "@/store/habitStore";
import { THEME } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {

const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
const [initial, setInitial] = useState("");
const { setHabits } = useHabitStore();
const insets = useSafeAreaInsets();
useEffect(() => {
  loadUser();
  loadHabitCache();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    loadUser();
    loadHabitCache();
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

const loadUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    setAvatarUrl(null);
    setInitial("");
    return;
  }

  const user = session.user;

  setAvatarUrl(
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null
  );

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "";

  setInitial(name.charAt(0).toUpperCase());
};



const loadHabitCache = async () => {
  try {
    const cached = await AsyncStorage.getItem("habits");

    if (cached) {
      setHabits(JSON.parse(cached));
    }
  } catch (error) {
    console.log("Habit cache load error:", error);
  }
};


  return (
    

     <Tabs
      screenOptions={{
        headerShown: true,

        headerStyle: {
          backgroundColor: THEME.COLORS.background,
        },

        headerTintColor: THEME.COLORS.text,

      tabBarStyle: {
  backgroundColor: THEME.COLORS.background,
  borderTopColor: THEME.COLORS.card,

  height: 65 + insets.bottom,
  paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
  paddingTop: 8,
},

        tabBarActiveTintColor: THEME.COLORS.primary,
        tabBarInactiveTintColor: THEME.COLORS.textSecondary,
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* CREATE HABIT */}
      <Tabs.Screen
        name="createhabit"
        options={{
          title: "Create Habit",
          
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />

      {/* TRACKER */}
      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />


      {/* LEVEL */}
<Tabs.Screen
  name="level"
  options={{
    title: "Level",
    tabBarIcon: ({ color, size }) => (
      <Ionicons
        name="trophy"
        size={size}
        color={color}
      />
    ),
  }}
/>



      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
        }}
      />
    );
  }

  if (initial) {
    return (
      <View
        style={{
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
          backgroundColor: THEME.COLORS.primary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: size * 0.6,
          }}
        >
          {initial}
        </Text>
      </View>
    );
  }

  return (
    <Ionicons
      name="person-circle"
      size={size}
      color={color}
    />
  );
},
        }}
      />
    </Tabs>
  );
}