import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={ZoomIn.duration(300)}
          exiting={ZoomOut.duration(300)}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Feather name="trash-2" size={20} color="#ef4444" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Delete Habit</Text>
                <Text style={styles.subtitle}>This action is permanent</Text>
              </View>
            </View>

            {/* Warning Message */}
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                Are you sure? This habit and all its progress will be permanently deleted.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton]}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                style={[styles.button, styles.deleteButton]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2d2d4a",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  warningContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.1)",
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#2d2d4a",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e2e8f0",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
});

export default DeleteModal;