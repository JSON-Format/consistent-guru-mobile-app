import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Toast from "react-native-toast-message";
WebBrowser.maybeCompleteAuthSession();
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import { router } from "expo-router";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { supabase } from "@/lib/client";

import { THEME } from "@/constants/theme";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {

  const [googleLoading, setGoogleLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // LOGIN
  const onSubmit = async (
    data: LoginFormData
  ) => {

    try {

      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) {

      Toast.show({
  type: "error",
  text1: "Login Failed",
  text2: error.message,
});

        return;
      }

   Toast.show({
  type: "success",
  text1: "Welcome Back 👋",
  text2: "Login successful",
});

      router.replace("/tracker");

    } catch (error) {

    Toast.show({
  type: "error",
  text1: "Error",
  text2: "Something went wrong",
});

    } finally {

      setLoading(false);
    }
  };


    
  
 const handleGoogleLogin = async () => {
  if (googleLoading) return;

  try {
    setGoogleLoading(true);

    const redirectTo = Linking.createURL("callback");


    const { data, error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

    if (error) {
      Toast.show({
        type: "error",
        text1: "Google Sign In Failed",
        text2: error.message,
      });
      return;
    }

if (data?.url) {
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectTo
  );


  if (result.type === "success" && result.url) {
    const parsed = Linking.parse(result.url!.replace("#", "?"));


    const accessToken =
      parsed.queryParams?.access_token as string | undefined;

    const refreshToken =
      parsed.queryParams?.refresh_token as string | undefined;


if (accessToken && refreshToken) {


  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });



  const {
    data: { session },
  } = await supabase.auth.getSession();

  router.replace("/(tabs)");
}
  }
}
  } catch (error) {
    console.log(error);
  } finally {
    setGoogleLoading(false);
  }
};

  return (

    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }

      style={{
        flex: 1,
        backgroundColor:
          THEME.COLORS.background,
      }}
    >

      <StatusBar
        barStyle="light-content"
      />

      <View
        style={{
          flex: 1,

          justifyContent: "center",

          paddingHorizontal: 24,

          paddingVertical: 10,
        }}
      >

        {/* LOGO */}
        <View
          style={{
            alignItems: "center",

            marginBottom: 24,
          }}
        >

          <View
            style={{
              width: 75,
              height: 75,

              borderRadius: 999,

              backgroundColor:
                THEME.COLORS.card,

              justifyContent: "center",

              alignItems: "center",

              borderWidth: 2,

              borderColor:
                THEME.COLORS.primary,

              marginBottom: 12,

              ...THEME.SHADOWS.primary,
            }}
          >

            <Ionicons
              name="lock-closed"

              size={34}

              color={
                THEME.COLORS.primary
              }
            />

          </View>

          <Text
            style={{
              color:
                THEME.COLORS.text,

              fontSize:
                THEME.FONT_SIZES["2xl"],

              fontWeight: "800",

              marginBottom: 6,
            }}
          >
            Welcome Back
          </Text>

          <Text
            style={{
              color:
                THEME.COLORS.textSecondary,

              textAlign: "center",

              fontSize:
                THEME.FONT_SIZES.sm,

              lineHeight: 22,
            }}
          >
            Show Up Today. Win Tomorrow 
          </Text>

        </View>

        {/* EMAIL */}
        <View
          style={{
            marginBottom: 16,
          }}
        >

          <Text
            style={{
              color:
                THEME.COLORS.text,

              marginBottom: 8,

              fontWeight: "600",

              fontSize:
                THEME.FONT_SIZES.sm,
            }}
          >
            Email Address
          </Text>

          <View
            style={{
              flexDirection: "row",

              alignItems: "center",

              backgroundColor:
                THEME.COLORS.card,

              borderRadius:
                THEME.RADIUS.lg,

              borderWidth: 1.5,

              borderColor:
                errors.email
                  ? THEME.COLORS.danger
                  : THEME.COLORS.border,

              paddingHorizontal: 16,

              height: 54,
            }}
          >

            <Ionicons
              name="mail-outline"

              size={20}

              color={
                THEME.COLORS.primary
              }
            />

            <Controller
              control={control}

              name="email"

              rules={{
                required:
                  "Email is required",
              }}

              render={({
                field: {
                  onChange,
                  value,
                },
              }) => (

                <TextInput
                  placeholder="Enter your email"

                  placeholderTextColor={
                    THEME.COLORS.textSecondary
                  }

                  keyboardType="email-address"

                  autoCapitalize="none"

                  value={value}

                  onChangeText={onChange}

                  style={{
                    flex: 1,

                    color:
                      THEME.COLORS.text,

                    marginLeft: 12,

                    fontSize:
                      THEME.FONT_SIZES.base,
                  }}
                />

              )}
            />

          </View>

          {
            errors.email && (
              <Text
                style={{
                  color:
                    THEME.COLORS.danger,

                  marginTop: 6,

                  fontSize:
                    THEME.FONT_SIZES.sm,
                }}
              >
                {
                  errors.email.message
                }
              </Text>
            )
          }

        </View>

        {/* PASSWORD */}
        <View
          style={{
            marginBottom: 10,
          }}
        >

          <Text
            style={{
              color:
                THEME.COLORS.text,

              marginBottom: 8,

              fontWeight: "600",

              fontSize:
                THEME.FONT_SIZES.sm,
            }}
          >
            Password
          </Text>

          <View
            style={{
              flexDirection: "row",

              alignItems: "center",

              backgroundColor:
                THEME.COLORS.card,

              borderRadius:
                THEME.RADIUS.lg,

              borderWidth: 1.5,

              borderColor:
                errors.password
                  ? THEME.COLORS.danger
                  : THEME.COLORS.border,

              paddingHorizontal: 16,

              height: 54,
            }}
          >

            <Ionicons
              name="lock-closed-outline"

              size={20}

              color={
                THEME.COLORS.primary
              }
            />

            <Controller
              control={control}

              name="password"

              rules={{
                required:
                  "Password is required",

                minLength: {
                  value: 6,

                  message:
                    "Minimum 6 characters",
                },
              }}

              render={({
                field: {
                  onChange,
                  value,
                },
              }) => (

                <TextInput
                  placeholder="Enter password"

                  placeholderTextColor={
                    THEME.COLORS.textSecondary
                  }

                  secureTextEntry={
                    !showPassword
                  }

                  value={value}

                  onChangeText={onChange}

                  style={{
                    flex: 1,

                    color:
                      THEME.COLORS.text,

                    marginLeft: 12,

                    fontSize:
                      THEME.FONT_SIZES.base,
                  }}
                />

              )}
            />

            <Pressable
              onPress={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >

              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }

                size={20}

                color={
                  THEME.COLORS.primary
                }
              />

            </Pressable>

          </View>

          {
            errors.password && (
              <Text
                style={{
                  color:
                    THEME.COLORS.danger,

                  marginTop: 6,

                  fontSize:
                    THEME.FONT_SIZES.sm,
                }}
              >
                {
                  errors.password.message
                }
              </Text>
            )
          }

        </View>

        {/* FORGOT PASSWORD */}
        <Pressable
          onPress={() =>
            router.push(
              "/forgot-password"
            )
          }

          style={{
            alignSelf: "flex-end",

            marginBottom: 18,
          }}
        >

          <Text
            style={{
              color:
                THEME.COLORS.primary,

              fontWeight: "600",

              fontSize:
                THEME.FONT_SIZES.sm,
            }}
          >
            Forgot Password?
          </Text>

        </Pressable>

        {/* LOGIN BUTTON */}
        <Pressable
          onPress={
            handleSubmit(onSubmit)
          }

          style={{
            backgroundColor:
              THEME.COLORS.primary,

            height: 54,

            borderRadius:
              THEME.RADIUS.lg,

            justifyContent: "center",

            alignItems: "center",

            marginBottom: 16,

            ...THEME.SHADOWS.primary,
          }}
        >

          <Text
            style={{
              color: "#000",

              fontWeight: "800",

              fontSize:
                THEME.FONT_SIZES.base,
            }}
          >
            {
              loading
                ? "Signing In..."
                : "Sign In"
            }
          </Text>

        </Pressable>

        {/* DIVIDER */}
        <View
          style={{
            flexDirection: "row",

            alignItems: "center",

            marginBottom: 16,
          }}
        >

          <View
            style={{
              flex: 1,

              height: 1,

              backgroundColor:
                THEME.COLORS.border,
            }}
          />

          <Text
            style={{
              color:
                THEME.COLORS.textSecondary,

              marginHorizontal: 10,

              fontWeight: "600",

              fontSize:
                THEME.FONT_SIZES.sm,
            }}
          >
            OR
          </Text>

          <View
            style={{
              flex: 1,

              height: 1,

              backgroundColor:
                THEME.COLORS.border,
            }}
          />

        </View>

        {/* GOOGLE BUTTON */}
        <Pressable
        onPress={handleGoogleLogin}
         disabled={googleLoading}
          style={{
            backgroundColor:
              THEME.COLORS.card,

            borderWidth: 1.5,

            borderColor:
              THEME.COLORS.border,

            height: 54,

            borderRadius:
              THEME.RADIUS.lg,

            justifyContent: "center",

            alignItems: "center",

            flexDirection: "row",
          }}
        >

          <Ionicons
            name="logo-google"

            size={22}

            color={
              THEME.COLORS.primary
            }
          />

          <Text
            style={{
              color:
                THEME.COLORS.text,

              marginLeft: 10,

              fontWeight: "700",

              fontSize:
                THEME.FONT_SIZES.base,
            }}
          >
           <Text>
  {googleLoading
    ? "Signing In..."
    : "Continue with Google"}
</Text>
          </Text>

        </Pressable>

        {/* REGISTER */}
        <Pressable
          onPress={() =>
            router.push("/register")
          }

          style={{
            marginTop: 22,
          }}
        >

          <Text
            style={{
              color:
                THEME.COLORS.textSecondary,

              textAlign: "center",

              fontSize:
                THEME.FONT_SIZES.sm,
            }}
          >
            Don&apos;t have an account?{" "}

            <Text
              style={{
                color:
                  THEME.COLORS.primary,

                fontWeight: "700",
              }}
            >
              Create Account
            </Text>

          </Text>

        </Pressable>

      </View>

    </KeyboardAvoidingView>
  );
}