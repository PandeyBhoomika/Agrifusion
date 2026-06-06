import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AntDesign,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';

// ================= WEATHER API CONFIG =================
const WEATHER_API_KEY = "7c6c37dc393f48f3bc2120650250812";

async function fetchWeather(lat, lon) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`;
  const res = await fetch(url);
  return res.json();
}
// ======================================================

export default function PersonalizedDashboard({
  onBack,
  onViewVirtualFarm,
  onViewWeeklyTasks,
  onProgressRewards,
  onLearningHub,
  onCommunityDashboard,
  onProofSubmission,
  onKnowledgeHub,
  autoDemo,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());
  const progressValue = 72; // overall task completion %
  const level = 4;
  const todaysXP = 34;
  const streakDays = 3;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = useCallback(() => {
    if (autoDemo) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, [autoDemo]);

  return (
    <LinearGradient
      colors={['#d4efdd', '#c0e5ce', '#b0dcc2']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* ---------------- HEADER ---------------- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} disabled={!!autoDemo}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Farm Dashboard</Text>
            <Text style={styles.headerTime}>
              {now.toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <TouchableOpacity onPress={onRefresh} disabled={refreshing || !!autoDemo}>
            <Feather name="refresh-cw" size={20} color="#1f3b2b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* ---------------- WEATHER BAR ---------------- */}
          <View style={styles.weatherCard}>
            <View style={{ flex: 1 }}>
              <View style={styles.weatherHeaderRow}>
                <View style={styles.weatherLocationRow}>
                  <Ionicons name="location-outline" size={16} color="#1f3b2b" />
                  <Text style={styles.weatherLocationText}>Your Farm</Text>
                </View>
                <View style={styles.weatherChip}>
                  <Feather name="zap" size={14} color="#14532d" />
                  <Text style={styles.weatherChipText}>Good for Irrigation</Text>
                </View>
              </View>

              <View style={styles.weatherMainRow}>
                <View>
                  <Text style={styles.weatherTemp}>28°C</Text>
                  <Text style={styles.weatherSubtitle}>Clear · Humid</Text>
                  <Text style={styles.weatherFeelsLike}>
                    Feels like 30°C • Mild wind
                  </Text>
                </View>
              </View>

              <View style={styles.weatherStatsRow}>
                <View style={styles.weatherStatPill}>
                  <Feather name="droplet" size={14} color="#0f766e" />
                  <Text style={styles.weatherStatText}>65% Humidity</Text>
                </View>
                <View style={styles.weatherStatPill}>
                  <Feather name="wind" size={14} color="#0f766e" />
                  <Text style={styles.weatherStatText}>8 km/h Wind</Text>
                </View>
                <View style={styles.weatherStatPill}>
                  <Ionicons name="rainy-outline" size={14} color="#0f766e" />
                  <Text style={styles.weatherStatText}>10% Rain</Text>
                </View>
                <View style={styles.weatherStatPill}>
                  <Ionicons name="leaf-outline" size={14} color="#0f766e" />
                  <Text style={styles.weatherStatText}>Soil OK</Text>
                </View>
              </View>
            </View>

            <View style={styles.weatherRight}>
              <Ionicons name="sunny-outline" size={40} color="#facc15" />
              <View style={styles.weatherScorePill}>
                <Text style={styles.weatherScoreLabel}>Today Score</Text>
                <Text style={styles.weatherScoreValue}>8.4 / 10</Text>
              </View>
            </View>
          </View>

          {/* ---------------- DAILY STREAK ---------------- */}
          <View style={styles.streakCard}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <View>
                <Text style={styles.streakTitle}>
                  {streakDays}-day sustainable streak
                </Text>
                <Text style={styles.streakSubtitle}>
                  Complete 1 task today to keep the fire alive!
                </Text>
              </View>
            </View>
            <View style={styles.streakRight}>
              <Text style={styles.streakRewardLabel}>Bonus</Text>
              <Text style={styles.streakRewardValue}>+20 XP</Text>
            </View>
          </View>

          {/* ---------------- PROGRESS RING ---------------- */}
          <View style={styles.progressWrapper}>
            <View style={styles.progressOuterGlow}>
              <View style={styles.progressRing}>
                <View style={styles.progressInnerRing}>
                  <Text style={styles.progressAvatar}>👨‍🌾</Text>
                  <Text style={styles.progressValue}>{progressValue}%</Text>
                  <Text style={styles.progressLabel}>Mission Progress</Text>
                  <View style={styles.levelPill}>
                    <Feather name="star" size={12} color="#fbbf24" />
                    <Text style={styles.levelPillText}>Lv.{level} Eco Farmer</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Today’s XP</Text>
              <Text style={styles.xpValue}>+{todaysXP} XP</Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: '60%' }]} />
            </View>
            <Text style={styles.xpHint}>180 XP more to reach Level 5</Text>
          </View>

          {/* ---------------- REWARD BANNER ---------------- */}
          <View style={styles.rewardBanner}>
            <View style={styles.rewardLeft}>
              <AntDesign name="gift" size={20} color="#f97316" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.rewardTitle}>Great job today! 🎉</Text>
                <Text style={styles.rewardSubtitle}>
                  You unlocked new rewards by completing missions.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.rewardButton}
              onPress={onProgressRewards}
              disabled={!!autoDemo}
            >
              <Text style={styles.rewardButtonText}>View</Text>
            </TouchableOpacity>
          </View>

          {/* ---------------- SMART INSIGHTS ---------------- */}
          <View style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>Smart Insights</Text>

            <View style={styles.insightRow}>
              <View style={styles.insightIconBox}>
                <Feather name="activity" size={18} color="#14532d" />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightText}>
                  Crop health is stable and improving 📈
                </Text>
              </View>
              <View style={[styles.trendChip, styles.trendPositive]}>
                <Feather name="arrow-up-right" size={12} color="#166534" />
                <Text style={styles.trendText}>+6%</Text>
              </View>
            </View>

            <View style={styles.insightRow}>
              <View style={styles.insightIconBox}>
                <Feather name="droplet" size={18} color="#14532d" />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightText}>
                  Water usage 12% better than last week 💧
                </Text>
              </View>
              <View style={[styles.trendChip, styles.trendPositive]}>
                <Feather name="arrow-down-right" size={12} color="#166534" />
                <Text style={styles.trendText}>-12%</Text>
              </View>
            </View>

            <View style={styles.insightRow}>
              <View style={styles.insightIconBox}>
                <Feather name="award" size={18} color="#14532d" />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={styles.insightText}>
                  2 new rewards unlocked – keep going! 🏅
                </Text>
              </View>
              <View style={[styles.trendChip, styles.trendNeutral]}>
                <Feather name="sparkles" size={12} color="#92400e" />
                <Text style={styles.trendText}>Rewards</Text>
              </View>
            </View>
          </View>

          {/* ---------------- FARM HEALTH SNAPSHOT ---------------- */}
          <View style={styles.healthCard}>
            <Text style={styles.sectionTitle}>Farm Health Snapshot</Text>
            <View style={styles.healthRow}>
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>🌱 Soil</Text>
                <View style={styles.healthBarTrack}>
                  <View style={[styles.healthBarFill, { width: '82%' }]} />
                </View>
                <Text style={styles.healthValue}>82 · Healthy</Text>
              </View>

              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>💧 Water</Text>
                <View style={styles.healthBarTrack}>
                  <View style={[styles.healthBarFill, { width: '74%' }]} />
                </View>
                <Text style={styles.healthValue}>74 · Efficient</Text>
              </View>
            </View>

            <View style={styles.healthRow}>
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>🐛 Pest Risk</Text>
                <View style={styles.healthBarTrack}>
                  <View
                    style={[
                      styles.healthBarFillWarning,
                      { width: '38%' },
                    ]}
                  />
                </View>
                <Text style={styles.healthValueWarning}>Low–Medium</Text>
              </View>

              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>☀ Sunlight</Text>
                <View style={styles.healthBarTrack}>
                  <View style={[styles.healthBarFill, { width: '68%' }]} />
                </View>
                <Text style={styles.healthValue}>Good</Text>
              </View>
            </View>
          </View>

          {/* ---------------- WIDGET GRID ---------------- */}
          <Text style={styles.sectionTitle}>Your Tools</Text>

          <View style={styles.widgetGrid}>
            {/* TASKS */}
            <TouchableOpacity
              style={styles.widgetCard}
              onPress={onViewWeeklyTasks}
              disabled={!!autoDemo}
            >
              <View style={styles.widgetTopRow}>
                <View style={styles.widgetIconContainer}>
                  <Feather name="check-circle" size={26} color="#14532d" />
                </View>
                <View style={styles.widgetBadge}>
                  <Text style={styles.widgetBadgeText}>3 pending</Text>
                </View>
              </View>
              <Text style={styles.widgetTitle}>Tasks</Text>
              <Text style={styles.widgetSubtitle}>Finish today’s missions</Text>
              <View style={styles.widgetProgressTrack}>
                <View style={[styles.widgetProgressFill, { width: '60%' }]} />
              </View>
            </TouchableOpacity>

            {/* PROOF SUBMISSION */}
            <TouchableOpacity
              style={styles.widgetCard}
              onPress={onProofSubmission}
              disabled={!!autoDemo}
            >
              <View style={styles.widgetTopRow}>
                <View style={styles.widgetIconContainer}>
                  <MaterialIcons name="assignment" size={26} color="#14532d" />
                </View>
                <View style={[styles.widgetBadge, styles.widgetBadgeNeutral]}>
                  <Text style={styles.widgetBadgeText}>Field Photos</Text>
                </View>
              </View>
              <Text style={styles.widgetTitle}>Proof Submission</Text>
              <Text style={styles.widgetSubtitle}>Upload and submit proofs</Text>
              <View style={styles.widgetProgressTrack}>
                <View style={[styles.widgetProgressFill, { width: '30%' }]} />
              </View>
            </TouchableOpacity>

            {/* REWARDS */}
            <TouchableOpacity
              style={styles.widgetCard}
              onPress={onProgressRewards}
              disabled={!!autoDemo}
            >
              <View style={styles.widgetTopRow}>
                <View style={styles.widgetIconContainer}>
                  <AntDesign name="gift" size={26} color="#14532d" />
                </View>
                <View style={[styles.widgetBadge, styles.widgetBadgeHighlight]}>
                  <Text style={styles.widgetBadgeText}>+34 XP</Text>
                </View>
              </View>
              <Text style={styles.widgetTitle}>Rewards</Text>
              <Text style={styles.widgetSubtitle}>Claim coins & badges</Text>
              <View style={styles.widgetProgressTrack}>
                <View style={[styles.widgetProgressFill, { width: '45%' }]} />
              </View>
            </TouchableOpacity>

            {/* PROGRESS & INSIGHTS */}
            <TouchableOpacity style={styles.widgetCard} disabled={!!autoDemo}>
              <View style={styles.widgetTopRow}>
                <View style={styles.widgetIconContainer}>
                  <Feather name="bar-chart-2" size={26} color="#14532d" />
                </View>
                <View style={[styles.widgetBadge, styles.widgetBadgeNeutral]}>
                  <Text style={styles.widgetBadgeText}>Overview</Text>
                </View>
              </View>
              <Text style={styles.widgetTitle}>Progress</Text>
              <Text style={styles.widgetSubtitle}>Trends & analytics</Text>
              <View style={styles.widgetMiniRow}>
                <Text style={styles.widgetMiniStat}>▲ 8% better week</Text>
              </View>
            </TouchableOpacity>

            {/* LEARNING HUB */}
            <TouchableOpacity
              style={styles.widgetCard}
              onPress={onLearningHub}
              disabled={!!autoDemo}
            >
              <View style={styles.widgetTopRow}>
                <View style={styles.widgetIconContainer}>
                  <FontAwesome5 name="book-open" size={22} color="#14532d" />
                </View>
                <View style={[styles.widgetBadge, styles.widgetBadgeNew]}>
                  <Text style={styles.widgetBadgeText}>New</Text>
                </View>
              </View>
              <Text style={styles.widgetTitle}>Learning Hub</Text>
              <Text style={styles.widgetSubtitle}>Watch & practice</Text>
              <View style={styles.widgetMiniRow}>
                <Text style={styles.widgetMiniStat}>2 new videos</Text>
              </View>
            </TouchableOpacity>

            {/* COMMUNITY */}
            <TouchableOpacity
              style={styles.widgetCard}
              onPress={onCommunityDashboard}
              disabled={!!autoDemo}
            >
              <View style={styles.widgetTopRow}>
                <View style={styles.widgetIconContainer}>
                  <Ionicons
                    name="people-circle-outline"
                    size={28}
                    color="#14532d"
                  />
                </View>
                <View style={[styles.widgetBadge, styles.widgetBadgeNeutral]}>
                  <Text style={styles.widgetBadgeText}>Live</Text>
                </View>
              </View>
              <Text style={styles.widgetTitle}>Community</Text>
              <Text style={styles.widgetSubtitle}>Ask & help farmers</Text>
              <View style={styles.widgetMiniRow}>
                <Text style={styles.widgetMiniStat}>5 new posts</Text>
              </View>
            </TouchableOpacity>

            {/* GOVERNMENT SCHEMES / KNOWLEDGE HUB */}
            <TouchableOpacity
              style={styles.widgetCard}
              onPress={onKnowledgeHub}
              disabled={!!autoDemo}
            >
              <View style={styles.widgetTopRow}>
                <View style={styles.widgetIconContainer}>
                  <Ionicons name="library-outline" size={26} color="#14532d" />
                </View>
                <View style={[styles.widgetBadge, styles.widgetBadgeNeutral]}>
                  <Text style={styles.widgetBadgeText}>Schemes</Text>
                </View>
              </View>
              <Text style={styles.widgetTitle}>Gov Schemes</Text>
              <Text style={styles.widgetSubtitle}>Know your benefits</Text>
              <View style={styles.widgetMiniRow}>
                <Text style={styles.widgetMiniStat}>3 eligible schemes</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ----------------------------------------------------------
                        STYLES
----------------------------------------------------------- */

const styles = StyleSheet.create({
  header: {
    padding: 14,
    paddingTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f3b2b',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#122620',
    letterSpacing: -0.3,
  },
  headerTime: {
    fontSize: 12,
    color: '#375949',
    marginTop: 2,
  },

  container: { paddingHorizontal: 18, paddingBottom: 60 },

  /* WEATHER */
  weatherCard: {
    backgroundColor: '#e5f6ea',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  weatherHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  weatherLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherLocationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f3b2b',
    marginLeft: 4,
  },
  weatherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  weatherChipText: {
    fontSize: 11,
    color: '#14532d',
    fontWeight: '700',
    marginLeft: 4,
  },
  weatherMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  weatherTemp: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1f3b2b',
  },
  weatherSubtitle: {
    color: '#355647',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  weatherFeelsLike: {
    color: '#4b6b58',
    fontSize: 11,
    marginTop: 2,
  },
  weatherStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  weatherStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9fbe8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  weatherStatText: {
    fontSize: 10,
    color: '#134e4a',
    marginLeft: 4,
    fontWeight: '600',
  },
  weatherRight: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherScorePill: {
    marginTop: 6,
    backgroundColor: '#fef9c3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  weatherScoreLabel: {
    fontSize: 10,
    color: '#854d0e',
    fontWeight: '600',
  },
  weatherScoreValue: {
    fontSize: 12,
    color: '#854d0e',
    fontWeight: '800',
  },

  /* STREAK */
  streakCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  streakEmoji: { fontSize: 26, marginRight: 8 },
  streakTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  streakSubtitle: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
  },
  streakRight: {
    alignItems: 'flex-end',
  },
  streakRewardLabel: {
    fontSize: 10,
    color: '#b45309',
    fontWeight: '600',
  },
  streakRewardValue: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '800',
  },

  /* PROGRESS */
  progressWrapper: { alignItems: 'center', marginBottom: 18 },
  progressOuterGlow: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(22,163,74,0.08)',
  },
  progressRing: {
    height: 150,
    width: 150,
    borderRadius: 75,
    backgroundColor: '#e2f3e8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#bbf7d0',
  },
  progressInnerRing: {
    height: 115,
    width: 115,
    borderRadius: 58,
    backgroundColor: '#f9fff9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressAvatar: {
    fontSize: 26,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#14532d',
  },
  progressLabel: {
    color: '#406650',
    fontSize: 12,
    marginTop: 2,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  levelPillText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
    marginLeft: 4,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  xpLabel: {
    fontSize: 12,
    color: '#355647',
    fontWeight: '600',
  },
  xpValue: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '800',
  },
  xpTrack: {
    width: '80%',
    height: 8,
    backgroundColor: '#dbeee2',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  xpFill: {
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  xpHint: {
    fontSize: 11,
    color: '#4b6b58',
    marginTop: 4,
  },

  /* REWARD BANNER */
  rewardBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#fef3c7',
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rewardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  rewardSubtitle: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
  },
  rewardButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  rewardButtonText: {
    color: '#fff7ed',
    fontSize: 12,
    fontWeight: '700',
  },

  /* INSIGHTS */
  insightsCard: {
    backgroundColor: '#e4f6ea',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#163526',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  insightIconBox: {
    backgroundColor: '#d3edda',
    padding: 8,
    borderRadius: 12,
    marginRight: 10,
  },
  insightTextWrap: { flex: 1 },
  insightText: {
    fontSize: 13,
    color: '#234638',
    fontWeight: '500',
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  trendPositive: {
    backgroundColor: '#bbf7d0',
  },
  trendNeutral: {
    backgroundColor: '#fed7aa',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    color: '#14532d',
  },

  /* FARM HEALTH */
  healthCard: {
    backgroundColor: '#e7f5ec',
    padding: 14,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  healthItem: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f3b2b',
    marginBottom: 4,
  },
  healthBarTrack: {
    height: 7,
    backgroundColor: '#d7e9dd',
    borderRadius: 999,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: 7,
    backgroundColor: '#16a34a',
    borderRadius: 999,
  },
  healthBarFillWarning: {
    height: 7,
    backgroundColor: '#f97316',
    borderRadius: 999,
  },
  healthValue: {
    fontSize: 11,
    color: '#234638',
    marginTop: 2,
  },
  healthValueWarning: {
    fontSize: 11,
    color: '#9a3412',
    marginTop: 2,
    fontWeight: '600',
  },

  /* WIDGET GRID */
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  widgetCard: {
    width: '48%',
    backgroundColor: '#f1fbf4',
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.2,
    borderColor: '#d7f0df',
  },
  widgetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetIconContainer: {
    backgroundColor: '#d9f5df',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  widgetBadge: {
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  widgetBadgeHighlight: {
    backgroundColor: '#fed7aa',
  },
  widgetBadgeNeutral: {
    backgroundColor: '#e5e7eb',
  },
  widgetBadgeNew: {
    backgroundColor: '#bfdbfe',
  },
  widgetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f3b2b',
  },
  widgetSubtitle: {
    fontSize: 12,
    color: '#406650',
    marginTop: 2,
  },
  widgetProgressTrack: {
    height: 6,
    backgroundColor: '#d9e8de',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  widgetProgressFill: {
    height: 6,
    backgroundColor: '#16a34a',
    borderRadius: 999,
  },
  widgetMiniRow: {
    marginTop: 8,
  },
  widgetMiniStat: {
    fontSize: 11,
    color: '#14532d',
    fontWeight: '600',
  },
});