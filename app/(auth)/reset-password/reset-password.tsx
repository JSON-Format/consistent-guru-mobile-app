import { useEffect, useState } from "react";
 import * as Linking from "expo-linking";
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
import Toast from "react-native-toast-message";

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


type ResetFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordScreen() {

 
useEffect(() => {
const handleUrl = async (url: string | null) => {
  // console.log("URL Received:", url);

  if (!url) {
    // console.log("URL is NULL");
    return;
  }

  const parsed = Linking.parse(url.replace("#", "?"));

  // console.log("Parsed:", parsed);

  const accessToken = parsed.queryParams?.access_token;
  const refreshToken = parsed.queryParams?.refresh_token;

  // console.log("Access:", accessToken);
  // console.log("Refresh:", refreshToken);
};

  Linking.getInitialURL().then(handleUrl);

  const sub = Linking.addEventListener("url", ({ url }) => {
    handleUrl(url);
  });

  return () => sub.remove();
}, []);



  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password =
    watch("password");

  // SESSION CHECK
  useEffect(() => {

    const checkSession =
      async () => {

        // const { data } =
        //   await supabase.auth.getSession();

        // if (!data.session) {

        //   Alert.alert(
        //     "Invalid Link",
        //     "Reset link expired"
        //   );

        //   router.replace(
        //     "/forgot-password"
        //   );
        // }
        
      };

    checkSession();

  }, []);

  // UPDATE PASSWORD
  const onSubmit = async (
    data: ResetFormData
  ) => {

    try {

      setLoading(true);
      const {
  data: { session },
} = await supabase.auth.getSession();

// console.log(session);

      const { error } =
        await supabase.auth.updateUser({
          password: data.password,
        });

      if (error) {

      Toast.show({
  type: "error",
  text1: "Update Failed",
  text2: error.message,
});

        return;
      }

     Toast.show({
  type: "success",
  text1: "Password Updated 🔐",
  text2: "Please sign in with your new password.",
});

setTimeout(() => {
  router.replace("/login");
}, 2000);

    } catch (error) {

     Toast.show({
  type: "error",
  text1: "Error",
  text2: "Something went wrong. Please try again.",
});

    } finally {

      setLoading(false);
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

        {/* ICON */}
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
            Set New Password
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
            Choose a strong password{"\n"}
            for your account 🔐
          </Text>

        </View>

        {/* PASSWORD */}
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
            New Password
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
                  placeholder="Enter new password"

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

        {/* CONFIRM PASSWORD */}
        <View
          style={{
            marginBottom: 20,
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
            Confirm Password
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
                errors.confirmPassword
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

              name="confirmPassword"

              rules={{
                required:
                  "Confirm password required",

                validate: (value) =>
                  value === password
                    || "Passwords do not match",
              }}

              render={({
                field: {
                  onChange,
                  value,
                },
              }) => (

                <TextInput
                  placeholder="Confirm password"

                  placeholderTextColor={
                    THEME.COLORS.textSecondary
                  }

                  secureTextEntry={
                    !showConfirm
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
                setShowConfirm(
                  !showConfirm
                )
              }
            >

              <Ionicons
                name={
                  showConfirm
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
            errors.confirmPassword && (
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
                  errors.confirmPassword
                    .message
                }
              </Text>
            )
          }

        </View>

        {/* BUTTON */}
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

            marginBottom: 20,

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
                ? "Updating..."
                : "Update Password"
            }
          </Text>

        </Pressable>

        {/* BACK */}
        <Pressable
          onPress={() =>
            router.push("/login")
          }

          style={{
            marginTop: 8,
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
            ← Back to Sign In
          </Text>

        </Pressable>

      </View>

    </KeyboardAvoidingView>
  );
}