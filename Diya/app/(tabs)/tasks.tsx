import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

interface CropTask {
  id: string;       // UserCropTask row id — used for completing/proof submission
  taskId: string;    // underlying Task template id
  title: string;
  description: string;
  category: string;
  xpReward: number;
  coinReward: number;
  requiresProof: boolean;
  difficulty: string;
  stage: string;
  stageOrder: number;
  crop: string;
  status: 'locked' | 'active' | 'approved';
  isCompleted: boolean;
}

const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  'Water Conservation': { color: '#3b82f6', icon: '💧' },
  'Soil Health': { color: '#b45309', icon: '🪨' },
  'Pest Control': { color: '#ef4444', icon: '🐛' },
  'Crop Management': { color: '#f59e0b', icon: '🧺' },
  'General': { color: '#10b981', icon: '♻️' },
};

const DIFFICULTY_EMOJI: Record<string, string> = {
  Easy: '🌱', Medium: '🌿', Hard: '🌳',
};

export default function TasksScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [crops, setCrops] = useState<string[]>([]);
  const [activeCrop, setActiveCrop] = useState<string | null>(null);
  const [chain, setChain] = useState<CropTask[]>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(true);
  const [isLoadingChain, setIsLoadingChain] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // ── Step 1: find out which crops this user has ────────────────────
  const fetchCrops = useCallback(async () => {
    setIsLoadingCrops(true);
    setLoadError(false);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/tasks/my-crops`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data = await response.json();
      const cropList: string[] = data.crops || [];
      setCrops(cropList);
      if (cropList.length > 0) {
        setActiveCrop((prev) => prev && cropList.includes(prev) ? prev : cropList[0]);
      }
    } catch (error) {
      console.error('Failed to load crops:', error);
      setLoadError(true);
    } finally {
      setIsLoadingCrops(false);
    }
  }, []);

  // ── Step 2: fetch the chain for whichever crop tab is active ──────
  const fetchChain = useCallback(async (crop: string) => {
    setIsLoadingChain(true);
    setLoadError(false);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/tasks/crop-chain?crop=${encodeURIComponent(crop)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data = await response.json();
      setChain(data.data || []);
    } catch (error) {
      console.error('Failed to load crop chain:', error);
      setChain([]);
      setLoadError(true);
    } finally {
      setIsLoadingChain(false);
    }
  }, []);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);
  useEffect(() => { if (activeCrop) fetchChain(activeCrop); }, [activeCrop, fetchChain]);

  const completedCount = chain.filter((c) => c.status === 'approved').length;
  const earnedXP = chain.filter((c) => c.status === 'approved').reduce((sum, c) => sum + (c.xpReward || 0), 0);

  const handleMarkDone = (task: CropTask) => {
    if (task.requiresProof) {
      router.push({
        pathname: '/proof-submission',
        params: { userCropTaskId: task.id, xpReward: String(task.xpReward), title: task.title },
      } as any);
    } else {
      completeStep(task.id);
    }
  };

  const completeStep = async (userCropTaskId: string) => {
    setChain((prev) => prev.map((c) => c.id === userCropTaskId ? { ...c, status: 'approved', isCompleted: true } : c));
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/tasks/crop-chain/${userCropTaskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        console.warn('Failed to sync step completion with backend.');
        if (activeCrop) fetchChain(activeCrop); // re-sync from server on failure
      } else if (activeCrop) {
        fetchChain(activeCrop); // re-fetch so the next step's "active" status shows correctly
      }
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      if (activeCrop) fetchChain(activeCrop);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>{t.tasks.weeklyMissions}</Text>
          {activeCrop && <Text style={styles.headerDate}>{activeCrop} journey</Text>}
        </Animated.View>

        {isLoadingCrops ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#166534" />
          </View>
        ) : crops.length === 0 ? (
          <Animated.View entering={ZoomIn.duration(400)} style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🌾</Text>
            <Text style={styles.emptyStateText}>No crops selected yet</Text>
            <TouchableOpacity style={[styles.markDoneBtn, { marginTop: 16 }]} onPress={() => router.push('/farm-profile' as any)} activeOpacity={0.8}>
              <Text style={styles.markDoneBtnText}>Complete Farm Profile</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            {/* CROP TABS */}
            <Animated.ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              entering={SlideInRight.delay(200).duration(400)}
            >
              {crops.map((crop) => (
                <TouchableOpacity
                  key={crop} activeOpacity={0.75}
                  onPress={() => setActiveCrop(crop)}
                  style={[styles.filterChip, activeCrop === crop && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, activeCrop === crop && styles.filterTextActive]}>🌾 {crop}</Text>
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>

            {/* SUMMARY */}
            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.summaryCard}>
              <View style={styles.summaryStats}>
                <View>
                  <Text style={styles.summaryLabel}>{t.tasks.tasksDone}</Text>
                  <Text style={styles.summaryValue}>{completedCount}/{chain.length || 0}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View>
                  <Text style={styles.summaryLabel}>{t.tasks.xpEarned}</Text>
                  <Text style={styles.summaryValueXP}>{earnedXP} XP</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: chain.length > 0 ? `${(completedCount / chain.length) * 100}%` : '0%' }]} />
              </View>
            </Animated.View>

            {/* TASK LIST */}
            <View style={styles.taskList}>
              {isLoadingChain ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#166534" />
                  <Text style={{ marginTop: 12, color: '#166534', fontWeight: '600' }}>{t.tasks.fetchingMissions}</Text>
                </View>
              ) : loadError ? (
                <Animated.View entering={ZoomIn.duration(400)} style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>⚠️</Text>
                  <Text style={styles.emptyStateText}>Couldn't load tasks. Check your connection.</Text>
                  <TouchableOpacity style={[styles.markDoneBtn, { marginTop: 16 }]} onPress={() => activeCrop && fetchChain(activeCrop)} activeOpacity={0.8}>
                    <Text style={styles.markDoneBtnText}>Retry</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                chain.map((task, index) => {
                  const conf = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG['General'];
                  const diffEmoji = DIFFICULTY_EMOJI[task.difficulty] || '🌱';
                  const isLocked = task.status === 'locked';
                  return (
                    <Animated.View
                      key={task.id}
                      entering={FadeInUp.delay(300 + (index * 80)).duration(400)}
                      style={[styles.taskCard, task.status === 'approved' && styles.taskCardCompleted]}
                    >
                      <View style={styles.taskCardTouchArea}>
                        <View style={[styles.colorStripe, { backgroundColor: isLocked ? '#9ca3af' : conf.color }]} />
                        <View style={styles.taskCardInner}>
                          <View style={styles.taskHeaderRow}>
                            <View style={[styles.iconCircle, { backgroundColor: isLocked ? '#f3f4f6' : `${conf.color}20` }]}>
                              <Text style={styles.categoryEmoji}>{isLocked ? '🔒' : conf.icon}</Text>
                            </View>
                            <View style={styles.titleContainer}>
                              <Text style={styles.stageLabel}>{task.stage}</Text>
                              <Text style={[styles.taskTitle, task.status === 'approved' && styles.strikethrough]}>{task.title}</Text>
                              <Text style={styles.difficultyText}>{diffEmoji} {task.difficulty}</Text>
                            </View>
                            <View style={styles.xpBadge}>
                              <Text style={styles.xpBadgeText}>+{task.xpReward} XP</Text>
                            </View>
                          </View>
                          <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                          <View style={styles.taskFooterRow}>
                            {task.status === 'approved' ? (
                              <View style={styles.completedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                <Text style={styles.completedText}>{t.tasks.completed}</Text>
                              </View>
                            ) : task.status === 'locked' ? (
                              <View style={styles.completedBadge}>
                                <Ionicons name="lock-closed" size={18} color="#9ca3af" />
                                <Text style={[styles.completedText, { color: '#9ca3af' }]}>Locked</Text>
                              </View>
                            ) : (
                              <TouchableOpacity style={styles.markDoneBtn} activeOpacity={0.8} onPress={() => handleMarkDone(task)}>
                                <Text style={styles.markDoneBtnText}>{t.tasks.markDone}</Text>
                                {task.requiresProof && <Ionicons name="camera" size={16} color="#ffffff" style={{ marginLeft: 6 }} />}
                              </TouchableOpacity>
                            )}
                            <View style={styles.coinIndicator}>
                              <FontAwesome5 name="coins" size={14} color="#fbbf24" />
                              <Text style={styles.coinText}>{task.coinReward || 0}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 56, paddingBottom: 100 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#14532d', letterSpacing: -0.5 },
  headerDate: { fontSize: 16, color: '#166534', fontWeight: '600', marginTop: 4, opacity: 0.8 },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 16 },
  summaryLabel: { fontSize: 14, color: '#6b7280', fontWeight: '600', textAlign: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '900', color: '#14532d', textAlign: 'center', marginTop: 4 },
  summaryValueXP: { fontSize: 24, fontWeight: '900', color: '#d97706', textAlign: 'center', marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#e5e7eb' },
  progressBarBg: { height: 8, backgroundColor: '#dcfce7', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 4 },
  filterContainer: { flexDirection: 'row', marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' },
  filterChipActive: { backgroundColor: '#14532d', borderColor: '#14532d' },
  filterText: { color: '#166534', fontWeight: '700' },
  filterTextActive: { color: '#ffffff' },
  taskList: { gap: 16 },
  taskCard: { backgroundColor: '#ffffff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(34,197,94,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  taskCardTouchArea: { flexDirection: 'row' },
  taskCardCompleted: { backgroundColor: '#f8fafc', opacity: 0.75 },
  colorStripe: { width: 6 },
  taskCardInner: { flex: 1, padding: 16 },
  taskHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryEmoji: { fontSize: 20 },
  titleContainer: { flex: 1 },
  stageLabel: { fontSize: 11, color: '#16a34a', fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  strikethrough: { textDecorationLine: 'line-through', color: '#9ca3af' },
  difficultyText: { fontSize: 12, color: '#6b7280', fontWeight: '500', marginTop: 2 },
  xpBadge: { backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a' },
  xpBadgeText: { fontSize: 12, fontWeight: '900', color: '#d97706' },
  taskDesc: { fontSize: 14, color: '#4b5563', fontWeight: '500', marginBottom: 16, lineHeight: 20 },
  taskFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  markDoneBtn: { backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  markDoneBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  completedBadge: { flexDirection: 'row', alignItems: 'center' },
  completedText: { color: '#22c55e', fontWeight: '700', marginLeft: 6 },
  coinIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a' },
  coinText: { color: '#d97706', fontWeight: '900', marginLeft: 6 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateEmoji: { fontSize: 64, marginBottom: 16 },
  emptyStateText: { fontSize: 18, color: '#166534', fontWeight: '700' },
});