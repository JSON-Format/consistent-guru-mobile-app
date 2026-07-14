import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

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

type ForgotFormData = {
  email: string;
};

export default function ForgotPasswordScreen() {

  const [loading, setLoading] =
    useState(false);

  const [timer, setTimer] =
    useState(0);

  const [sent, setSent] =
    useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    defaultValues: {
      email: "",
    },
  });

  // TIMER
  useEffect(() => {

    if (timer === 0) return;

    const interval =
      setInterval(() => {

        setTimer((prev) => prev - 1);

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [timer]);

  // SEND RESET LINK
  const onSubmit = async (
    data: ForgotFormData
  ) => {

    try {

      setLoading(true);

  const { error } =
  await supabase.auth.resetPasswordForEmail(
    data.email,
    {
      redirectTo: "consistent-guru://callback",
    }
  );

if (error) {
  Toast.show({
    type: "error",
    text1: "Reset Failed",
    text2: error.message,
  });
  return;
}

    Toast.show({
  type: "success",
  text1: "Check Your Email 📧",
  text2: "Password reset link sent. Please check your inbox.",
});

      setSent(true);

      setTimer(30);

    } catch (error) {

    Toast.show({
  type: "error",
  text1: "Request Failed",
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
              name="mail"

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
            Forgot Password
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
            Enter your email and
            we'll send a reset link
          </Text>

        </View>

        {/* EMAIL */}
        <View
          style={{
            marginBottom: 18,
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

          {
            sent && (
              <Text
                style={{
                  color:
                    THEME.COLORS.success,

                  marginTop: 10,

                  textAlign: "center",

                  fontSize:
                    THEME.FONT_SIZES.sm,
                }}
              >
                Reset link sent successfully 
              </Text>
            )
          }

        </View>

        {/* BUTTON */}
        <Pressable
          disabled={
            loading || timer > 0
          }

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

            opacity:
              loading || timer > 0
                ? 0.6
                : 1,

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
                ? "Sending..."

                : timer > 0
                ? `Send Again in ${timer}s`

                : "Send Reset Link"
            }
          </Text>

        </Pressable>

        {/* BACK LOGIN */}
        <Pressable
          onPress={() =>
            router.push("/login")
          }

          style={{
            marginTop: 24,
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