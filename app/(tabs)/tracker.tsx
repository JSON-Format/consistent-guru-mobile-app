import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Habit } from "@/types/habit";
import { useHabitStore } from "@/store/habitStore";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInDown
} from "react-native-reanimated";
import { supabase } from "../../lib/client";
import { getLocalDate } from "../../lib/date";
import { isTimeValid } from "../../lib/time";
import ActivityCard from "../components/activityCard";
import DeleteModal from "../components/deleteModal";
import SkeletonLoader from "../components/skeletonLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";



const TrackerPage: React.FC = () => {
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const { refresh } = useLocalSearchParams();
  const {
  habits,
  setHabits,
} = useHabitStore();
  const reloadData = useCallback(async (): Promise<Habit[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) return [];

      const { data, error } = await supabase
        .from("habits")
        .select(`
          id,
          name,
          scheduled_time,
          created_at,
          habit_logs (
            id,
            date,
            is_complete,
            completed_time
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

const fetched = data || [];

setHabits(fetched);

await AsyncStorage.setItem(
  "habits",
  JSON.stringify(fetched)
);

return data || [];
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
    
  }, [setHabits]);

  useEffect(() => {
const load = async () => {
  try {
    const cached = await AsyncStorage.getItem("habits");

  if (cached) {
  const cachedHabits = JSON.parse(cached);

 
  setHabits(cachedHabits);

  setLoading(false);
}

    await reloadData();
  } catch (e) {
    console.log(e);
  } finally {
    setLoading(false);
  }
};

    load();
 }, [reloadData, refresh]);

useFocusEffect(
  useCallback(() => {
    const load = async () => {
      await reloadData();
    };

    load();
  }, [reloadData])
);

 const pendingHabits = habits.filter((activity) => {
    const today = getLocalDate();
    const todayLog = activity.habit_logs.find((log) => log.date === today);
    return (
      !todayLog?.is_complete &&
      isTimeValid(activity.scheduled_time)
    );
  });

  const handleMark = async (habitId: string) => {
    const today = getLocalDate();
    const now = new Date().toISOString();

    try {
      const { data: existing } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("habit_logs")
          .update({
            is_complete: true,
            completed_time: now,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("habit_logs").insert([
          {
            habit_id: habitId,
            date: today,
            is_complete: true,
            completed_time: now,
          },
        ]);
      }

     const updatedActivities = habits.map((activity) =>
  activity.id === habitId
    ? {
        ...activity,
        habit_logs: [
          ...activity.habit_logs.filter((log) => log.date !== today),
          {
            id: existing?.id ?? "temp",
            date: today,
            is_complete: true,
            completed_time: now,
          },
        ],
      }
    : activity
);

setHabits(updatedActivities);

await AsyncStorage.setItem(
  "habits",
  JSON.stringify(updatedActivities)
);

    } catch (error) {
      Alert.alert("Error", "Failed to mark habit as complete");
    }
  };

  const handleDelete = (id: string): void => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);

    try {
      await supabase
        .from("habits")
        .delete()
        .eq("id", deleteId);

      setDeleteId(null);
      setDeleteLoading(false);

      const updated = habits.filter(
  (item) => item.id !== deleteId
);

setHabits(updated);

await AsyncStorage.setItem(
  "habits",
  JSON.stringify(updated)
);

      
    } catch (error) {
      Alert.alert("Error", "Failed to delete habit");
      setDeleteLoading(false);
    }
  };

const onRefresh = async () => {
    setRefreshing(true);

    await reloadData();

    setRefreshing(false);
};

  if (loading) {
    return <SkeletonLoader />;
  }

  const renderPendingHabit = ({ item }: { item: Habit }) => {
    const time = new Date(`2000-01-01T${item.scheduled_time}`).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.pendingHabitCard}
      >
        <View style={styles.pendingHabitContent}>
          <View style={styles.pendingHabitLeft}>
            <LinearGradient
              colors={["rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.05)"]}
              style={styles.pendingIconContainer}
            >
              <Feather name="target" size={24} color="#10b981" />
            </LinearGradient>

            <View style={styles.pendingHabitText}>
              <Text style={styles.pendingHabitName}>{item.name}</Text>
              <View style={styles.pendingHabitMeta}>
                <Feather name="clock" size={12} color="#10b981" />
                <Text style={styles.pendingHabitTime}>{time}</Text>
                <View style={styles.readyBadge}>
                  <View style={styles.readyDot} />
                  <Text style={styles.readyBadgeText}>Ready Now</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleMark(item.id)}
            style={styles.markCompleteButton}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.markCompleteGradient}
            >
              <Text style={styles.markCompleteButtonText}>✓ Mark Complete</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderActivity = ({ item }: { item: Habit }) => (
    <View key={item.id} style={styles.activityCardWrapper}>
      <ActivityCard
        activity={item}
        onMark={handleMark}
        onDelete={handleDelete}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>Stay Consistent</Text>
          <Text style={styles.subtitle}>
            Track your daily habits. Every press counts.
          </Text>

          {/* Pending Habits Section */}
          {pendingHabits.length > 0 && (
            <Animated.View 
              entering={FadeInDown.duration(400).delay(100)} 
              style={styles.pendingSection}
            >
              <LinearGradient
                colors={["rgba(16, 185, 129, 0.08)", "rgba(16, 185, 129, 0.02)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pendingGradient}
              >
                <View style={styles.pendingHeader}>
                  <View style={styles.pendingHeaderLeft}>
                    <LinearGradient
                      colors={["rgba(16, 185, 129, 0.15)", "rgba(16, 185, 129, 0.05)"]}
                      style={styles.pendingHeaderIcon}
                    >
                      <Feather name="target" size={22} color="#10b981" />
                    </LinearGradient>
                    <View>
                      <Text style={styles.pendingTitle}>Today's Focus</Text>
                      <Text style={styles.pendingSubtitle}>
                        Complete these habits now
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pendingCount}>
                    <View style={styles.pendingDot} />
                    <Text style={styles.pendingCountText}>
                      {pendingHabits.length} Pending
                    </Text>
                  </View>
                </View>

<FlatList
  data={pendingHabits}
  renderItem={renderPendingHabit}
  keyExtractor={(item) => item.id}
  scrollEnabled={false}
  initialNumToRender={8}
  maxToRenderPerBatch={8}
  windowSize={10}
  removeClippedSubviews
  contentContainerStyle={styles.activitiesList}
/>
              </LinearGradient>
            </Animated.View>
          )}
        </Animated.View>

        {/* Activities List */}
        {habits.length === 0 ? (
          <Animated.View 
            entering={FadeInDown.duration(400).delay(200)} 
            style={styles.emptyState}
          >
            <LinearGradient
              colors={["rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.02)"]}
              style={styles.emptyIconContainer}
            >
              <Feather name="target" size={48} color="#10b981" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No Habits Found</Text>
            <Text style={styles.emptyDescription}>
              You haven't created any habits yet. Start building consistency by
              creating your first habit.
            </Text>
            <TouchableOpacity
             onPress={() => router.push("/createhabit")}
              style={styles.emptyButton}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <Feather name="plus-circle" size={20} color="#ffffff" />
                <Text style={styles.emptyButtonText}>Create Habit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.activitiesContainer}>
            <FlatList
              data={habits}
              renderItem={renderActivity}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.activitiesList}
            />
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for Create Habit */}
      <TouchableOpacity
        onPress={() => router.push("/createhabit")}
        style={styles.fab}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#10b981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#e2e8f0",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  pendingSection: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
    marginBottom: 24,
  },
  pendingGradient: {
    padding: 4,
  },
  pendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16, 185, 129, 0.08)",
  },
  pendingHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pendingHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  pendingSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  pendingCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  pendingCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  pendingHabitCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16, 185, 129, 0.05)",
  },
  pendingHabitContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  pendingHabitLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  pendingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  pendingHabitText: {
    flex: 1,
  },
  pendingHabitName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 4,
  },
  pendingHabitMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  pendingHabitTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  readyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10b981",
  },
  readyBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#10b981",
  },
  markCompleteButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  markCompleteGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  markCompleteButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "600",
  },
  activitiesContainer: {
    marginTop: 8,
  },
  activitiesList: {
    gap: 8,
  },
  activityCardWrapper: {
    marginBottom: 8,
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderStyle: "dashed",
    backgroundColor: "#1a1a2e",
    padding: 32,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 320,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TrackerPage;