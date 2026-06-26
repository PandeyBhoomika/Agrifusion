import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  RefreshControl, SafeAreaView, ActivityIndicator, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Reanimated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import { useTasks } from '../../context/TaskContext';

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || '7c6c37dc393f48f3bc2120650250812';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windKph: number;
  rainChance: number;
  locationName: string;
  score: number;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const humidity: number = data.current.humidity;
    const windKph: number = data.current.wind_kph;
    const temp: number = data.current.temp_c;
    const tempScore = temp >= 20 && temp <= 30 ? 4 : temp >= 15 && temp <= 35 ? 3 : 2;
    const humScore = humidity >= 50 && humidity <= 70 ? 3 : 2;
    const windScore = windKph < 20 ? 3 : 2;
    const score = parseFloat(((tempScore + humScore + windScore) / 1.0).toFixed(1));
    return {
      temp: Math.round(temp),
      feelsLike: Math.round(data.current.feelslike_c),
      condition: data.current.condition.text,
      humidity,
      windKph: Math.round(windKph),
      rainChance: data.current.precip_mm > 0 ? 60 : 10,
      locationName: data.location.name,
      score: Math.min(10, score),
    };
  } catch {
    return null;
  }
}

export default function PersonalizedDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, loading, refreshUser } = useUser();
  const { pendingTasks, refreshTasks } = useTasks();

  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  // ── Calculate XP progress to next level ─────────────────────────────
  // Assuming each level needs ~1000 XP
  const XP_PER_LEVEL = 1000;
  const currentLevelXP = user ? (user.xp % XP_PER_LEVEL) : 0;
  const progressValue = user ? Math.round((currentLevelXP / XP_PER_LEVEL) * 100) : 72;
  const xpToNextLevel = user ? (XP_PER_LEVEL - currentLevelXP) : 180;
  const level = user?.level || 4;
  const todaysXP = user?.xp ? (user.xp % 100) : 34; // Simplified calculation
  const streakDays = user?.streakDays || 3;
  const fullName = user?.fullName || 'Farmer';
  const avatarEmoji = '👨‍🌾';
  
  // ── Real pending tasks count ─────────────────────────────────
  const pendingTasksCount = pendingTasks.length;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Refresh user data whenever dashboard comes into focus ─────────────
  useFocusEffect(
    useCallback(() => {
      console.log('Dashboard focused - refreshing user data');
      refreshUser().catch(err => console.error('Failed to refresh user on focus:', err));
    }, [refreshUser])
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotateAnim]);

  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  useEffect(() => { loadWeather(); }, []);

  const loadWeather = async () => {
    setWeatherLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setWeather(null); setWeatherLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const data = await fetchWeather(loc.coords.latitude, loc.coords.longitude);
      setWeather(data);
    } catch { setWeather(null); }
    finally { setWeatherLoading(false); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadWeather(), refreshUser(), refreshTasks()]);
    setNow(new Date());
    setTimeout(() => setRefreshing(false), 800);
  }, [refreshUser, refreshTasks]);

  const goToTasks = () => router.push('/(tabs)/tasks');
  // Proof submission needs a specific taskId, which only exists when you tap
// "Mark Done" on a task that requires proof — so route here instead of
// opening proof-submission with no task context.
const goToProofSubmit = () => router.push('/tasks');
  const goToRewards = () => router.push('/rewards');
  const goToLearningHub = () => router.push('/(tabs)/learninghub');
  const goToCommunity = () => router.push('/(tabs)/communitydashboard');
  const goToGovSchemes = () => router.push('/schemes');
  const goToVirtualFarm = () => router.push('/(tabs)/virtualfarm');

  const displayTemp = weather ? `${weather.temp}°C` : '28°C';
  const displayCondition = weather ? weather.condition : 'Partly Cloudy';
  const displayFeelsLike = weather ? `Feels ${weather.feelsLike}° · Mild wind` : 'Feels 30° · Mild wind';
  const displayHumidity = weather ? `${weather.humidity}%` : '65%';
  const displayWind = weather ? `${weather.windKph}km/h` : '8km/h';
  const displayRain = weather ? `${weather.rainChance}%` : '10%';
  const displayLocation = weather ? weather.locationName : 'Your Farm';
  const displayScore = weather ? `${weather.score}/10` : '8.4/10';

  const hour = now.getHours();
  // ✅ Translated greeting
  const greeting = hour < 12 ? t.dashboard.goodMorning
    : hour < 17 ? t.dashboard.goodAfternoon
    : t.dashboard.goodEvening;

  const radius = 65;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressValue) / 100;

  return (
    <LinearGradient colors={['#021F0F', '#042818', '#053B24']} style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor="#021F0F" />
      <SafeAreaView style={{ flex: 1 }}>

        {/* HEADER */}
        <Reanimated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              {/* ✅ Translated */}
              <Text style={styles.greetingText}>{greeting}, 🌾</Text>
              {loading ? (
                <>
                  <View style={{ width: 120, height: 28, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginVertical: 4 }} />
                  <View style={{ width: 100, height: 14, backgroundColor: 'rgba(134,239,172,0.1)', borderRadius: 4, marginTop: 4 }} />
                </>
              ) : (
                <>
                  <Text style={styles.userName}>{fullName}</Text>
                  <Text style={styles.dateText}>
                    {now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </Text>
                </>
              )}
            </View>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 24 }}>{avatarEmoji}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Lv.{level}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerBottomRow}>
            <View style={styles.headerXpTrack}>
              <LinearGradient colors={['#22c55e', '#4ade80']} style={[styles.headerXpFill, { width: `${progressValue}%` }]} />
            </View>
            {/* ✅ Translated */}
            <Text style={styles.headerXpLabel}>{xpToNextLevel} {t.dashboard.xpToLevel} {level + 1}</Text>
          </View>
        </Reanimated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
        >
          {/* WEATHER CARD */}
          <Reanimated.View entering={FadeInUp.delay(100).duration(400)}>
            <LinearGradient colors={['#0F5E35', '#0A4228', '#063020']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.weatherHero}>
              <View style={styles.weatherTopRow}>
                <View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#86efac" />
                    <Text style={styles.locationText}>{displayLocation}</Text>
                  </View>
                  <Text style={styles.heroTemp}>{weatherLoading ? '--' : displayTemp}</Text>
                  <Text style={styles.heroCondition}>{displayCondition}</Text>
                  <Text style={styles.heroFeelsLike}>{displayFeelsLike}</Text>
                </View>
                <View style={styles.weatherHeroRight}>
                  <View style={styles.irrigationChip}>
                    <Feather name="zap" size={12} color="#053B24" />
                    {/* ✅ Translated */}
                    <Text style={styles.irrigationChipText}>{t.dashboard.goodForIrrigation}</Text>
                  </View>
                  <Animated.View style={{ transform: [{ rotate: rotation }], marginTop: 10 }}>
                    <Ionicons name="sunny" size={56} color="#fbbf24" />
                  </Animated.View>
                  <View style={styles.farmingScorePill}>
                    {/* ✅ Translated */}
                    <Text style={styles.scorePillText}>{t.dashboard.farmingScore} {displayScore}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.weatherStatBoxes}>
                <View style={styles.miniStatBox}><Text style={styles.miniStatText}>💧 {displayHumidity}</Text></View>
                <View style={styles.miniStatBox}><Text style={styles.miniStatText}>🌬️ {displayWind}</Text></View>
                <View style={styles.miniStatBox}><Text style={styles.miniStatText}>🌧️ {displayRain}</Text></View>
                <View style={styles.miniStatBox}><Text style={styles.miniStatText}>🌱 Soil OK</Text></View>
              </View>
            </LinearGradient>
          </Reanimated.View>

          {/* STREAK & XP ROW */}
          <View style={styles.rowCards}>
            <Reanimated.View entering={FadeInUp.delay(200).duration(400)} style={styles.halfCardWrapper}>
              <LinearGradient colors={['#92400e', '#78350f']} style={[styles.halfCard, styles.streakCard]}>
                <Text style={styles.halfCardEmoji}>🔥</Text>
                <View>
                  {/* ✅ Translated */}
                  <Text style={styles.halfCardTitle}>{streakDays} {t.dashboard.streakDays}</Text>
                  <Text style={styles.halfCardSubGold}>{t.dashboard.xpBonus}</Text>
                </View>
              </LinearGradient>
            </Reanimated.View>
            <Reanimated.View entering={FadeInUp.delay(300).duration(400)} style={styles.halfCardWrapper}>
              <LinearGradient colors={['#14532d', '#0a3d1f']} style={[styles.halfCard, styles.xpCard]}>
                <Text style={styles.halfCardEmoji}>⚡</Text>
                <View>
                  {/* ✅ Translated */}
                  <Text style={styles.halfCardTitle}>+{todaysXP} {t.dashboard.xpToday}</Text>
                  <View style={styles.miniProgressTrack}>
                    <View style={[styles.miniProgressFill, { width: '70%' }]} />
                  </View>
                </View>
              </LinearGradient>
            </Reanimated.View>
          </View>

          {/* MISSION PROGRESS CIRCLE */}
          <Reanimated.View entering={ZoomIn.delay(400).duration(500)} style={styles.missionCircleContainer}>
            <View style={styles.outerGlowRing}>
              <Svg width={150} height={150}>
                <Circle cx={75} cy={75} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
                <Circle cx={75} cy={75} r={radius} stroke="#22c55e" strokeWidth={strokeWidth} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                  rotation="-90" origin="75, 75" />
              </Svg>
              <View style={styles.circleInnerContent}>
                <Text style={{ fontSize: 28 }}>{avatarEmoji}</Text>
                <Text style={styles.circlePercentage}>{progressValue}%</Text>
                {/* ✅ Translated */}
                <Text style={styles.circleLabel}>{t.dashboard.missionProgress}</Text>
              </View>
            </View>
            <View style={styles.levelBadgeAmber}>
              <Text style={styles.levelBadgeAmberText}>🌟 Lv.{level} {level < 3 ? 'Farmer' : level < 6 ? 'Eco Farmer' : 'Master Farmer'}</Text>
            </View>
          </Reanimated.View>

          {/* SMART INSIGHTS */}
          <Reanimated.View entering={FadeInUp.delay(500).duration(400)} style={styles.glassCard}>
            {/* ✅ Translated */}
            <Text style={styles.sectionTitle}>{t.dashboard.smartInsights}</Text>
            <View style={styles.insightRow}>
              <View style={styles.insightIcon}><Feather name="trending-up" size={16} color="#86efac" /></View>
              <Text style={styles.insightText}>{t.dashboard.cropHealthStable}</Text>
              <View style={styles.chipGreen}><Text style={styles.chipGreenText}>+6%</Text></View>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightIcon}><Feather name="droplet" size={16} color="#86efac" /></View>
              <Text style={styles.insightText}>{t.dashboard.waterUsageBetter}</Text>
              <View style={styles.chipGreen}><Text style={styles.chipGreenText}>-12%</Text></View>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightIcon}><Feather name="award" size={16} color="#fde68a" /></View>
              <Text style={styles.insightText}>{t.dashboard.newRewards}</Text>
              <View style={styles.chipAmber}><Text style={styles.chipAmberText}>{t.dashboard.new}</Text></View>
            </View>
          </Reanimated.View>

          {/* FARM HEALTH */}
          <Reanimated.View entering={FadeInUp.delay(600).duration(400)} style={styles.glassCard}>
            {/* ✅ Translated */}
            <Text style={styles.sectionTitle}>{t.dashboard.farmHealth}</Text>
            <View style={styles.healthGrid}>
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>🌱 Soil</Text>
                <View style={styles.healthBarTrack}><View style={[styles.healthBarFill, { width: '82%', backgroundColor: '#22c55e' }]} /></View>
                <Text style={styles.healthValue}>82% · {t.dashboard.soilHealthy}</Text>
              </View>
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>💧 Water</Text>
                <View style={styles.healthBarTrack}><View style={[styles.healthBarFill, { width: '74%', backgroundColor: '#3b82f6' }]} /></View>
                <Text style={styles.healthValue}>74% · {t.dashboard.waterEfficient}</Text>
              </View>
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>🐛 Pest</Text>
                <View style={styles.healthBarTrack}><View style={[styles.healthBarFill, { width: '38%', backgroundColor: '#f97316' }]} /></View>
                <Text style={styles.healthValue}>38% · {t.dashboard.pestLowRisk}</Text>
              </View>
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>☀️ Sun</Text>
                <View style={styles.healthBarTrack}><View style={[styles.healthBarFill, { width: '68%', backgroundColor: '#fbbf24' }]} /></View>
                <Text style={styles.healthValue}>68% · {t.dashboard.sunGood}</Text>
              </View>
            </View>
          </Reanimated.View>

          {/* TOOLS GRID */}
          <Reanimated.View entering={FadeInUp.delay(700).duration(400)}>
            {/* ✅ Translated */}
            <Text style={[styles.sectionTitle, { marginLeft: 4, marginTop: 10 }]}>{t.dashboard.yourTools}</Text>
            <View style={styles.toolsGrid}>

              <TouchableOpacity style={styles.toolCard} onPress={goToTasks} activeOpacity={0.75}>
                <View style={styles.toolHeader}>
                  <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                    <Feather name="check-circle" size={20} color="#ef4444" />
                  </View>
                  <View style={[styles.toolBadge, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
                    <Text style={[styles.toolBadgeText, { color: '#fca5a5' }]}>{pendingTasksCount} {t.dashboard.pending}</Text>
                  </View>
                </View>
                <Text style={styles.toolTitle}>{t.dashboard.tasks}</Text>
                <Text style={styles.toolSubtitle}>{t.dashboard.dailyMissions}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolCard} onPress={goToProofSubmit} activeOpacity={0.75}>
                <View style={styles.toolHeader}>
                  <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(134,239,172,0.15)' }]}>
                    <MaterialIcons name="photo-camera" size={20} color="#86efac" />
                  </View>
                  <View style={[styles.toolBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={styles.toolBadgeText}>{t.dashboard.fieldPhotos}</Text>
                  </View>
                </View>
                <Text style={styles.toolTitle}>{t.dashboard.submitProof}</Text>
                <Text style={styles.toolSubtitle}>{t.dashboard.uploadImages}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolCard} onPress={goToRewards} activeOpacity={0.75}>
                <View style={styles.toolHeader}>
                  <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                    <AntDesign name="gift" size={20} color="#fbbf24" />
                  </View>
                  <View style={[styles.toolBadge, { backgroundColor: 'rgba(251,191,36,0.2)' }]}>
                    <Text style={[styles.toolBadgeText, { color: '#fde68a' }]}>+34 XP</Text>
                  </View>
                </View>
                <Text style={styles.toolTitle}>{t.dashboard.rewards}</Text>
                <Text style={styles.toolSubtitle}>{t.dashboard.unlockBadges}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolCard} onPress={goToVirtualFarm} activeOpacity={0.75}>
                <View style={styles.toolHeader}>
                  <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(167,243,208,0.15)' }]}>
                    <Feather name="map" size={20} color="#6ee7b7" />
                  </View>
                  <View style={[styles.toolBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={styles.toolBadgeText}>{t.dashboard.overview}</Text>
                  </View>
                </View>
                <Text style={styles.toolTitle}>{t.dashboard.virtualFarm}</Text>
                <Text style={styles.toolSubtitle}>{t.dashboard.cropStatus}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolCard} onPress={goToLearningHub} activeOpacity={0.75}>
                <View style={styles.toolHeader}>
                  <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                    <FontAwesome5 name="play" size={16} color="#60a5fa" />
                  </View>
                  <View style={[styles.toolBadge, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                    <Text style={[styles.toolBadgeText, { color: '#bfdbfe' }]}>{t.dashboard.new}</Text>
                  </View>
                </View>
                <Text style={styles.toolTitle}>{t.dashboard.learningHub}</Text>
                <Text style={styles.toolSubtitle}>{t.dashboard.watchLearn}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolCard} onPress={goToCommunity} activeOpacity={0.75}>
                <View style={styles.toolHeader}>
                  <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                    <Ionicons name="people" size={20} color="#4ade80" />
                  </View>
                  <View style={[styles.toolBadge, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                    <Text style={[styles.toolBadgeText, { color: '#86efac' }]}>{t.dashboard.live}</Text>
                  </View>
                </View>
                <Text style={styles.toolTitle}>{t.dashboard.community}</Text>
                <Text style={styles.toolSubtitle}>{t.dashboard.askExperts}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.toolCard, { width: '100%' }]} onPress={goToGovSchemes} activeOpacity={0.75}>
                <View style={styles.toolHeader}>
                  <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                    <Ionicons name="document-text" size={20} color="#ffffff" />
                  </View>
                  <View style={[styles.toolBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                    <Text style={styles.toolBadgeText}>3 {t.dashboard.eligible}</Text>
                  </View>
                </View>
                <Text style={styles.toolTitle}>{t.dashboard.govSchemes}</Text>
                <Text style={styles.toolSubtitle}>{t.dashboard.findSubsidies}</Text>
              </TouchableOpacity>

            </View>
          </Reanimated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingText: { fontSize: 16, color: '#bbf7d0', fontWeight: '600' },
  userName: { fontSize: 26, color: '#ffffff', fontWeight: '800', marginTop: 2, letterSpacing: -0.5 },
  dateText: { fontSize: 12, color: '#86efac', marginTop: 4, opacity: 0.8 },
  avatarContainer: { alignItems: 'center', justifyContent: 'center' },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#053B24', borderWidth: 2, borderColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  levelBadge: { position: 'absolute', bottom: -6, backgroundColor: '#d97706', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#fde68a' },
  levelBadgeText: { color: '#fffbeb', fontSize: 10, fontWeight: '900' },
  headerBottomRow: { marginTop: 16 },
  headerXpTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  headerXpFill: { height: 4, borderRadius: 2 },
  headerXpLabel: { fontSize: 10, color: '#bbf7d0', alignSelf: 'flex-end', marginTop: 6, fontWeight: '600' },
  weatherHero: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
  weatherTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locationText: { color: '#86efac', fontSize: 13, fontWeight: '600', marginLeft: 4 },
  heroTemp: { fontSize: 52, fontWeight: '900', color: '#ffffff', lineHeight: 60 },
  heroCondition: { fontSize: 15, color: '#86efac', fontWeight: '600' },
  heroFeelsLike: { fontSize: 12, color: '#6b9e7a', marginTop: 4 },
  weatherHeroRight: { alignItems: 'flex-end' },
  irrigationChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22c55e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 4 },
  irrigationChipText: { color: '#021F0F', fontSize: 10, fontWeight: '800', marginLeft: 4 },
  farmingScorePill: { marginTop: 12, backgroundColor: 'rgba(251,191,36,0.15)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scorePillText: { color: '#fde68a', fontSize: 11, fontWeight: '700' },
  weatherStatBoxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  miniStatBox: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  miniStatText: { color: '#e2e8f0', fontSize: 11, fontWeight: '600' },
  rowCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  halfCardWrapper: { width: '48%' },
  halfCard: { height: 90, borderRadius: 20, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  streakCard: { borderColor: 'rgba(251,191,36,0.3)' },
  xpCard: { borderColor: 'rgba(34,197,94,0.3)' },
  halfCardEmoji: { fontSize: 32, marginRight: 10 },
  halfCardTitle: { fontSize: 14, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  halfCardSubGold: { fontSize: 12, fontWeight: '700', color: '#fbbf24' },
  miniProgressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, width: 60 },
  miniProgressFill: { height: 4, backgroundColor: '#22c55e', borderRadius: 2 },
  missionCircleContainer: { alignItems: 'center', marginBottom: 24, paddingVertical: 10 },
  outerGlowRing: { width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(34,197,94,0.08)', alignItems: 'center', justifyContent: 'center' },
  circleInnerContent: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  circlePercentage: { fontSize: 26, fontWeight: '900', color: '#ffffff', marginTop: 4 },
  circleLabel: { fontSize: 11, color: '#86efac', fontWeight: '600' },
  levelBadgeAmber: { backgroundColor: '#d97706', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, marginTop: -15, borderWidth: 2, borderColor: '#053B24' },
  levelBadgeAmberText: { color: '#fffbeb', fontSize: 11, fontWeight: '800' },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 16 },
  insightRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  insightIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  insightText: { flex: 1, color: '#ffffff', fontSize: 13, fontWeight: '500' },
  chipGreen: { backgroundColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  chipGreenText: { color: '#4ade80', fontSize: 11, fontWeight: '700' },
  chipAmber: { backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  chipAmberText: { color: '#fde68a', fontSize: 11, fontWeight: '700' },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  healthItem: { width: '48%', backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 16, marginBottom: 12 },
  healthLabel: { color: '#e2e8f0', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  healthBarTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 6 },
  healthBarFill: { height: 6, borderRadius: 3 },
  healthValue: { color: '#94a3b8', fontSize: 11, fontWeight: '500' },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  toolCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  toolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  toolIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  toolBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  toolBadgeText: { fontSize: 10, fontWeight: '700', color: '#e2e8f0' },
  toolTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  toolSubtitle: { color: '#94a3b8', fontSize: 12 },
});