import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
/* ---------------------- MOCK DATA ---------------------- */
const MOCK_DATA = {
  level: 4,
  xp: 1280,
  xpToNext: 1500,
  greenCoins: 540,
  carbonCredits: 3.5,
  rankTier: "Silver Farmer",
  rankProgress: 28,
  streakDays: 5,
};

const badges = [
  { id: "b1", name: "Water Saver", status: "unlocked", icon: "💧" },
  { id: "b2", name: "Soil Guardian", status: "unlocked", icon: "🛡️" },
  { id: "b3", name: "Organic Hero", status: "locked", icon: "🌱" },
  { id: "b4", name: "Carbon Smart", status: "locked", icon: "♻️" },
];

const roadmap = [
  { id: "r1", label: "Unlock Mulching Badge", xp: 200 },
  { id: "r2", label: "100 Green Coins", xp: 400 },
  { id: "r3", label: "Water Saver Badge", xp: 650 },
  { id: "r4", label: "Free Spin Token", xp: 900 },
  { id: "r5", label: "Organic Champ Tier", xp: 1200 },
];

const schemes = [
  { id: "s1", name: "Organic Farming Incentive", progress: 40 },
  { id: "s2", name: "Water Conservation Points", progress: 70 },
  { id: "s3", name: "Drip Irrigation Subsidy", progress: 100 },
];

const boosters = [
  { id: "bo1", name: "XP ×2 Booster", desc: "2x XP for next 1 hour" },
  { id: "bo2", name: "Coin Boost", desc: "+30% coins today" },
  { id: "bo3", name: "Streak Shield", desc: "Protects 1 missed day" },
];

const nextRewards = [
  {
    id: "nr1",
    task: "Do mulching on 1 plot",
    reward: "+10 XP • +5 Green Coins",
  },
  {
    id: "nr2",
    task: "Use organic pesticide once",
    reward: "+15 XP • Badge progress +5%",
  },
  {
    id: "nr3",
    task: "Log today’s irrigation",
    reward: "+5 XP • Water Saver progress",
  },
];

/* ================================================================
   REWARDS SCREEN
================================================================ */

export default function RewardsScreen() {
  const [chestClaimed, setChestClaimed] = useState(false);

  // Confetti animation (emoji falling)
  const [confetti] = useState(new Animated.Value(0));

  const triggerConfetti = () => {
    confetti.setValue(0);
    Animated.timing(confetti, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  };

  const handleClaimChest = () => {
    if (chestClaimed) return;
    setChestClaimed(true);
    triggerConfetti();
  };

  /* ---------------------- Confetti Style ---------------------- */
  const confettiTranslateY = confetti.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 800],
  });

  return (
    <LinearGradient colors={["#E7F8ED", "#D4F3DF"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        {/* EMOJI CONFETTI */}
        <Animated.Text
          style={[
            styles.confetti,
            { transform: [{ translateY: confettiTranslateY }] },
          ]}
        >
          🎉
        </Animated.Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* ---------------- XP RING ---------------- */}
          <Animated.View entering={FadeInUp} style={styles.xpSection}>
            <View style={styles.xpRingWrap}>
              <View style={styles.xpCircle}>
                <Text style={styles.levelText}>Lv {MOCK_DATA.level}</Text>
                <Text style={styles.xpText}>
                  {MOCK_DATA.xp} / {MOCK_DATA.xpToNext} XP
                </Text>
                <Text style={styles.tierText}>{MOCK_DATA.rankTier}</Text>
              </View>
            </View>
          </Animated.View>

          {/* ---------------- COINS & CARBON ---------------- */}
          <View style={styles.row}>
            <View style={styles.infoCard}>
              <Text style={styles.cardLabel}>Green Coins</Text>
              <Text style={styles.cardValue}>🪙 {MOCK_DATA.greenCoins}</Text>
              <Text style={styles.cardHint}>Earned from sustainable tasks</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardLabel}>Carbon Saved</Text>
              <Text style={styles.cardValue}>
                🌱 {MOCK_DATA.carbonCredits.toFixed(1)} kg
              </Text>
              <TouchableOpacity style={styles.convertBtn}>
                <Text style={styles.convertText}>Convert → Coins</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ---------------- RANK CARD ---------------- */}
          <View style={styles.rankCard}>
            <View style={styles.rankHeader}>
              <Text style={styles.rankTitle}>Farmer Rank</Text>
              <Text style={styles.rankTier}>{MOCK_DATA.rankTier}</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${MOCK_DATA.rankProgress}%` },
                ]}
              />
            </View>

            <Text style={styles.rankHint}>
              {MOCK_DATA.rankProgress}% progress to Gold Tier
            </Text>
          </View>

          {/* ---------------- DAILY CHEST ---------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Reward Chest</Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleClaimChest}
              style={styles.chestWrap}
            >
              <Text style={styles.chestEmoji}>
                {chestClaimed ? "🧰" : "🎁"}
              </Text>

              <Text style={styles.chestText}>
                {chestClaimed ? "Reward Claimed 🎉" : "Tap to open chest"}
              </Text>

              {chestClaimed && (
                <Text style={styles.chestRewardText}>
                  +20 XP • +10 Coins • +1 Badge Shard
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ---------------- BADGES ---------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Badges</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {badges.map((b) => (
                <View
                  key={b.id}
                  style={[
                    styles.badgeCard,
                    b.status === "locked" && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.badgeIcon}>{b.icon}</Text>
                  <Text style={styles.badgeName}>{b.name}</Text>
                  <Text
                    style={[
                      styles.badgeStatus,
                      b.status === "unlocked"
                        ? { color: "#16a34a" }
                        : { color: "#9ca3af" },
                    ]}
                  >
                    {b.status === "unlocked" ? "Unlocked" : "Locked"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ---------------- ROADMAP ---------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rewards Roadmap</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {roadmap.map((r, idx) => (
                <View key={r.id} style={styles.roadCard}>
                  <Text style={styles.roadStep}>Step {idx + 1}</Text>
                  <Text style={styles.roadLabel}>{r.label}</Text>
                  <Text style={styles.roadXp}>at {r.xp} XP</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ---------------- SCHEMES ---------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Government Schemes</Text>

            {schemes.map((s) => (
              <View key={s.id} style={styles.schemeCard}>
                <View style={styles.schemeHeader}>
                  <Text style={styles.schemeName}>{s.name}</Text>
                  <Text style={styles.schemePercent}>{s.progress}%</Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${s.progress}%` },
                    ]}
                  />
                </View>

                <Text style={styles.schemeHint}>
                  {s.progress === 100
                    ? "Eligible ✔ Submit proof to claim"
                    : "Complete more tasks to reach 100%"}
                </Text>
              </View>
            ))}
          </View>

          {/* ---------------- BOOSTERS ---------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Boosters</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {boosters.map((b) => (
                <View key={b.id} style={styles.boosterCard}>
                  <Text style={styles.boosterTitle}>{b.name}</Text>
                  <Text style={styles.boosterDesc}>{b.desc}</Text>

                  <TouchableOpacity style={styles.boosterBtn}>
                    <Text style={styles.boosterBtnText}>Activate</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ---------------- NEXT REWARDS ---------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Rewards</Text>

            {nextRewards.map((n) => (
              <View key={n.id} style={styles.nextCard}>
                <Text style={styles.nextTask}>{n.task}</Text>
                <Text style={styles.nextReward}>{n.reward}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  safe: { flex: 1 },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 25,
  },

  /* CONFETTI */
  confetti: {
    position: "absolute",
    top: -50,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 50,
    zIndex: 20,
  },

  /* XP RING */
  xpSection: { alignItems: "center", marginBottom: 10 },
  xpRingWrap: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "#BBF7D0",
  },
  xpCircle: { alignItems: "center" },
  levelText: { fontSize: 28, fontWeight: "800", color: "#14532d" },
  xpText: { fontSize: 13, color: "#166534", marginTop: 4 },
  tierText: { fontSize: 12, color: "#4b5563", marginTop: 2 },

  /* INFO CARDS */
  row: { flexDirection: "row", marginTop: 10 },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 5,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
  },
  cardLabel: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: "800", color: "#166534" },
  cardHint: { marginTop: 4, fontSize: 11, color: "#6b7280" },
  convertBtn: {
    marginTop: 8,
    backgroundColor: "#BBF7D0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  convertText: { fontSize: 11, fontWeight: "700", color: "#166534" },

  /* RANK */
  rankCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
  },
  rankHeader: { flexDirection: "row", justifyContent: "space-between" },
  rankTitle: { fontSize: 14, fontWeight: "700", color: "#14532d" },
  rankTier: { fontSize: 13, fontWeight: "700", color: "#16a34a" },

  progressTrack: {
    height: 8,
    backgroundColor: "#e5f4e9",
    borderRadius: 999,
    marginTop: 6,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#16a34a",
    borderRadius: 999,
  },
  rankHint: { fontSize: 11, marginTop: 4, color: "#6b7280" },

  /* CHEST */
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#14532d",
    marginBottom: 10,
  },

  chestWrap: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
  },
  chestEmoji: { fontSize: 65, marginBottom: 5 },
  chestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#854d0e",
  },
  chestRewardText: {
    marginTop: 4,
    fontSize: 12,
    color: "#166534",
  },

  /* BADGES */
  badgeCard: {
    width: 120,
    height: 140,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeIcon: { fontSize: 32 },
  badgeName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14532d",
    marginTop: 6,
  },
  badgeStatus: { fontSize: 11, marginTop: 3 },

  /* ROADMAP */
  roadCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  roadStep: { fontSize: 11, color: "#6b7280" },
  roadLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14532d",
    marginTop: 4,
  },
  roadXp: { fontSize: 11, marginTop: 6, color: "#22c55e" },

  /* SCHEMES */
  schemeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
  },
  schemeHeader: { flexDirection: "row", justifyContent: "space-between" },
  schemeName: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    color: "#14532d",
  },
  schemePercent: { fontWeight: "700", color: "#16a34a" },
  schemeHint: { fontSize: 11, marginTop: 4, color: "#6b7280" },

  /* BOOSTERS */
  boosterCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
  },
  boosterTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  boosterDesc: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  boosterBtn: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
  },
  boosterBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

  /* NEXT REWARDS */
  nextCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  nextTask: { fontSize: 13, fontWeight: "700", color: "#14532d" },
  nextReward: { marginTop: 4, fontSize: 11, color: "#16a34a" },
});
