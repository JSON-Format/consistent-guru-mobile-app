import React, { useState, useMemo, useEffect } from "react";
import { Habit } from "@/types/habit";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";
import { Feather, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { getSmartStreak } from "../../../lib/streak";
import { getActivityLevel, getNextLevel } from "../../../lib/level";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const { width: screenWidth } = Dimensions.get("window");



interface ActivityCardProps {
  activity: Habit;
  onMark: (id: string) => void;
  onDelete: (id: string) => void;
}

// Helper Functions
const getLocalDate = (date: Date = new Date()): string => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
};

const isTimeValid = (
  scheduled_time?: string,
  now: Date = new Date()
): boolean => {
  if (!scheduled_time) return true;
  const [h, m] = scheduled_time.split(":").map(Number);
  const scheduled = new Date();
  scheduled.setHours(h, m, 0, 0);
  const before = new Date(scheduled.getTime() - 60 * 60 * 1000);
  const after = new Date(scheduled.getTime() + 60 * 60 * 1000);
  return now >= before && now <= after;
};

const getToday = (): string => getLocalDate();

const getMonthGrid = (date: Date): (string | null)[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days: (string | null)[] = [];
  const firstDayIndex = getDay(start);

  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }

  const allDays = eachDayOfInterval({ start, end });
  allDays.forEach((d) => {
    days.push(format(d, "yyyy-MM-dd"));
  });

  return days;
};

const formatTime12 = (time?: string): string => {
  if (!time) return "Not set";
  const [hour, minute] = time.split(":").map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const isMissedDate = (
  day: string,
  activity: Habit, now: Date) => {
  const today = getToday();

  if (day > today) return false;

  if (activity.created_at) {
    const created = activity.created_at.split("T")[0];
    if (day < created) return false;
  }

  if (day < today) return true;

  if (day === today) {
    const todayLog = activity.habit_logs.find((l) => l.date === today);
    if (todayLog?.is_complete) return false;
    if (!activity.scheduled_time) return false;

    const [h, m] = activity.scheduled_time.split(":").map(Number);
    const scheduled = new Date();
    scheduled.setHours(h, m, 0, 0);
    const after = new Date(scheduled.getTime() + 60 * 60 * 1000);
    return now > after;
  }

  return false;
};

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onMark,
  onDelete,
}) => {
  const [showNextLevelTooltip, setShowNextLevelTooltip] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const calendarDays = useMemo(() => getMonthGrid(currentDate), [currentDate]);
  const [now, setNow] = useState(new Date());
  const [hovered, setHovered] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const streak = getSmartStreak(activity);
  const level = getActivityLevel(streak);
  const nextLevel = getNextLevel(streak);
  const daysLeft = nextLevel ? Math.max(0, nextLevel.minStreak - streak) : 0;
  const totalCompleted = activity.habit_logs.filter(
    (log) => log.is_complete
  ).length;
  const todayLog = activity.habit_logs.find((log) => log.date === getToday());
  const done = todayLog?.is_complete || false;
  const isValidTime = isTimeValid(activity.scheduled_time, now);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const handleMonthChange = (monthIndex: number): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setShowMonthPicker(false);
  };

  const handleYearChange = (year: number): void => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const goPrevMonth = (): void => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goNextMonth = (): void => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkComplete = () => {
    if (!isValidTime) {
      Alert.alert("⏰ Please come back at your scheduled time!");
      return;
    }
    if (!done) {
      onMark(activity.id);
    }
  };

  const getDayStatus = (day: string) => {
    const log = activity.habit_logs.find((l) => l.date === day);
    if (log?.is_complete === true) return "completed";
    if (log?.is_complete === false || isMissedDate(day, activity, now))
      return "missed";
    return "pending";
  };

  

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify()}
      style={styles.container}
    >
      {/* Header - Habit Name */}
      <View style={styles.header}>
        <View>
          <Text style={styles.habitName}>{activity.name}</Text>
          <View style={styles.timeContainer}>
            <Feather name="clock" size={14} color="#10b981" />
            <Text style={styles.timeText}>{formatTime12(activity.scheduled_time)}</Text>
           
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(activity.id)}
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Level Badges */}
      <View style={styles.levelContainer}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>
            {level.emoji} {level.title}
          </Text>
        </View>

        {nextLevel && (
          <>
            <Feather name="chevron-right" size={16} color="#475569" />
           <TouchableOpacity
  style={styles.nextLevelBadge}
  onPress={() =>
    setShowNextLevelTooltip(!showNextLevelTooltip)
  }
>
  <Feather name="lock" size={12} color="#64748b" />

  <Text style={styles.nextLevelText}>
    {nextLevel.emoji} {nextLevel.title}
  </Text>

  {showNextLevelTooltip && (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>
        {daysLeft} days to unlock {nextLevel.title}
      </Text>
    </View>
  )}
</TouchableOpacity>
          </>
        )}

        {!nextLevel && (
          <View style={styles.maxLevelBadge}>
            <Text style={styles.maxLevelText}>👑 MAX LEVEL</Text>
          </View>
        )}
      </View>

      {/* Mark as Complete Button - Green Theme */}
      <TouchableOpacity
        onPress={handleMarkComplete}
        disabled={done || !isValidTime}
        style={[
          styles.markButton,
          done && styles.markButtonCompleted,
          !isValidTime && !done && styles.markButtonLocked,
          !done && isValidTime && styles.markButtonActive,
        ]}
      >
        <Text
          style={[
            styles.markButtonText,
            done && styles.markButtonTextCompleted,
            !isValidTime && !done && styles.markButtonTextLocked,
          ]}
        >
          {done ? (
            "✓ Mark as Complete"
          ) : !isValidTime ? (
            "🔒 Locked (Wait for Schedule)"
          ) : (
            "Mark as Complete"
          )}
        </Text>
      </TouchableOpacity>

      {/* Stats Row - Green Theme */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <MaterialIcons name="local-fire-department" size={18} color="#10b981" />
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statSubtext}>days</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <FontAwesome5 name="trophy" size={18} color="#10b981" />
            <Text style={styles.statLabel}>TOTAL DAYS</Text>
          </View>
          <Text style={styles.statValue}>{totalCompleted}</Text>
          <Text style={styles.statSubtext}>completed</Text>
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        {/* Month/Year Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goPrevMonth} style={styles.navButton}>
            <Feather name="chevron-left" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              onPress={() => setShowMonthPicker(!showMonthPicker)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerText}>
                {months[currentDate.getMonth()]}
              </Text>
              <Feather name="chevron-down" size={16} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowYearPicker(!showYearPicker)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerText}>
                {currentDate.getFullYear()}
              </Text>
              <Feather name="chevron-down" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={goNextMonth} style={styles.navButton}>
            <Feather name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Month Picker Dropdown */}
        {showMonthPicker && (
          <View style={styles.pickerDropdown}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {months.map((month, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleMonthChange(idx)}
                  style={[
                    styles.pickerItem,
                    currentDate.getMonth() === idx && styles.pickerItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      currentDate.getMonth() === idx && styles.pickerItemTextActive,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Year Picker Dropdown */}
        {showYearPicker && (
          <View style={styles.pickerDropdown}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => handleYearChange(year)}
                  style={[
                    styles.pickerItem,
                    currentDate.getFullYear() === year && styles.pickerItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      currentDate.getFullYear() === year && styles.pickerItemTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Weekday Headers */}
        <View style={styles.weekdayGrid}>
          {weekDays.map((day, idx) => (
            <View
  key={idx}
  style={styles.weekdayCell}
>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
           if (!day) {
  return (
    <View
      key={index}
      style={styles.emptyCell}
    />
  );
}

            const isToday = day === getToday();
            const status = getDayStatus(day);
            const dayNumber = Number(day.split("-")[2]);

            const getCellStyle = () => {
              if (status === "completed") return styles.cellCompleted;
              if (status === "missed") return styles.cellMissed;
              return styles.cellPending;
            };

            const getTextStyle = () => {
              if (status === "completed") return styles.cellTextCompleted;
              if (status === "missed") return styles.cellTextMissed;
              return styles.cellTextPending;
            };

            return (
              <TouchableOpacity
                key={day}
                onPress={() => setHovered(hovered === day ? null : day)}
            style={[
  styles.cell,
  getCellStyle(),
  isToday && styles.cellToday,
]}
              >
                {status === "completed" ? (
                  <Feather name="check" size={16} color="#ffffff" />
                ) : status === "missed" ? (
                  <Feather name="x" size={16} color="#ef4444" />
                ) : (
                  <Text style={getTextStyle()}>{dayNumber}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendCompleted]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendMissed]} />
            <Text style={styles.legendText}>Missed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendPending]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendToday]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0a0f1a",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  habitName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  timeText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  readyBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10b981",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  levelBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  nextLevelBadge: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    opacity: 0.7,
  },
  nextLevelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  maxLevelBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  maxLevelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#facc15",
  },
  markButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  markButtonActive: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  markButtonCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  markButtonLocked: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#2d2d4a",
  },
  markButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  markButtonTextCompleted: {
    color: "#10b981",
  },
  markButtonTextLocked: {
    color: "#94a3b8",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10b981",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  statSubtext: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  calendarSection: {
    marginTop: 0,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#1e293b",
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  datePickerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  pickerDropdown: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2d2d4a",
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  pickerItemActive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  pickerItemText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  pickerItemTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },
weekdayGrid: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 4,
},
weekdayCell: {
  width: "13%",
  marginHorizontal: "0.64%",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
},
  weekdayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
calendarGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
},
cell: {
  width: "13%",
  aspectRatio: 1,
  marginHorizontal: "0.64%",
  marginBottom: 6,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
},
emptyCell: {
  width: "13%",
  aspectRatio: 1,
  marginHorizontal: "0.64%",
  marginBottom: 6,
},
  cellCompleted: {
    backgroundColor: "#10b981",
  },
  cellMissed: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  cellPending: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderWidth: 1,
    borderColor: "#2d2d4a",
  },
  cellToday: {
    borderWidth: 2,
    borderColor: "#10b981",
  },
  cellTextCompleted: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  cellTextMissed: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
  },
  cellTextPending: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    borderTopWidth: 1,
    paddingTop:8,
    borderTopColor: "rgba(16, 185, 129, 0.1)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendCompleted: {
    backgroundColor: "#10b981",
  },
  legendMissed: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  legendPending: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderWidth: 1,
    borderColor: "#2d2d4a",
  },
  legendToday: {
    borderWidth: 2,
    borderColor: "#10b981",
    backgroundColor: "transparent",
  },
  legendText: {
    fontSize: 11,
    color: "#94a3b8",
  },
tooltip: {
  position: "absolute",
  bottom: "200%",   
  alignSelf: "center",
  backgroundColor: "#111827",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#334155",
  zIndex: 999,
  elevation: 10,
},

tooltipText: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "500",
},
});

export default ActivityCard;