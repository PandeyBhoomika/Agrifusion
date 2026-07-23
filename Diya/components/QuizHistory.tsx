// components/QuizHistory.tsx
// Shows the user's quiz attempt history

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface HistoryEntry {
  _id: string;
  category: string;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  xpEarned: number;
  coinsEarned: number;
  completedAt: string;
}

const DIFFICULTY_CONFIG = {
  easy:   { emoji: '🌱', color: '#10B981', bg: '#D1FAE5' },
  medium: { emoji: '🌾', color: '#F59E0B', bg: '#FEF3C7' },
  hard:   { emoji: '🔥', color: '#EF4444', bg: '#FEE2E2' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'soil-health': '🌱',
  'crop-management': '🌾',
  'irrigation': '💧',
  'pest-control': '🐛',
  'sustainable-farming': '♻️',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function QuizHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/quiz/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        // ✅ FIXED: handle both json.data and json.history, default to []
        if (json.success) {
          setHistory(json.data || json.history || []);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Failed to fetch quiz history:', err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}>📝</Text>
        <Text style={styles.emptyTitle}>No quiz history yet</Text>
        <Text style={styles.emptySubtitle}>Complete a quiz to see your results here!</Text>
      </View>
    );
  }

  // Stats summary
  const totalAttempts = history.length;
  const passedCount = history.filter(h => h.passed).length;
  const totalXP = history.reduce((sum, h) => sum + (h.xpEarned || 0), 0);
  const avgScore = Math.round(history.reduce((sum, h) => sum + (h.percentage || 0), 0) / totalAttempts);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Summary card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Your Quiz Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalAttempts}</Text>
            <Text style={styles.statLabel}>Attempts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{passedCount}</Text>
            <Text style={styles.statLabel}>Passed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{avgScore}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Attempts</Text>

      {history.map((entry) => {
        const diff = DIFFICULTY_CONFIG[entry.difficulty] || DIFFICULTY_CONFIG.medium;
        const icon = CATEGORY_ICONS[entry.category] || '📚';
        return (
          <View key={entry._id} style={styles.historyCard}>
            <View style={styles.cardLeft}>
              <View style={styles.categoryIconWrap}>
                <Text style={{ fontSize: 24 }}>{icon}</Text>
              </View>
            </View>
            <View style={styles.cardMiddle}>
              <View style={styles.cardTopRow}>
                <Text style={styles.categoryName}>{entry.categoryName}</Text>
                <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
                  <Text style={[styles.diffText, { color: diff.color }]}>
                    {diff.emoji} {entry.difficulty}
                  </Text>
                </View>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>
                  {entry.score}/{entry.totalPoints} pts
                </Text>
                <Text style={[
                  styles.percentText,
                  { color: entry.passed ? '#10B981' : '#EF4444' }
                ]}>
                  {Math.round(entry.percentage || 0)}%
                </Text>
              </View>
              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(entry.percentage || 0, 100)}%`,
                    backgroundColor: entry.passed ? '#10B981' : '#EF4444',
                  }
                ]} />
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.timeText}>{timeAgo(entry.completedAt)}</Text>
                <View style={styles.rewardsRow}>
                  {(entry.xpEarned || 0) > 0 && (
                    <Text style={styles.xpText}>+{entry.xpEarned} XP</Text>
                  )}
                  {(entry.coinsEarned || 0) > 0 && (
                    <Text style={styles.coinText}>+{entry.coinsEarned} 🪙</Text>
                  )}
                </View>
                <View style={[
                  styles.resultBadge,
                  { backgroundColor: entry.passed ? '#D1FAE5' : '#FEE2E2' }
                ]}>
                  <Text style={[
                    styles.resultText,
                    { color: entry.passed ? '#065F46' : '#991B1B' }
                  ]}>
                    {entry.passed ? '✅ Passed' : '❌ Failed'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  summaryCard: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 18, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 22, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 3, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginHorizontal: 16, marginBottom: 10 },
  historyCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardLeft: { marginRight: 12, justifyContent: 'flex-start', paddingTop: 2 },
  categoryIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#D1FAE5' },
  cardMiddle: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  categoryName: { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  diffText: { fontSize: 11, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scoreText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  percentText: { fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeText: { fontSize: 11, color: '#9CA3AF' },
  rewardsRow: { flexDirection: 'row', gap: 6 },
  xpText: { fontSize: 11, color: '#8B5CF6', fontWeight: '700' },
  coinText: { fontSize: 11, color: '#F59E0B', fontWeight: '700' },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  resultText: { fontSize: 11, fontWeight: '700' },
});
