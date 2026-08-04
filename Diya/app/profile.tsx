import React, { useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser, UserProfile } from "../context/UserContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading, refreshUser, setUser } = useUser();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshUser().catch((err: any) => console.error("Failed to refresh profile:", err));
    }, [refreshUser])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove(["authToken", "user", "profileComplete", "loggedIn"]);
            setUser(null);
            router.replace("/auth");
          },
        },
      ]
    );
  };

  if (loading && !user) {
    return (
      <LinearGradient colors={["#021F0F", "#053B24"]} style={styles.centered}>
        <ActivityIndicator color="#22c55e" size="large" />
      </LinearGradient>
    );
  }

  const profile: Partial<UserProfile> = user?.profile || {};

  return (
    <LinearGradient colors={["#021F0F", "#042818", "#053B24"]} style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#021F0F" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#86efac" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
        >
          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 30 }}>👨‍🌾</Text>
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.name}>{user?.fullName || "Farmer"}</Text>
                <Text style={styles.subtext}>{user?.email}</Text>
                {!!user?.phone && <Text style={styles.subtext}>{user.phone}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>Lv.{user?.level ?? 1}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{user?.xp ?? 0}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{user?.greenCoins ?? 0}</Text>
                <Text style={styles.statLabel}>Green Coins</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>🔥{user?.streakDays ?? 0}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Badges</Text>
            {(!user?.badges || user.badges.length === 0) ? (
              <Text style={styles.emptyText}>No badges earned yet</Text>
            ) : (
              <View style={styles.badgeRow}>
                {user.badges.map((b: string, i: number) => (
                  <View key={i} style={styles.badgeChip}>
                    <Text style={styles.badgeText}>🏅 {b}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Farm Details</Text>
              <TouchableOpacity onPress={() => router.push("/farm-profile")}>
                <Feather name="edit-2" size={16} color="#86efac" />
              </TouchableOpacity>
            </View>
            <DetailRow label="Crops" value={profile.primaryCrops?.join(", ") || "Not set"} />
            <DetailRow label="Farm size" value={profile.farmSize ? `${profile.farmSize} acres` : "Not set"} />
            <DetailRow label="Soil type" value={profile.soilType || "Not set"} />
            <DetailRow label="Water source" value={profile.waterAvailability || "Not set"} />
            <DetailRow label="Region" value={profile.region || "Not set"} />
            <DetailRow label="Season" value={profile.season || "Not set"} />
            <DetailRow label="Skill level" value={profile.skillLevel || "Not set"} />
            {!!profile.previousCrop && <DetailRow label="Previous crop" value={profile.previousCrop} />}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
            <Ionicons name="log-out-outline" size={18} color="#fca5a5" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: "rgba(34,197,94,0.2)",
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#053B24",
    borderWidth: 2, borderColor: "#22c55e", alignItems: "center", justifyContent: "center",
  },
  name: { color: "#fff", fontSize: 20, fontWeight: "800" },
  subtext: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  sectionTitle: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { color: "#4ade80", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#94a3b8", fontSize: 11, marginTop: 4 },
  emptyText: { color: "#64748b", fontSize: 13 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap" },
  badgeChip: {
    backgroundColor: "rgba(251,191,36,0.15)", paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, marginRight: 8, marginBottom: 8,
  },
  badgeText: { color: "#fde68a", fontSize: 12, fontWeight: "600" },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
  },
  detailLabel: { color: "#94a3b8", fontSize: 13 },
  detailValue: { color: "#e2e8f0", fontSize: 13, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", marginTop: 4, marginBottom: 20,
  },
  logoutText: { color: "#fca5a5", fontSize: 14, fontWeight: "700", marginLeft: 8 },
});