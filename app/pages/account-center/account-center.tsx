import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { THEME } from "@/constants/theme";
import { supabase } from "@/lib/client";
import { useHabitStore } from "@/store/habitStore";
import Toast from "react-native-toast-message";

export default function AccountCenterScreen() {
  const [deleting, setDeleting] = useState(false);

  const { setHabits } = useHabitStore();

  /**
   * Opens the final confirmation dialog.
   */
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account?",
      "Your account and associated data will be permanently deleted. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: deleteAccount,
        },
      ]
    );
  };

  /**
   * IMPORTANT:
   * The actual Supabase Auth user deletion must happen server-side.
   *
   * Do NOT put SUPABASE_SERVICE_ROLE_KEY inside the mobile app.
   */
const deleteAccount = async () => {
  try {
    setDeleting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No active session found.");
    }

    console.log("Calling delete-account function...");

    const { data, error } = await supabase.functions.invoke(
      "delete-account",
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    console.log("Delete function data:", data);
    console.log("Delete function error:", error);

    if (error) {
      if (error.context) {
        try {
          const responseBody = await error.context.json();

          console.log(
            "EDGE FUNCTION RESPONSE:",
            responseBody
          );

          throw new Error(
            responseBody?.error ||
              responseBody?.message ||
              error.message
          );
        } catch (responseError: any) {
          if (responseError?.message) {
            throw responseError;
          }

          throw error;
        }
      }

      throw error;
    }

    if (!data?.success) {
      throw new Error(
        data?.error || "Unable to delete your account."
      );
    }

    console.log("Account deleted successfully.");

    await clearLocalDataAndLogout();

  } catch (error: any) {
    console.log("Delete account error:", error);

    Toast.show({
      type: "error",
      text1: "Deletion failed",
      text2:
        error?.message ||
        "Unable to delete your account. Please try again.",
    });
  } finally {
    setDeleting(false);
  }
};

  /**
   * Clears local app data after successful account deletion.
   * We will call this after the backend confirms deletion.
   */
  const clearLocalDataAndLogout = async () => {
    setHabits([]);

    await AsyncStorage.removeItem("habits");

    await supabase.auth.signOut();

    Toast.show({
      type: "success",
      text1: "Account Deleted",
      text2: "Your account has been permanently deleted.",
    });

    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={THEME.COLORS.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>Account Center</Text>

        <View style={styles.headerSpacer} />
      </View> */}

     <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.content}
>
  {/* Page Title */}
  <View style={styles.pageHeader}>
    <Pressable
      onPress={() => router.back()}
      style={styles.backButton}
      hitSlop={10}
    >
      <Ionicons
        name="chevron-back"
        size={24}
        color={THEME.COLORS.text}
      />
    </Pressable>

    <Text style={styles.headerTitle}>
      Account Center
    </Text>
  </View>


        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, styles.dangerSectionTitle]}>
          Danger Zone
        </Text>

        <View style={styles.dangerCard}>
          <View style={styles.dangerIconContainer}>
            <Ionicons
              name="trash-outline"
              size={22}
              color="#E53935"
            />
          </View>

          <View style={styles.dangerContent}>
            <Text style={styles.dangerTitle}>
              Delete My Account
            </Text>

            <Text style={styles.dangerDescription}>
              Permanently delete your account and all associated
              data. This action cannot be undone.
            </Text>

            <Pressable
              onPress={handleDeleteAccount}
              disabled={deleting}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
                deleting && styles.deleteButtonDisabled,
              ]}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color="#E53935"
                />
              ) : (
                <>
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color="#E53935"
                  />

                  <Text style={styles.deleteButtonText}>
                    Delete Account
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Information */}
        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={THEME.COLORS.textSecondary}
          />

          <Text style={styles.infoText}>
            Deleting your account permanently removes your account
            and associated data. You will not be able to recover it
            after deletion.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.background,
  },

pageHeader: {

  flexDirection: "row",
  alignItems: "center",
  marginBottom: 28,
  marginTop: 28,
},

backButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
},

headerTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: THEME.COLORS.text,
},



  headerSpacer: {
    width: 40,
  },

 

  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 50,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.COLORS.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  dangerSectionTitle: {
    marginTop: 30,
  },

  card: {
    backgroundColor: THEME.COLORS.card,
    borderRadius: 20,
    overflow: "hidden",
  },

  menuItem: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  menuTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.COLORS.text,
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 12.5,
    color: THEME.COLORS.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginLeft: 71,
  },

  dangerCard: {
    backgroundColor: THEME.COLORS.card,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
  },

  dangerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "rgba(229,57,53,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  dangerContent: {
    flex: 1,
    marginLeft: 14,
  },

  dangerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E53935",
  },

  dangerDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: THEME.COLORS.textSecondary,
  },

  deleteButton: {
    marginTop: 16,
    minHeight: 42,
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(229,57,53,0.45)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  deleteButtonPressed: {
    opacity: 0.65,
  },

  deleteButtonDisabled: {
    opacity: 0.5,
  },

  deleteButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#E53935",
  },

  infoContainer: {
    flexDirection: "row",
    marginTop: 18,
    paddingHorizontal: 4,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 18,
    color: THEME.COLORS.textSecondary,
  },
});