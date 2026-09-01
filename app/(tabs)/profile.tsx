import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHabitStore } from "@/store/habitStore";
import { View, Text, StyleSheet, Image,Alert, Pressable, ScrollView, Linking, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { supabase } from "@/lib/client";
import SkeletonLoader from "../components/skeletonLoader";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {

  const [loading, setLoading] = useState(true);
const [session, setSession] = useState<any>(null);
const [user, setUser] = useState<any>(null);

const { setHabits } = useHabitStore();


  useEffect(() => {
    checkUser();
  }, []);

 const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",


onPress: async () => {
  // Clear Zustand store
  setHabits([]);

  // Clear cached habits
  await AsyncStorage.removeItem("habits");

  // Logout from Supabase
  await supabase.auth.signOut();

  Toast.show({
    type: "success",
    text1: "Logged Out 👋",
    text2: "See you again soon!",
  });

  router.replace("/login");
}

      },
    ]
  );
};
const checkUser = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);

    if (session) {
      setUser(session.user);
    }

    setLoading(false);
  } catch (e) {
    console.log(e);
    setLoading(false);
  }
};

if (loading) {
  return <SkeletonLoader />;
}

if (!session) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        backgroundColor: THEME.COLORS.background,
      }}
    >
      <Ionicons
        name="person-circle-outline"
        size={120}
        color={THEME.COLORS.primary}
      />

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: THEME.COLORS.text,
          marginTop: 20,
        }}
      >
        Welcome Guest
      </Text>

      <Text
        style={{
          marginTop: 10,
          textAlign: "center",
          color: THEME.COLORS.textSecondary,
          lineHeight: 22,
        }}
      >
        Login to save your habits, sync your progress and keep your streak safe.
      </Text>

      <Pressable
        onPress={() => router.push("/login")}
        style={{
          marginTop: 30,
          backgroundColor: THEME.COLORS.primary,
          paddingHorizontal: 40,
          paddingVertical: 15,
          borderRadius: 16,
        }}
      >
        <Text
          style={{
            color: "black",
            fontWeight: "700",
            fontSize: 16,
          }}
        >
          Login
        </Text>
      </Pressable>
    </View>
  );
}

  return (
  <ScrollView
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 40 }}
  showsVerticalScrollIndicator={false}
>
  {/* Profile Card */}
  <View
    style={{
      margin: 20,
      backgroundColor: THEME.COLORS.card,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      elevation: 4,
    }}
  >
 {user?.user_metadata?.avatar_url ||
 user?.user_metadata?.picture ? (
  <Image
    source={{
      uri:
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture,
    }}
    style={{
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: THEME.COLORS.primary,
    }}
  />
) : (
  <View
    style={{
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: THEME.COLORS.primary,
      borderWidth: 3,
      borderColor: THEME.COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text
      style={{
        color: "#fff",
        fontSize: 42,
        fontWeight: "700",
      }}
    >
      {user?.email?.charAt(0).toUpperCase() || "?"}
    </Text>
  </View>
)}

    <Text
      style={{
        marginTop: 18,
        fontSize: 24,
        fontWeight: "700",
        color: THEME.COLORS.text,
      }}
    >
      {user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0]}
    </Text>

    <Text
      style={{
        marginTop: 6,
        color: THEME.COLORS.textSecondary,
        fontSize: 15,
      }}
    >
      {user?.email}
    </Text>

  </View>

  <View
  style={{
    marginHorizontal: 20,
    backgroundColor: THEME.COLORS.card,
    borderRadius: 20,
    overflow: "hidden",
  }}
>
  {/* Privacy Policy */}
  <Pressable
  onPress={() =>
  Linking.openURL("https://consistent.guru/privacy-policy")
}
    style={styles.menuItem}
  >
    <View style={styles.menuLeft}>
      <Ionicons
        name="shield-checkmark-outline"
        size={22}
        color={THEME.COLORS.text}
      />

      <Text style={styles.menuText}>
        Privacy Policy
      </Text>
    </View>

    <Ionicons
      name="chevron-forward"
      size={20}
      color={THEME.COLORS.textSecondary}
    />
  </Pressable>

  {/* Terms & Conditions */}
  <Pressable
    onPress={() =>
  Linking.openURL("https://consistent.guru/terms-and-conditions")
}
    style={styles.menuItem}
  >
    <View style={styles.menuLeft}>
      <Ionicons
        name="document-text-outline"
        size={22}
        color={THEME.COLORS.text}
      />

      <Text style={styles.menuText}>
        Terms & Conditions
      </Text>
    </View>

    <Ionicons
      name="chevron-forward"
      size={20}
      color={THEME.COLORS.textSecondary}
    />
  </Pressable>

  {/* Support Center */}
  <Pressable
    onPress={() =>
  Linking.openURL("https://consistent.guru/support")
}
    style={styles.menuItem}
  >
    <View style={styles.menuLeft}>
      <Ionicons
        name="help-circle-outline"
        size={22}
        color={THEME.COLORS.text}
      />

      <Text style={styles.menuText}>
        Support Center
      </Text>
    </View>

    <Ionicons
      name="chevron-forward"
      size={20}
      color={THEME.COLORS.textSecondary}
    />
  </Pressable>

  {/* Account Center */}
  <Pressable
    onPress={() => router.push("../pages/account-center")}
    style={[
      styles.menuItem,
      { borderBottomWidth: 0 },
    ]}
  >
    <View style={styles.menuLeft}>
      <Ionicons
        name="person-circle-outline"
        size={22}
        color={THEME.COLORS.text}
      />

      <Text style={styles.menuText}>
        Account Center
      </Text>
    </View>

    <Ionicons
      name="chevron-forward"
      size={20}
      color={THEME.COLORS.textSecondary}
    />
  </Pressable>
</View>

  {/* Logout */}
  <Pressable
    onPress={handleLogout}
    style={{
      marginHorizontal: 20,
      marginTop: 10,
      backgroundColor: "#E53935",
      borderRadius: 18,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Ionicons
      name="log-out-outline"
      size={22}
      color="#fff"
    />

    <Text
      style={{
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 10,
      }}
    >
      Logout
    </Text>
  </Pressable>
</ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.background,
  },

  header: {
    alignItems: "center",
    marginTop: 30,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: THEME.COLORS.text,
  },

  email: {
    marginTop: 5,
    color: THEME.COLORS.textSecondary,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 30,
  },

  statCard: {
    flex: 1,
    backgroundColor: THEME.COLORS.card,
    marginHorizontal: 5,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },

  statValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: THEME.COLORS.text,
  },

  statLabel: {
    marginTop: 4,
    color: THEME.COLORS.textSecondary,
    fontSize: 12,
  },

  menu: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: THEME.COLORS.card,
    borderRadius: 18,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    marginLeft: 14,
    fontSize: 16,
    color: THEME.COLORS.text,
  },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 35,
    backgroundColor: "#E53935",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 10,
  },
});