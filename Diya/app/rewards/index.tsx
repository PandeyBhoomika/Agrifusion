import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated as RNAnimated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown, ZoomIn } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

/* ---------------------- STATIC DATA ---------------------- */
const badges = [
  { id: "b1", name: "Water Saver", status: "unlocked", icon: "💧" },
  { id: "b2", name: "Soil Guardian", status: "unlocked", icon: "🛡️" },
  { id: "b3", name: "Pest Control", status: "unlocked", icon: "🐛" },
  { id: "b4", name: "Organic Hero", status: "locked", icon: "🌱" },
  { id: "b5", name: "Carbon Smart", status: "locked", icon: "♻️" },
  { id: "b6", name: "Harvest King", status: "locked", icon: "🧺" },
];

const recentActivity = [
  { id: "ra1", action: "Harvested Tomatoes", xp: "+50 XP", coins: "+10", time: "2h ago" },
  { id: "ra2", action: "Water Conservation", xp: "+20 XP", coins: "+5", time: "5h ago" },
  { id: "ra3", action: "Daily Login Streak", xp: "+15 XP", coins: "+0", time: "1d ago" },
];

const { width } = Dimensions.get("window");

/* ================================================================
   REWARDS SCREEN
================================================================ */

export default function RewardsScreen() {
  const [userData, setUserData] = useState({
    level: 1,
    xp: 0,
    xpToNext: 100,
    greenCoins: 0,
    rankTier: "Bronze Starter",
  });
  const [loading, setLoading] = useState(true);
  const [chestClaimed, setChestClaimed] = useState(false);
  const [coinsDisplay, setCoinsDisplay] = useState(0);

  // Confetti animation (emoji falling)
  const [confetti] = useState(new RNAnimated.Value(0));

  // Fetch real data from the API profile endpoint
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // NOTE: Replace with your absolute backend URL if not using a network proxy/wrapper
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (data) {
        setUserData({
          level: data.level ?? 1,
          xp: data.xp ?? 0,
          xpToNext: data.xpToNext ?? 100,
          greenCoins: data.greenCoins ?? 0,
          rankTier: data.rankTier ?? "Silver Farmer",
        });
        setCoinsDisplay(data.greenCoins ?? 0);
      }
    } catch (error) {
      console.error("Error fetching user profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti.setValue(0);
    RNAnimated.timing(confetti, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  };

  const handleClaimChest = () => {
    if (chestClaimed) return;
    setChestClaimed(true);
    setCoinsDisplay(prev => prev + 50); // Animate coin change
    triggerConfetti();
  };

  /* ---------------------- Circular Math ---------------------- */
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = userData.xpToNext > 0 ? userData.xp / userData.xpToNext : 0;
  const strokeDashoffset = circumference - circumference * Math.min(Math.max(progressPercent, 0), 1);

  /* ---------------------- Confetti Style ---------------------- */
  const confettiTranslateY = confetti.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 800],
  });

  if (loading) {
    return (
      <LinearGradient colors={["#021F0F", "#042818", "#053B24"]} style={styles.centeredContainer}>
        <StatusBar style="light" backgroundColor="#021F0F" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Fetching profile...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#021F0F", "#042818", "#053B24"]} style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor="#021F0F" />
      <SafeAreaView style={styles.safe}>

        {/* EMOJI CONFETTI */}
        <RNAnimated.Text
          style={[
            styles.confetti,
            { transform: [{ translateY: confettiTranslateY }] },
          ]}
        >
          🎉🪙✨
        </RNAnimated.Text>

        {/* --- HEADER --- */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>Your Rewards 🏆</Text>
          <Text style={styles.headerSubtitle}>Level up and earn green coins</Text>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* ---------------- LEVEL & XP RING ---------------- */}
          <Animated.View entering={ZoomIn.delay(100).duration(500)} style={styles.ringSection}>
            <View style={styles.ringContainer}>
              <Svg width={200} height={200}>
                {/* Background Track */}
                <Circle
                  cx={100} cy={100} r={radius}
                  stroke="rgba(251, 191, 36, 0.1)" // Faded amber
                  strokeWidth={strokeWidth} fill="none"
                />
                {/* Amber/Gold Progress Ring */}
                <Circle
                  cx={100} cy={100} r={radius}
                  stroke="#fbbf24" // Solid gold/amber
                  strokeWidth={strokeWidth} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90" origin="100, 100"
                />
              </Svg>
              <View style={styles.ringInner}>
                <Text style={styles.levelNumber}>Lv {userData.level}</Text>
                <Text style={styles.xpFraction}>{userData.xp} / {userData.xpToNext}</Text>
                <Text style={styles.xpLabel}>XP Earned</Text>
              </View>
            </View>
            <View style={styles.rankPill}>
              <Text style={styles.rankPillText}>🌟 {userData.rankTier}</Text>
            </View>
          </Animated.View>

          {/* ---------------- BIG COINS DISPLAY ---------------- */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.coinsCard}>
            <LinearGradient colors={["#92400e", "#78350f"]} style={styles.coinsGradient}>
              <View style={styles.coinsLeft}>
                <Text style={styles.coinsLabel}>Total Green Coins</Text>
                <Text style={styles.coinsValue}>🪙 {coinsDisplay}</Text>
              </View>
              <TouchableOpacity style={styles.redeemBtn} activeOpacity={0.8}>
                <Text style={styles.redeemBtnText}>Redeem</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* ---------------- DAILY CHEST ---------------- */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.chestSection}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleClaimChest}
              style={[styles.glassCard, styles.chestCard]}
            >
              <Text style={styles.chestEmoji}>
                {chestClaimed ? "🧰" : "🎁"}
              </Text>
              <View style={styles.chestTextWrap}>
                <Text style={styles.chestTitle}>
                  {chestClaimed ? "Daily Reward Claimed!" : "Open Daily Chest"}
                </Text>
                <Text style={styles.chestSubtitle}>
                  {chestClaimed ? "Come back tomorrow for more." : "Tap to reveal today's bonus!"}
                </Text>
                {chestClaimed && (
                  <View style={styles.chestRewardPill}>
                    <Text style={styles.chestRewardText}>+50 Coins 🎉</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ---------------- 3-COLUMN BADGES GRID ---------------- */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Achievement Badges</Text>
            <View style={styles.badgesGrid}>
              {badges.map((b) => {
                const isUnlocked = b.status === "unlocked";
                return (
                  <View key={b.id} style={[styles.badgeItem, !isUnlocked && styles.badgeLocked]}>
                    <View style={[styles.badgeIconWrap, isUnlocked && styles.badgeIconGlow]}>
                      <Text style={styles.badgeEmoji}>{b.icon}</Text>
                    </View>
                    <Text style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]} numberOfLines={1}>
                      {b.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* ---------------- RECENT ACTIVITY ---------------- */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.glassCard}>
              {recentActivity.map((activity, index) => (
                <View key={activity.id}>
                  <View style={styles.activityRow}>
                    <View style={styles.activityIcon}>
                      <Feather name="check-circle" size={18} color="#4ade80" />
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityAction}>{activity.action}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                    <View style={styles.activityRewards}>
                      <Text style={styles.activityXp}>{activity.xp}</Text>
                      <Text style={styles.activityCoins}>🪙 {activity.coins}</Text>
                    </View>
                  </View>
                  {index < recentActivity.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#86efac", marginTop: 12, fontWeight: "600", fontSize: 15 },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  /* HEADER */
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: "900", color: "#ECFDF5", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: "#86efac", marginTop: 4, fontWeight: "500" },

  /* CONFETTI */
  confetti: {
    position: "absolute",
    top: -50,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 45,
    zIndex: 20,
  },

  /* XP RING */
  ringSection: { alignItems: "center", marginVertical: 24 },
  ringContainer: {
    width: 200, height: 200,
    alignItems: "center", justifyContent: "center",
  },
  ringInner: { position: "absolute", alignItems: "center" },
  levelNumber: { fontSize: 36, fontWeight: "900", color: "#ffffff" },
  xpFraction: { fontSize: 14, fontWeight: "700", color: "#fbbf24", marginTop: 4 },
  xpLabel: { fontSize: 11, color: "#9ca3af", marginTop: 2, fontWeight: "600", textTransform: "uppercase" },
  rankPill: {
    backgroundColor: "#d97706",
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 999, marginTop: -15,
    borderWidth: 2, borderColor: "#053B24",
    shadowColor: "#fbbf24", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  rankPillText: { color: "#fffbeb", fontSize: 12, fontWeight: "800" },

  /* COINS CARD */
  coinsCard: { marginBottom: 24, borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  coinsGradient: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
  coinsLeft: { flex: 1 },
  coinsLabel: { color: "#fde68a", fontSize: 13, fontWeight: "600", marginBottom: 4 },
  coinsValue: { color: "#ffffff", fontSize: 32, fontWeight: "900" },
  redeemBtn: { backgroundColor: "#fbbf24", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  redeemBtnText: { color: "#78350f", fontSize: 13, fontWeight: "800" },

  /* GLASS CARDS & SECTIONS */
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#ffffff", marginBottom: 14 },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.15)",
  },

  /* CHEST */
  chestSection: { marginBottom: 24 },
  chestCard: { flexDirection: "row", alignItems: "center", paddingVertical: 20 },
  chestEmoji: { fontSize: 48, marginRight: 16 },
  chestTextWrap: { flex: 1 },
  chestTitle: { color: "#ffffff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  chestSubtitle: { color: "#86efac", fontSize: 13 },
  chestRewardPill: { backgroundColor: "rgba(251,191,36,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start", marginTop: 8 },
  chestRewardText: { color: "#fde68a", fontSize: 11, fontWeight: "700" },

  /* BADGES 3-COLUMN GRID */
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  badgeItem: { width: "31%", alignItems: "center", marginBottom: 16 },
  badgeIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  badgeIconGlow: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderColor: "rgba(74,222,128,0.4)",
    shadowColor: "#4ade80", shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
  },
  badgeEmoji: { fontSize: 28 },
  badgeName: { color: "#ffffff", fontSize: 12, fontWeight: "600", textAlign: "center" },
  badgeLocked: { opacity: 0.4 },
  badgeNameLocked: { color: "#9ca3af" },

  /* RECENT ACTIVITY */
  activityRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(74,222,128,0.1)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  activityDetails: { flex: 1 },
  activityAction: { color: "#ffffff", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  activityTime: { color: "#6b7280", fontSize: 11 },
  activityRewards: { alignItems: "flex-end" },
  activityXp: { color: "#d97706", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  activityCoins: { color: "#fbbf24", fontSize: 12, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginVertical: 4 },
});