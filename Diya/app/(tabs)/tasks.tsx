import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';

// --- DATA INTERFACES ---
interface FarmTask {
  id: string;
  title: string;
  description: string;
  category: 'irrigation' | 'soil' | 'pest' | 'harvest' | 'organic';
  xpReward: number;
  coinReward: number;
  dueDate: Date;
  isCompleted: boolean;
  requiresProof: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

// --- MOCK DATA ---
const INITIAL_TASKS: FarmTask[] = [
  {
    id: 't1',
    title: 'Drip Irrigation Check',
    description: 'Inspect the main water line for leaks and ensure all drip emitters are flowing.',
    category: 'irrigation',
    xpReward: 15,
    coinReward: 5,
    dueDate: new Date(),
    isCompleted: false,
    requiresProof: false,
    difficulty: 'easy',
  },
  {
    id: 't2',
    title: 'Apply Neem Oil Spray',
    description: 'Spray neem oil mixture on the tomato crop to prevent aphid infestation.',
    category: 'pest',
    xpReward: 30,
    coinReward: 10,
    dueDate: new Date(),
    isCompleted: false,
    requiresProof: true,
    difficulty: 'medium',
  },
  {
    id: 't3',
    title: 'Soil Testing Sample',
    description: 'Collect 5 soil samples from the northern plot and send to the lab.',
    category: 'soil',
    xpReward: 50,
    coinReward: 20,
    dueDate: new Date(),
    isCompleted: false,
    requiresProof: true,
    difficulty: 'hard',
  },
  {
    id: 't4',
    title: 'Harvest Mature Okra',
    description: 'Pick all okra pods that are between 3-4 inches long.',
    category: 'harvest',
    xpReward: 20,
    coinReward: 5,
    dueDate: new Date(),
    isCompleted: true,
    requiresProof: false,
    difficulty: 'medium',
  },
];

// --- HELPER CONFIGS ---
const CATEGORY_CONFIG = {
  irrigation: { color: '#3b82f6', icon: '💧', label: 'Irrigation' },
  soil: { color: '#b45309', icon: '🪨', label: 'Soil' },
  pest: { color: '#ef4444', icon: '🐛', label: 'Pest' },
  harvest: { color: '#f59e0b', icon: '🧺', label: 'Harvest' },
  organic: { color: '#10b981', icon: '♻️', label: 'Organic' },
};

const DIFFICULTY_EMOJI = {
  easy: '🌱',
  medium: '🌿',
  hard: '🌳',
};

const FILTERS = ['All', 'Today', 'Irrigation', 'Soil', 'Pest', 'Organic'];

export default function TasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<FarmTask[]>(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState('All');

  // --- DERIVED STATE ---
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const earnedXP = tasks.filter(t => t.isCompleted).reduce((sum, t) => sum + t.xpReward, 0);

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'All') return tasks;
    if (activeFilter === 'Today') {
      return tasks.filter(t => !t.isCompleted);
    }
    return tasks.filter(t => CATEGORY_CONFIG[t.category].label === activeFilter);
  }, [tasks, activeFilter]);

  // --- ACTIONS ---
  const handleMarkDone = (task: FarmTask) => {
    if (task.requiresProof) {
      // In real app: router.push({ pathname: '/proof-submission', params: { taskId: task.id }});
      alert('This task requires a photo! Opening camera...');
      completeTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: true } : t));
  };

  return (
    <View style={styles.container}>
      {/* LIGHT theme background as requested */}
      <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* --- HEADER --- */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>This Week's Missions 🌾</Text>
          <Text style={styles.headerDate}>June 4 - June 10</Text>
        </Animated.View>

        {/* --- PROGRESS SUMMARY --- */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.summaryCard}>
          <View style={styles.summaryStats}>
            <View>
              <Text style={styles.summaryLabel}>Tasks Done</Text>
              <Text style={styles.summaryValue}>{completedTasks}/{tasks.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              <Text style={styles.summaryLabel}>XP Earned</Text>
              <Text style={styles.summaryValueXP}>{earnedXP} XP</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(completedTasks / tasks.length) * 100}%` }]} />
          </View>
        </Animated.View>

        {/* --- FILTERS --- */}
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          entering={SlideInRight.delay(300).duration(400)}
        >
          {FILTERS.map((filter, index) => (
            <TouchableOpacity
              key={filter}
              activeOpacity={0.75}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>

        {/* --- TASK LIST --- */}
        <View style={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <Animated.View entering={ZoomIn.delay(400)} style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🌱</Text>
              <Text style={styles.emptyStateText}>No tasks today — great job! 🎉</Text>
            </Animated.View>
          ) : (
            filteredTasks.map((task, index) => {
              const conf = CATEGORY_CONFIG[task.category];
              return (
                <Animated.View
                  key={task.id}
                  entering={FadeInUp.delay(400 + (index * 100)).duration(400)}
                  style={[styles.taskCard, task.isCompleted && styles.taskCardCompleted]}
                >
                  <TouchableOpacity activeOpacity={0.75} style={styles.taskCardTouchArea}>
                    {/* Left Color Stripe */}
                    <View style={[styles.colorStripe, { backgroundColor: conf.color }]} />

                    <View style={styles.taskCardInner}>
                      {/* Top Row: Icon + Title + XP */}
                      <View style={styles.taskHeaderRow}>
                        <View style={[styles.iconCircle, { backgroundColor: `${conf.color}20` }]}>
                          <Text style={styles.categoryEmoji}>{conf.icon}</Text>
                        </View>
                        <View style={styles.titleContainer}>
                          <Text style={[styles.taskTitle, task.isCompleted && styles.strikethrough]}>
                            {task.title}
                          </Text>
                          <Text style={styles.difficultyText}>
                            {DIFFICULTY_EMOJI[task.difficulty]} {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                          </Text>
                        </View>
                        <View style={styles.xpBadge}>
                          <Text style={styles.xpBadgeText}>+{task.xpReward} XP</Text>
                        </View>
                      </View>

                      {/* Middle Row: Description */}
                      <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>

                      {/* Bottom Row: Actions */}
                      <View style={styles.taskFooterRow}>
                        {task.isCompleted ? (
                          <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                            <Text style={styles.completedText}>Completed</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.markDoneBtn}
                            activeOpacity={0.8}
                            onPress={() => handleMarkDone(task)}
                          >
                            <Text style={styles.markDoneBtnText}>Mark Done</Text>
                            {task.requiresProof && <Ionicons name="camera" size={16} color="#ffffff" style={{ marginLeft: 6 }} />}
                          </TouchableOpacity>
                        )}

                        {/* Coins indicator */}
                        <View style={styles.coinIndicator}>
                          <FontAwesome5 name="coins" size={14} color="#fbbf24" />
                          <Text style={styles.coinText}>{task.coinReward}</Text>
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

      {/* --- FLOATING ACTION BUTTON --- */}
      <Animated.View entering={ZoomIn.delay(800).duration(400)} style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <MaterialIcons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 56, // Safe area
    paddingBottom: 100, // Space for custom tab bar & FAB
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#14532d',
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.8,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#14532d',
    textAlign: 'center',
    marginTop: 4,
  },
  summaryValueXP: {
    fontSize: 24,
    fontWeight: '900',
    color: '#d97706',
    textAlign: 'center',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  filterChipActive: {
    backgroundColor: '#14532d', // Deep green from prompt
    borderColor: '#14532d',
  },
  filterText: {
    color: '#166534',
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  taskList: {
    gap: 16,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24, // softer radius from standard card language
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  taskCardTouchArea: {
    flexDirection: 'row',
  },
  taskCardCompleted: {
    backgroundColor: '#f8fafc',
    opacity: 0.75,
  },
  colorStripe: {
    width: 6,
  },
  taskCardInner: {
    flex: 1,
    padding: 16,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  titleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  difficultyText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#d97706', // amber XP color
  },
  taskDesc: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 20,
  },
  taskFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markDoneBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markDoneBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    color: '#22c55e',
    fontWeight: '700',
    marginLeft: 6,
  },
  coinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  coinText: {
    color: '#d97706',
    fontWeight: '900',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#166534',
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 90, // Clears the custom tab bar
    right: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#021F0F', // Darkest green per prompt for FAB
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
});