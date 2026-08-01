import { useEffect } from "react";
import { Stack, router } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/client";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  useEffect(() => {
    const handleUrl = async (url: string) => {
  
      const parsed = Linking.parse(url.replace("#", "?"));
    
      const accessToken = parsed.queryParams?.access_token as string | undefined;
      const refreshToken = parsed.queryParams?.refresh_token as string | undefined;
      const type = parsed.queryParams?.type as string | undefined;
    

if (type === "recovery") {
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    console.log("SET SESSION:", error);
  }

  router.replace("/reset-password");
} else if (type === "signup") {

  // Email verification
  router.replace("/login");

} else {

  // Google OAuth / future OAuth
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    console.log("SET SESSION:", error);
  }
  const {
  data: { session },
} = await supabase.auth.getSession();

console.log("SESSION:", session);

  router.replace("/(tabs)");
}
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const sub = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => sub.remove();
  }, []);

    return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );

}