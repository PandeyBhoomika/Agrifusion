import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CommunityDashboardProps {
  onViewDashboard: () => void;
  onViewVirtualFarm: () => void;
  onViewWeeklyTasks: () => void;
  onViewLearningHub: () => void;
}

export default function CommunityDashboard({
  onViewDashboard,
  onViewVirtualFarm,
  onViewWeeklyTasks,
  onViewLearningHub,
}: CommunityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'feed' | 'challenges' | 'leaderboard'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [notifications] = useState(3);

  const posts = [
    {
      id: '1',
      author: { name: 'Rajesh Kumar', location: 'Punjab, India', avatar: '👨‍🌾', verified: true, level: 4 },
      content:
        'Just completed installing drip irrigation in my wheat field! 💧 Reduced water usage by 40% and plants are healthier than ever. #WaterConservation',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      liked: true,
      isSuccessStory: false,
    },
    {
      id: '2',
      author: { name: 'Priya Sharma', location: 'Haryana, India', avatar: '👩‍🌾', verified: false, level: 2 },
      content:
        'Can anyone help with organic pest control for tomatoes? 🍅 Looking for natural solutions. #OrganicFarming',
      timestamp: '4 hours ago',
      likes: 12,
      comments: 15,
      shares: 2,
      liked: false,
      isSuccessStory: false,
    },
    {
      id: '3',
      author: { name: 'Amit Patel', location: 'Gujarat, India', avatar: '🧑‍🌾', verified: true, level: 5 },
      content:
        'Incredible harvest this season! 🎉 30% increase in yield with sustainable practices. Soil health is the key!',
      timestamp: '6 hours ago',
      likes: 45,
      comments: 22,
      shares: 8,
      liked: true,
      isSuccessStory: true,
    },
  ];

  const challenges = [
    {
      id: 'c1',
      title: 'Zero Waste Week',
      description: 'Implement zero waste practices in your farming operations',
      duration: '7 days',
      participants: 156,
      points: 500,
      emoji: '🌱',
      difficulty: 'medium',
      status: 'active',
    },
    {
      id: 'c2',
      title: 'Smart Irrigation Challenge',
      description: 'Optimize water usage with smart irrigation techniques',
      duration: '14 days',
      participants: 89,
      points: 750,
      emoji: '💧',
      difficulty: 'hard',
      status: 'upcoming',
    },
  ];

  const leaderboard = [
    { id: 'l1', name: 'Suresh Reddy', location: 'Telangana', avatar: '🏆', level: 6, points: 2450, rank: 1 },
    { id: 'l2', name: 'Kavitha Singh', location: 'Karnataka', avatar: '🥈', level: 5, points: 2180, rank: 2 },
    { id: 'l3', name: 'Ravi Kumar', location: 'Punjab', avatar: '🥉', level: 4, points: 1890, rank: 3 },
  ];

  const handleCreatePost = useCallback(() => {
    if (newPostContent.trim()) {
      setNewPostContent('');
      setShowCreatePost(false);
    }
  }, [newPostContent]);

  return (
    <LinearGradient colors={['#F2FFF4', '#DFF7DF']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Connect & Learn Together 🌾</Text>
          </View>

          <View style={styles.rightContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔔</Text>
              {notifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, farmers, or topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6b7280"
          />
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabItem, selectedTab === 'feed' && styles.tabItemActive]}
            onPress={() => setSelectedTab('feed')}
          >
            <Text style={[styles.tabText, selectedTab === 'feed' && styles.tabTextActive]}>Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, selectedTab === 'challenges' && styles.tabItemActive]}
            onPress={() => setSelectedTab('challenges')}
          >
            <Text style={[styles.tabText, selectedTab === 'challenges' && styles.tabTextActive]}>Challenges</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, selectedTab === 'leaderboard' && styles.tabItemActive]}
            onPress={() => setSelectedTab('leaderboard')}
          >
            <Text style={[styles.tabText, selectedTab === 'leaderboard' && styles.tabTextActive]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* FEED */}
        {selectedTab === 'feed' ? (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.postCard}>
                {/* POST HEADER */}
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.author.avatar}</Text>
                  </View>
                  <View style={styles.postMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.postAuthor}>{item.author.name}</Text>
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>Lv.{item.author.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.postSub}>{`${item.author.location} • ${item.timestamp}`}</Text>
                  </View>
                </View>

                {/* CONTENT */}
                <Text style={styles.postContent}>{item.content}</Text>

                {/* SUCCESS STORY */}
                {item.isSuccessStory && (
                  <View style={styles.success}>
                    <Text>🏆 Success Story</Text>
                  </View>
                )}

                {/* ACTION BUTTONS */}
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={item.liked ? styles.likeActive : styles.actionText}>❤️ {item.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>💬 {item.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>🔁 {item.shares}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 12 }}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Trending Now</Text>
                  <View style={styles.trendingCard}>
                    {['Drip Irrigation Setup', 'Organic Pesticides', 'Soil pH Testing'].map((t, i) => (
                      <View key={t} style={styles.trendingRow}>
                        <Text style={styles.trendingText}>#{t}</Text>
                        <Text style={styles.trendingMeta}>{`${23 - i * 5} posts • Farming`}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            }
            contentContainerStyle={styles.content}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            
            {/* CHALLENGES */}
            {selectedTab === 'challenges' && (
              <View style={styles.section}>
                {challenges.map((c) => (
                  <View key={c.id} style={styles.challengeCard}>
                    <View style={styles.challengeLeft}>
                      <Text style={styles.challengeEmoji}>{c.emoji}</Text>
                    </View>

                    <View style={styles.challengeBody}>
                      <View style={styles.challengeHeader}>
                        <Text style={styles.challengeTitle}>{c.title}</Text>
                        <View
                          style={[
                            styles.challengeBadge,
                            c.difficulty === 'hard' ? styles.badgeHard : styles.badgeMedium,
                          ]}
                        >
                          <Text style={styles.challengeBadgeText}>{c.difficulty}</Text>
                        </View>
                      </View>

                      <Text style={styles.challengeDesc}>{c.description}</Text>

                      <View style={styles.challengeMeta}>
                        <Text style={styles.metaText}>{c.duration}</Text>
                        <Text style={styles.metaText}>{`${c.participants} joined`}</Text>
                        <Text style={styles.metaText}>{`${c.points} pts`}</Text>
                      </View>

                      <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>
                          {c.status === 'active' ? 'Join Challenge' : 'Notify Me'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* LEADERBOARD */}
            {selectedTab === 'leaderboard' && (
              <View style={styles.section}>
                {leaderboard.map((l) => (
                  <View
                    key={l.id}
                    style={[
                      styles.leaderCard,
                      l.rank === 1 ? styles.rankOne : l.rank === 2 ? styles.rankTwo : styles.rankThree,
                    ]}
                  >
                    <View style={styles.leaderLeft}>
                      <Text style={styles.leaderAvatar}>{l.avatar}</Text>
                      <View style={styles.rankCircle}>
                        <Text style={styles.rankText}>#{l.rank}</Text>
                      </View>
                    </View>

                    <View style={styles.leaderBody}>
                      <View style={styles.leaderHeader}>
                        <Text style={styles.leaderName}>{l.name}</Text>
                        <Text style={styles.leaderPoints}>{l.points.toLocaleString()}</Text>
                      </View>
                      <Text style={styles.leaderSub}>{`${l.location} • Lv.${l.level}`}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* FAB */}
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => setShowCreatePost(true)}>
            <Text style={styles.fabText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* CREATE POST MODAL */}
        <Modal visible={showCreatePost} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <RNTextInput
                style={styles.textarea}
                placeholder="Share your farming experience..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                numberOfLines={4}
                placeholderTextColor="#6b7280"
              />

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.actionPrimary, !newPostContent.trim() && styles.disabled]}
                  onPress={handleCreatePost}
                  disabled={!newPostContent.trim()}
                >
                  <Text style={styles.actionPrimaryText}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

/* -------------------------------------------------------
   MODERNIZED STYLES (from previous message)
------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 32 : 14,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  headerTitle: { flex: 1, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#1A2E05' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  rightContainer: { width: 50, alignItems: 'flex-end' },

  iconButton: {
    padding: 10,
    backgroundColor: '#E8FCEB',
    borderRadius: 14,
    shadowColor: '#16A34A',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  iconText: { fontSize: 20 },

  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  searchRow: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 50,
    color: '#111827',
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 10 },

  tabItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },

  tabItemActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  tabText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },

  tabTextActive: { color: '#047857', fontSize: 16, fontWeight: '900' },

  content: { paddingBottom: 140, paddingHorizontal: 16 },

  section: { marginVertical: 14 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
    color: '#1A2E05',
  },

  trendingCard: {
    backgroundColor: '#FFF7D6',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.8,
    borderColor: '#FACC15',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  trendingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },

  trendingText: { color: '#92400E', fontWeight: '800', fontSize: 15 },

  trendingMeta: { color: '#78716C', fontSize: 13, fontWeight: '600' },

  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },

  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },

  avatarText: { fontSize: 26 },

  postMeta: { marginLeft: 12, flex: 1 },

  postAuthor: { fontWeight: '800', fontSize: 16, color: '#064E3B' },

  postSub: { color: '#6B7280', fontSize: 13, marginTop: 2 },

  levelBadge: {
    marginLeft: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  levelText: { fontSize: 12, color: '#4338CA', fontWeight: '700' },

  postContent: { color: '#374151', marginBottom: 12, fontSize: 15 },

  success: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 8,
  },

  actionButton: { paddingVertical: 8, paddingHorizontal: 12 },
  actionText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
  likeActive: { color: '#DC2626', fontWeight: '800' },

  challengeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  challengeLeft: {
    width: 62,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    marginRight: 12,
  },

  challengeEmoji: { fontSize: 34 },

  challengeBody: { flex: 1 },

  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  challengeTitle: {
    fontWeight: '900',
    fontSize: 17,
    color: '#065F46',
    flex: 1,
  },

  challengeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  badgeHard: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  badgeMedium: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },

  challengeBadgeText: { fontSize: 12, fontWeight: '800', color: '#7C2D12' },

  challengeDesc: {
    color: '#6B7280',
    marginVertical: 8,
    fontSize: 14,
  },

  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  metaText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },

  outlineButton: {
    borderWidth: 2,
    borderColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
  },

  outlineButtonText: {
    color: '#047857',
    fontWeight: '800',
    textAlign: 'center',
  },

  leaderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  leaderLeft: { width: 80, alignItems: 'center' },
  leaderAvatar: { fontSize: 36 },

  rankCircle: {
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },

  rankText: { fontSize: 13, fontWeight: '800' },

  leaderBody: { flex: 1, paddingLeft: 14 },

  leaderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  leaderName: { fontSize: 17, fontWeight: '900' },

  leaderPoints: {
    color: '#059669',
    fontWeight: '900',
    fontSize: 17,
  },

  leaderSub: { color: '#6B7280', fontSize: 13, fontWeight: '600' },

  rankOne: { borderColor: '#FBBF24', borderWidth: 3, backgroundColor: '#FFFBEB' },

  rankTwo: { borderColor: '#D1D5DB', borderWidth: 3, backgroundColor: '#F8FAFC' },

  rankThree: { borderColor: '#FB923C', borderWidth: 3, backgroundColor: '#FFF7ED' },

  resourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  resourceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },

  fabContainer: { position: 'absolute', right: 20, bottom: 90 },

  fab: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },

  fabText: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalTitle: { fontSize: 22, fontWeight: '900' },
  modalClose: { fontSize: 26, color: '#6B7280' },

  textarea: {
    backgroundColor: '#F9FAFB',
    minHeight: 130,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },

  modalFooter: { marginTop: 18, alignItems: 'flex-end' },

  actionPrimary: {
    backgroundColor: '#10B981',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
  },

  actionPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },

  disabled: { opacity: 0.5 },
});