import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import type { Task } from '../../context/TaskContext';

const CATEGORY_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  'Water Conservation': { color: '#3b82f6', icon: '💧', label: 'Water' },
  'Soil Health': { color: '#b45309', icon: '🪨', label: 'Soil' },
  'Pest Control': { color: '#ef4444', icon: '🐛', label: 'Pest' },
  'Crop Management': { color: '#f59e0b', icon: '🧺', label: 'Harvest' },
  'General': { color: '#10b981', icon: '♻️', label: 'General' },
  // Lowercase versions for compatibility
  'water conservation': { color: '#3b82f6', icon: '💧', label: 'Water' },
  'soil health': { color: '#b45309', icon: '🪨', label: 'Soil' },
  'pest control': { color: '#ef4444', icon: '🐛', label: 'Pest' },
  'crop management': { color: '#f59e0b', icon: '🧺', label: 'Harvest' },
  'general': { color: '#10b981', icon: '♻️', label: 'General' },
};

const DIFFICULTY_EMOJI: Record<string, string> = {
  Easy: '🌱',
  Medium: '🌿',
  Hard: '🌳',
  easy: '🌱',
  medium: '🌿',
  hard: '🌳',
};

export default function TasksScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { tasks, completedTasks, pendingTasks, loading, refreshTasks, completeTask } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // ✅ Translated filters — defined inside component so t is available
  const FILTERS = [t.tasks.all, t.tasks.today, 'Water', 'Soil', 'Pest', 'General'];

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredTasks = useMemo(() => {
    if (activeFilter === t.tasks.all || activeFilter === 'All') return tasks;
    if (activeFilter === t.tasks.today || activeFilter === 'Today') return pendingTasks;
    
    // Filter by category label
    const categoryMap: Record<string, string[]> = {
      'Water': ['Water Conservation', 'water conservation'],
      'Soil': ['Soil Health', 'soil health'],
      'Pest': ['Pest Control', 'pest control'],
      'General': ['General', 'general'],
    };
    
    const targetCategories = categoryMap[activeFilter] || [];
    return tasks.filter(task => targetCategories.includes(task.category));
  }, [tasks, pendingTasks, activeFilter, t]);

  const handleMarkDone = async (task: Task) => {
    if (task.requiresProof) {
      // ✅ Translated
      alert(t.tasks.requiresPhoto);
    }
    await completeTask(task._id || task.id || '');
  };

  const completedCount = completedTasks.length;
  const earnedXP = completedTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={StyleSheet.absoluteFillObject} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
      >

        {/* HEADER */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          {/* ✅ Translated */}
          <Text style={styles.headerTitle}>{t.tasks.weeklyMissions}</Text>
          <Text style={styles.headerDate}>June 4 - June 10</Text>
        </Animated.View>

        {/* PROGRESS SUMMARY */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.summaryCard}>
          <View style={styles.summaryStats}>
            <View>
              {/* ✅ Translated */}
              <Text style={styles.summaryLabel}>{t.tasks.tasksDone}</Text>
              <Text style={styles.summaryValue}>{completedCount}/{tasks.length || 0}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              {/* ✅ Translated */}
              <Text style={styles.summaryLabel}>{t.tasks.xpEarned}</Text>
              <Text style={styles.summaryValueXP}>{earnedXP} XP</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' }]} />
          </View>
        </Animated.View>

        {/* FILTERS */}
        <Animated.ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          entering={SlideInRight.delay(300).duration(400)}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter} activeOpacity={0.75}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>

        {/* TASK LIST */}
        <View style={styles.taskList}>
          {loading ? (
            <Animated.View entering={ZoomIn.duration(400)} style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#166534" />
              {/* ✅ Translated */}
              <Text style={{ marginTop: 12, color: '#166534', fontWeight: '600' }}>{t.tasks.fetchingMissions}</Text>
            </Animated.View>
          ) : filteredTasks.length === 0 ? (
            <Animated.View entering={ZoomIn.delay(400)} style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🌱</Text>
              {/* ✅ Translated */}
              <Text style={styles.emptyStateText}>{t.tasks.noTasksToday}</Text>
            </Animated.View>
          ) : (
            filteredTasks.map((task, index) => {
              const conf = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG['general'];
              const diffEmoji = DIFFICULTY_EMOJI[task.difficulty] || '🌱';
              const taskId = task._id || task.id || `task-${index}`;
              return (
                <Animated.View
                  key={taskId}
                  entering={FadeInUp.delay(400 + (index * 100)).duration(400)}
                  style={[styles.taskCard, task.isCompleted && styles.taskCardCompleted]}
                >
                  <TouchableOpacity activeOpacity={0.75} style={styles.taskCardTouchArea}>
                    <View style={[styles.colorStripe, { backgroundColor: conf.color }]} />
                    <View style={styles.taskCardInner}>
                      <View style={styles.taskHeaderRow}>
                        <View style={[styles.iconCircle, { backgroundColor: `${conf.color}20` }]}>
                          <Text style={styles.categoryEmoji}>{conf.icon}</Text>
                        </View>
                        <View style={styles.titleContainer}>
                          <Text style={[styles.taskTitle, task.isCompleted && styles.strikethrough]}>{task.title}</Text>
                          <Text style={styles.difficultyText}>
                            {diffEmoji} {task.difficulty ? task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1) : 'Standard'}
                          </Text>
                        </View>
                        <View style={styles.xpBadge}>
                          <Text style={styles.xpBadgeText}>+{task.xpReward} XP</Text>
                        </View>
                      </View>
                      <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                      <View style={styles.taskFooterRow}>
                        {task.isCompleted ? (
                          <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                            {/* ✅ Translated */}
                            <Text style={styles.completedText}>{t.tasks.completed}</Text>
                          </View>
                        ) : (
                          <TouchableOpacity style={styles.markDoneBtn} activeOpacity={0.8} onPress={() => handleMarkDone(task)}>
                            {/* ✅ Translated */}
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
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Animated.View entering={ZoomIn.delay(800).duration(400)} style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <MaterialIcons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
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
  filterContainer: { flexDirection: 'row', marginBottom: 20 },
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
  categoryEmoji: { fontSize: 22 },
  titleContainer: { flex: 1 },
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
  fabContainer: { position: 'absolute', bottom: 90, right: 24 },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#021F0F', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
});