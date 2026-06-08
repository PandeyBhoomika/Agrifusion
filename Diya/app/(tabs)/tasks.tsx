import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  soil:       { color: '#a16207', icon: '🪨', label: 'Soil' },
  pest:       { color: '#ef4444', icon: '🐛', label: 'Pest' },
  harvest:    { color: '#f59e0b', icon: '🧺', label: 'Harvest' },
  organic:    { color: '#10b981', icon: '♻️', label: 'Organic' },
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
      // Simplistic 'today' check for mock data
      return tasks.filter(t => !t.isCompleted); 
    }
    return tasks.filter(t => CATEGORY_CONFIG[t.category].label === activeFilter);
  }, [tasks, activeFilter]);

  // --- ACTIONS ---
  const handleMarkDone = (task: FarmTask) => {
    if (task.requiresProof) {
      // If proof is needed, we would navigate to a proof submission screen
      // router.push({ pathname: '/proof-submission', params: { taskId: task.id }});
      alert('This task requires a photo! Opening camera...');
      
      // Simulating successful proof for now:
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
      <LinearGradient colors={['#d4efdd', '#c0e5ce', '#b0dcc2']} style={StyleSheet.absoluteFillObject} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>This Week's Missions 🌾</Text>
          <Text style={styles.headerDate}>June 4 - June 10</Text>
        </View>

        {/* --- PROGRESS SUMMARY --- */}
        <View style={styles.summaryCard}>
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
        </View>

        {/* --- FILTERS --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {FILTERS.map(filter => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- TASK LIST --- */}
        <View style={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🌱</Text>
              <Text style={styles.emptyStateText}>No tasks today — great job! 🎉</Text>
            </View>
          ) : (
            filteredTasks.map(task => {
              const conf = CATEGORY_CONFIG[task.category];
              return (
                <View key={task.id} style={[styles.taskCard, task.isCompleted && styles.taskCardCompleted]}>
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
                          onPress={() => handleMarkDone(task)}
                        >
                          <Text style={styles.markDoneBtnText}>Mark Done</Text>
                          {task.requiresProof && <Ionicons name="camera" size={16} color="#fff" style={{marginLeft: 6}}/>}
                        </TouchableOpacity>
                      )}
                      
                      {/* Coins indicator */}
                      <View style={styles.coinIndicator}>
                        <FontAwesome5 name="coins" size={14} color="#eab308" />
                        <Text style={styles.coinText}>{task.coinReward}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* --- FLOATING ACTION BUTTON --- */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100, // Space for FAB
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#14532d',
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14532d',
    textAlign: 'center',
    marginTop: 4,
  },
  summaryValueXP: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d97706', // Amber for XP
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
    borderColor: '#dcfce7',
  },
  filterChipActive: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  filterText: {
    color: '#166534',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  taskList: {
    gap: 16,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  taskCardCompleted: {
    backgroundColor: '#f8fafc',
    opacity: 0.85,
  },
  colorStripe: {
    width: 6,
    height: '100%',
  },
  taskCardInner: {
    flex: 1,
    padding: 16,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
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
    fontWeight: 'bold',
    color: '#d97706',
  },
  taskDesc: {
    fontSize: 14,
    color: '#4b5563',
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
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markDoneBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    color: '#22c55e',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  coinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefce8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinText: {
    color: '#ca8a04',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#166534', // Deep green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});