import React, { useState } from "react";
import { Habit } from "@/types/habit";
import { useHabitStore } from "@/store/habitStore";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Feather, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router} from "expo-router";
import { getSmartStreak } from "../../lib/streak";
import {
  LEVELS,
  getActivityLevel,
  getNextLevel,
  getLevelProgress,
} from "../../lib/level";

const { width: screenWidth } = Dimensions.get("window");



const Levels: React.FC = () => {

const { habits } = useHabitStore();


  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);






const formattedActivities = React.useMemo(() => {
  return habits.map((a: Habit) => {
    const streak = getSmartStreak(a);

    return {
      ...a,
      streak,
      level: getActivityLevel(streak),
      next: getNextLevel(streak),
      progress: getLevelProgress(streak),
    };
  });
}, [habits]);
  

  const highestLevel = Math.max(
    ...formattedActivities.map((a) => a.level.level),
    1
  );

  const highestLevelData = LEVELS.find(
    (l) => l.level === highestLevel
  );

  const longestStreak = Math.max(
    ...formattedActivities.map((a) => a.streak),
    0
  );

const today = new Date().toLocaleDateString("en-CA");

const toggleActivity = React.useCallback((id: string) => {
  setSelectedActivity((prev) =>
    prev === id ? null : id
  );
}, []);

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: string,
    gradient: [string, string],
    borderColor: string
  ) => {



    
    return (
      <Animated.View
        entering={FadeInDown.duration(400)}
        layout={Layout.springify()}
        style={[styles.statCard, { borderColor }]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statGradient}
        >
          <View style={styles.statContent}>
            <View style={styles.statLeft}>
              <Text style={styles.statTitle}>{title}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
            <View style={[styles.statIconContainer, { backgroundColor: gradient[0] }]}>
              <Text style={styles.statIcon}>{icon}</Text>
            </View>
          </View>
          <View style={styles.statProgressBar}>
            <LinearGradient
              colors={gradient}
              style={[styles.statProgressFill, { width: "60%" }]}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

 const renderLevelCard = (level: any, index: number) => {
  return (
    <Animated.View
      key={level.level}
        entering={FadeInDown.duration(300).delay(index * 50)}
        layout={Layout.springify()}
        style={styles.levelCardWrapper}
      >
        <LinearGradient
          colors={level.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelCardGradient}
        >
          <View style={styles.levelCardContent}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <Text style={styles.levelTitle} numberOfLines={1}>
              {level.title}
            </Text>
            <Text style={styles.levelMinStreak}>{level.minStreak}+ days</Text>
            {(index === 0 || index === 4) && (
              <View style={[
                styles.levelBadge,
                index === 0 ? styles.levelBadgeStart : styles.levelBadgeLegend
              ]}>
                <Text style={styles.levelBadgeText}>
                  {index === 0 ? "START" : "LEGEND"}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderActivityCard = (a: any, index: number) => {
    const isExpanded = selectedActivity === a.id;
    const isCompletedToday = a.habit_logs.some(
      (log: any) => log.date === today && log.is_complete
    );



    return (
      <Animated.View
        key={a.id}
        entering={FadeInDown.duration(400).delay(index * 80)}
        layout={Layout.springify()}
        style={styles.activityCard}
      >
        <TouchableOpacity
          onPress={() => toggleActivity(a.id)}
          activeOpacity={0.9}
          style={styles.activityTouchable}
        >
          <LinearGradient
            colors={["rgba(16, 185, 129, 0.08)", "rgba(16, 185, 129, 0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activityGradient}
          >
            <View style={styles.activityHeader}>
              <View style={styles.activityLeft}>
                <Text style={styles.activityIcon}>{a.icon || '📌'}</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{a.name}</Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityStreak}>{a.streak} day streak</Text>
                    <View style={[
                      styles.activityStatus,
                      isCompletedToday ? styles.statusCompleted : styles.statusPending
                    ]}>
                      <Text style={[
                        styles.activityStatusText,
                        isCompletedToday ? styles.statusTextCompleted : styles.statusTextPending
                      ]}>
                        {isCompletedToday ? "Completed Today" : "Pending Today"}
                      </Text>
                    </View>
                    {a.streak >= 7 && (
                      <View style={styles.streakBadge}>
                        <MaterialIcons name="local-fire-department" size={12} color="#fb923c" />
                        <Text style={styles.streakBadgeText}>Streak</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {a.streak >= 100 && (
                <FontAwesome5 name="crown" size={16} color="#fb7185" />
              )}
            </View>

            {/* Level Badges Grid */}
            <View style={styles.levelBadgesGrid}>
              {LEVELS.map((l: any) => {
                const unlocked = a.streak >= l.minStreak;
                const isCurrent = l.level === a.level.level;

                return (
                  <View key={l.level} style={styles.levelBadgeItem}>
                    <View style={[
                      styles.levelBadgeCircle,
                      unlocked ? styles.levelBadgeUnlocked : styles.levelBadgeLocked,
                      isCurrent && styles.levelBadgeCurrent,
                      unlocked && { backgroundColor: l.color }
                    ]}>
                      {unlocked ? (
                        <Text style={styles.levelBadgeEmoji}>{l.emoji}</Text>
                      ) : (
                        <Feather name="lock" size={12} color="#64748b" />
                      )}
                      {isCurrent && unlocked && (
                        <View style={styles.sparkleBadge}>
                          <MaterialIcons name="auto-awesome" size={8} color="#fbbf24" />
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.levelBadgeLabel,
                      unlocked ? styles.levelBadgeLabelUnlocked : styles.levelBadgeLabelLocked
                    ]}>
                      {l.title}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <View style={styles.progressLevelInfo}>
                  <Text style={styles.progressLevelText}>
                    {a.level.emoji} {a.level.title}
                  </Text>
                  {a.next && (
                    <Text style={styles.progressNextText}>→ {a.next.title}</Text>
                  )}
                </View>
                <Text style={styles.progressDays}>
                  {a.next ? `${a.streak}/${a.next.minStreak} Days` : "🏆 MAX"}
                </Text>
              </View>

              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(a.progress, 100)}%`,
                      backgroundColor: a.level.color,
                    },
                  ]}
                />
              </View>

              {/* Expandable Content */}
              {isExpanded && (
                <Animated.View entering={FadeInDown.duration(300)}>
                  <View style={styles.expandedContent}>
                    <View style={styles.expandedDivider} />
                    <View style={styles.expandedRow}>
                      <Feather name="trending-up" size={14} color="#10b981" />
                      <Text style={styles.expandedDescription}>
                        {a.level.description}
                      </Text>
                    </View>
                    <View style={styles.expandedStats}>
                      <View style={styles.expandedStat}>
                        <Text style={styles.expandedStatLabel}>Current Level</Text>
                        <Text style={styles.expandedStatValue}>
                          {a.level.emoji} {a.level.title}
                        </Text>
                      </View>
                      <View style={styles.expandedStat}>
                        <Text style={styles.expandedStatLabel}>Current Streak</Text>
                        <Text style={styles.expandedStatValue}>
                          {a.streak} Days
                        </Text>
                      </View>
                    </View>
                    {a.next && (
                      <View style={styles.expandedNextInfo}>
                        <Feather name="zap" size={12} color="#fbbf24" />
                        <Text style={styles.expandedNextText}>
                          {a.next.minStreak - a.streak} more days to reach {a.next.title}
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              )}

              {/* Expand Indicator */}
              <View style={styles.expandIndicator}>
                <Feather
                  name="chevron-down"
                  size={16}
                  color="#475569"
                  style={[
                    styles.expandIcon,
                    isExpanded && styles.expandIconRotated,
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        

          <View style={styles.titleContainer}>
            <LinearGradient
              colors={["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.05)"]}
              style={styles.titleIcon}
            >
              <FontAwesome5 name="crown" size={24} color="#fbbf24" />
            </LinearGradient>
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>Achievement Levels</Text>
              <Text style={styles.subtitle}>
                Build streaks to unlock higher levels of mastery
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            "Longest Streak",
            `${longestStreak} Days`,
            "🔥",
            ["rgba(251, 146, 60, 0.2)", "rgba(239, 68, 68, 0.2)"],
            "rgba(251, 146, 60, 0.2)"
          )}
          {renderStatCard(
            "Active Habits",
            formattedActivities.length,
            "🎯",
            ["rgba(16, 185, 129, 0.2)", "rgba(34, 197, 94, 0.2)"],
            "rgba(16, 185, 129, 0.2)"
          )}
          {renderStatCard(
            "Highest Level",
            `${highestLevelData?.emoji} ${highestLevelData?.title}`,
            "👑",
            ["rgba(234, 179, 8, 0.2)", "rgba(245, 158, 11, 0.2)"],
            "rgba(234, 179, 8, 0.2)"
          )}
          {renderStatCard(
            "Levels",
            LEVELS.length,
            "⭐",
            ["rgba(168, 85, 247, 0.2)", "rgba(99, 102, 241, 0.2)"],
            "rgba(168, 85, 247, 0.2)"
          )}
        </View>

        {/* Level Cards */}
        <View style={styles.levelCardsGrid}>
          {LEVELS.map((level, index) => renderLevelCard(level, index))}
        </View>

        {/* Activities */}
        {formattedActivities.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <View style={styles.emptyStar}>
                <Feather name="star" size={16} color="#fbbf24" />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySubtitle}>
              Start tracking your habits to unlock achievements!
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.emptyButton}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <Feather name="zap" size={16} color="#ffffff" />
                <Text style={styles.emptyButtonText}>Add Your First Activity</Text>
                <Feather name="chevron-right" size={14} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.activitiesContainer}>
            {formattedActivities.map((a, index) => (
  <React.Fragment key={a.id}>
    {renderActivityCard(a, index)}
  </React.Fragment>
))}
          </View>
        )}

        {/* Why We Built This */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.footer}>
          <LinearGradient
            colors={["rgba(16, 185, 129, 0.08)", "rgba(16, 185, 129, 0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.footerGradient}
          >
            <View style={styles.footerContent}>
              <View style={styles.footerIcon}>
                <FontAwesome5 name="award" size={20} color="#10b981" />
              </View>
              <View style={styles.footerText}>
                <Text style={styles.footerTitle}>Why We Built This</Text>
                <Text style={styles.footerDescription}>
                  We believe in the power of consistency. Our achievement system is 
                  designed to celebrate your progress, keep you motivated, and turn 
                  your daily habits into meaningful milestones.
                </Text>
                <View style={styles.footerFeatures}>
                  <View style={styles.footerFeature}>
                    <Feather name="check-circle" size={12} color="#10b981" />
                    <Text style={styles.footerFeatureText}>Track progress</Text>
                  </View>
                  <View style={styles.footerFeature}>
                    <Feather name="check-circle" size={12} color="#10b981" />
                    <Text style={styles.footerFeatureText}>Stay motivated</Text>
                  </View>
                  <View style={styles.footerFeature}>
                    <Feather name="check-circle" size={12} color="#10b981" />
                    <Text style={styles.footerFeatureText}>Celebrate wins</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  backText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 42) / 2,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  statGradient: {
    padding: 14,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statLeft: {
    flex: 1,
  },
  statTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#94a3b8",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginTop: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    fontSize: 18,
  },
  statProgressBar: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  statProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  levelCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 24,
  },
  levelCardWrapper: {
    flex: 1,
    minWidth: (screenWidth - 42) / 5,
    borderRadius: 10,
    overflow: "hidden",
  },
  levelCardGradient: {
    padding: 2,
  },
  levelCardContent: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  levelEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  levelTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#e2e8f0",
    textAlign: "center",
  },
  levelMinStreak: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 1,
  },
  levelBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  levelBadgeStart: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  levelBadgeLegend: {
    backgroundColor: "rgba(244, 63, 94, 0.2)",
  },
  levelBadgeText: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#34d399",
  },
  activitiesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  activityCard: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
  },
  activityTouchable: {
    width: "100%",
  },
  activityGradient: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  activityStreak: {
    fontSize: 11,
    color: "#94a3b8",
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  statusPending: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
  },
  activityStatusText: {
    fontSize: 8,
    fontWeight: "600",
  },
  statusTextCompleted: {
    color: "#10b981",
  },
  statusTextPending: {
    color: "#fbbf24",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(251, 146, 60, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  streakBadgeText: {
    fontSize: 7,
    fontWeight: "600",
    color: "#fb923c",
  },
  levelBadgesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 4,
  },
  levelBadgeItem: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  levelBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  levelBadgeUnlocked: {
    borderColor: "rgba(255,255,255,0.2)",
  },
  levelBadgeLocked: {
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    opacity: 0.4,
  },
  levelBadgeCurrent: {
    borderColor: "#fbbf24",
  },
  levelBadgeEmoji: {
    fontSize: 14,
  },
  sparkleBadge: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  levelBadgeLabel: {
    fontSize: 6,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  levelBadgeLabelUnlocked: {
    color: "#94a3b8",
  },
  levelBadgeLabelLocked: {
    color: "#475569",
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLevelInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  progressLevelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  progressNextText: {
    fontSize: 9,
    color: "#94a3b8",
  },
  progressDays: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  expandedContent: {
    marginTop: 10,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
  },
  expandedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  expandedDescription: {
    fontSize: 11,
    color: "#94a3b8",
    flex: 1,
  },
  expandedStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  expandedStat: {
    flex: 1,
  },
  expandedStatLabel: {
    fontSize: 9,
    color: "#64748b",
  },
  expandedStatValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  expandedNextInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expandedNextText: {
    fontSize: 9,
    color: "#64748b",
  },
  expandIndicator: {
    alignItems: "center",
    marginTop: 4,
  },
  expandIcon: {
    transform: [{ rotate: "0deg" }],
  },
  expandIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  emptyState: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  emptyIconContainer: {
    position: "relative",
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyStar: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  footerGradient: {
    padding: 16,
  },
  footerContent: {
    flexDirection: "row",
    gap: 12,
  },
  footerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginBottom: 4,
  },
  footerDescription: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 18,
    marginBottom: 8,
  },
  footerFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  footerFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerFeatureText: {
    fontSize: 10,
    color: "#94a3b8",
  },
});

export default Levels;