
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { DimensionValue } from "react-native";


type SkeletonBoxProps = {
  width: DimensionValue;
  height: number;
  radius?: number;
};

const SkeletonBox = ({
  width,
  height,
  radius = 8,
}: SkeletonBoxProps) => (
  <View
    style={{
      width,
      height,
      borderRadius: radius,
      backgroundColor: "#1e293b",
    }}
  />
);

export default function SkeletonLoader() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width={220} height={34} radius={8} />
        <View style={{ height: 12 }} />
        <SkeletonBox width={180} height={16} radius={6} />
      </View>

      {/* Activity Cards */}
      {[1,2].map((item) => (
        <View key={item} style={styles.card}>
          <SkeletonBox width={150} height={22} />
          <View style={{ height: 10 }} />
          <SkeletonBox width={120} height={14} />

          <View style={{ height: 20 }} />

          <SkeletonBox width={"100%"} height={48} radius={12} />

          <View style={styles.stats}>
            <SkeletonBox width={"47%"} height={90} radius={12} />
            <SkeletonBox width={"47%"} height={90} radius={12} />
          </View>

          <View style={{ height: 20 }} />

          <SkeletonBox width={"100%"} height={260} radius={16} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  pendingSection: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  pendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  pendingHabit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  
});

