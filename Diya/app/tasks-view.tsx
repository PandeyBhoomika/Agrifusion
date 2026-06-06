import React from "react";
import { SafeAreaView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import TasksContent from "./(tabs)/tasks";


export default function TasksView() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <TasksContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f59e0b",
  },
  safeArea: {
    backgroundColor: "#f59e0b",
    zIndex: 10,
  },
  header: {
    padding: 16,
    backgroundColor: "#f59e0b",
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});