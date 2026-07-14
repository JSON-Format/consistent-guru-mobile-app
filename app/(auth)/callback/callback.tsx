
import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/client";
import { THEME } from "@/constants/theme";

export default function CallbackScreen() {
  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    };

    check();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: THEME.COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator
        size="large"
        color={THEME.COLORS.primary}
      />

      <Text
        style={{
          marginTop: 20,
          color: THEME.COLORS.text,
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        Signing you in...
      </Text>
    </View>
  );
}