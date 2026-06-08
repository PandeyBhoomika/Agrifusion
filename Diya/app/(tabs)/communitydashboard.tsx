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
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn, SlideInRight } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

export default function CommunityDashboard() {
  const router = useRouter(); // Replaced prop navigation with expo-router

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'feed' | 'challenges' | 'leaderboard'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [notifications] = useState(3);

  // --- MOCK DATA ---
  const posts = [
    {
      id: '1',
      author: { name: 'Rajesh Kumar', location: 'Punjab, India', avatar: '👨‍🌾', verified: true, level: 4 },
      content: 'Just completed installing drip irrigation in my wheat field! 💧 Reduced water usage by 40% and plants are healthier than ever. #WaterConservation',
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
      content: 'Can anyone help with organic pest control for tomatoes? 🍅 Looking for natural solutions. #OrganicFarming',
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
      content: 'Incredible harvest this season! 🎉 30% increase in yield with sustainable practices. Soil health is the key!',
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
    <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>

        {/* --- HEADER --- */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Connect & Learn Together 🌾</Text>
          </View>
          <View style={styles.rightContainer}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={24} color="#14532d" />
              {notifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* --- SEARCH --- */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchRow}>
          <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
            <Ionicons name="search" size={20} color="#166534" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search posts, farmers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholderTextColor="#6b7280"
            />
          </View>
        </Animated.View>

        {/* --- TABS --- */}
        <Animated.View entering={SlideInRight.delay(200).duration(400)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {['feed', 'challenges', 'leaderboard'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, selectedTab === tab && styles.tabItemActive]}
                onPress={() => setSelectedTab(tab as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* --- FEED VIEW --- */}
        {selectedTab === 'feed' ? (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.trendingSection}>
                <Text style={styles.sectionTitle}>Trending Now</Text>
                <View style={styles.trendingCard}>
                  {['Drip Irrigation Setup', 'Organic Pesticides', 'Soil pH Testing'].map((t, i) => (
                    <View key={t} style={styles.trendingRow}>
                      <Text style={styles.trendingText}>#{t}</Text>
                      <Text style={styles.trendingMeta}>{`${23 - i * 5} posts • Farming`}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.delay(400 + (index * 100)).duration(400)}>
                <View style={[styles.postCard, item.isSuccessStory && styles.postCardSuccess]}>
                  {item.isSuccessStory && (
                    <View style={styles.successBadge}>
                      <Text style={styles.successBadgeText}>🏆 Success Story</Text>
                    </View>
                  )}

                  {/* POST HEADER */}
                  <View style={styles.postHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.author.avatar}</Text>
                    </View>
                    <View style={styles.postMeta}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.postAuthor}>{item.author.name}</Text>
                        {item.author.verified && (
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
                        )}
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelText}>Lv.{item.author.level}</Text>
                        </View>
                      </View>
                      <Text style={styles.postSub}>{`${item.author.location} • ${item.timestamp}`}</Text>
                    </View>
                  </View>

                  {/* CONTENT */}
                  <Text style={styles.postContent}>{item.content}</Text>

                  {/* ACTION BUTTONS */}
                  <View style={styles.postActions}>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                      <Ionicons name={item.liked ? "heart" : "heart-outline"} size={20} color={item.liked ? "#EF4444" : "#6B7280"} />
                      <Text style={[styles.actionText, item.liked && styles.likeActive]}>{item.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                      <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                      <Text style={styles.actionText}>{item.comments}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                      <Feather name="share-2" size={18} color="#6B7280" />
                      <Text style={styles.actionText}>{item.shares}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>

            {/* --- CHALLENGES VIEW --- */}
            {selectedTab === 'challenges' && (
              <View>
                {challenges.map((c, index) => (
                  <Animated.View key={c.id} entering={FadeInUp.delay(300 + (index * 100)).duration(400)}>
                    <View style={styles.challengeCard}>
                      <View style={styles.challengeLeft}>
                        <Text style={styles.challengeEmoji}>{c.emoji}</Text>
                      </View>
                      <View style={styles.challengeBody}>
                        <View style={styles.challengeHeader}>
                          <Text style={styles.challengeTitle} numberOfLines={1}>{c.title}</Text>
                          <View style={[styles.challengeBadge, c.difficulty === 'hard' ? styles.badgeHard : styles.badgeMedium]}>
                            <Text style={styles.challengeBadgeText}>{c.difficulty}</Text>
                          </View>
                        </View>
                        <Text style={styles.challengeDesc}>{c.description}</Text>
                        <View style={styles.challengeMeta}>
                          <Text style={styles.metaText}>⏱️ {c.duration}</Text>
                          <Text style={styles.metaText}>👥 {c.participants}</Text>
                          <Text style={styles.metaTextGold}>🪙 {c.points} pts</Text>
                        </View>
                        <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8}>
                          <Text style={styles.outlineButtonText}>
                            {c.status === 'active' ? 'Join Challenge' : 'Notify Me'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}

            {/* --- LEADERBOARD VIEW --- */}
            {selectedTab === 'leaderboard' && (
              <View>
                {leaderboard.map((l, index) => (
                  <Animated.View key={l.id} entering={FadeInUp.delay(300 + (index * 100)).duration(400)}>
                    <View style={[
                      styles.leaderCard,
                      l.rank === 1 ? styles.rankOne : l.rank === 2 ? styles.rankTwo : styles.rankThree
                    ]}>
                      <View style={styles.leaderLeft}>
                        <Text style={styles.leaderAvatar}>{l.avatar}</Text>
                        <View style={styles.rankCircle}>
                          <Text style={styles.rankText}>#{l.rank}</Text>
                        </View>
                      </View>
                      <View style={styles.leaderBody}>
                        <View style={styles.leaderHeader}>
                          <Text style={styles.leaderName}>{l.name}</Text>
                          <Text style={styles.leaderPoints}>{l.points.toLocaleString()} XP</Text>
                        </View>
                        <Text style={styles.leaderSub}>{`${l.location} • Lv.${l.level}`}</Text>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* --- FLOATING ACTION BUTTON --- */}
        <Animated.View entering={ZoomIn.delay(600).duration(400)} style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => setShowCreatePost(true)} activeOpacity={0.8}>
            <Feather name="edit-2" size={24} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>

        {/* --- CREATE POST MODAL --- */}
        <Modal visible={showCreatePost} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity onPress={() => setShowCreatePost(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <RNTextInput
                style={styles.textarea}
                placeholder="Share your farming experience or ask a question..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                numberOfLines={5}
                placeholderTextColor="#9ca3af"
                autoFocus
              />

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.photoButton}>
                  <Ionicons name="image-outline" size={24} color="#10B981" />
                </TouchableOpacity>
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
   STYLES
------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* HEADER */
  header: {
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { flex: 1 },
  title: { fontSize: 28, fontWeight: '900', color: '#14532d', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#166534', marginTop: 2, fontWeight: '600' },
  rightContainer: { alignItems: 'flex-end' },
  iconButton: {
    padding: 10, backgroundColor: '#ffffff', borderRadius: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  badge: {
    position: 'absolute', right: -4, top: -4, backgroundColor: '#EF4444',
    borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 2, borderColor: '#ffffff',
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },

  /* SEARCH */
  searchRow: { paddingHorizontal: 16, paddingBottom: 12 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 16, paddingHorizontal: 16, height: 50,
    borderWidth: 1.5, borderColor: 'rgba(34,197,94,0.2)',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  searchContainerFocused: { borderColor: '#22c55e' },
  searchInput: { flex: 1, fontSize: 15, color: '#1f2937', fontWeight: '500' },

  /* TABS */
  tabsContainer: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  tabItem: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  tabItemActive: { backgroundColor: '#14532d', borderColor: '#14532d' },
  tabText: { color: '#166534', fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#ffffff' },

  /* LIST CONTENT */
  listContent: { paddingHorizontal: 16, paddingBottom: 110 },

  /* TRENDING */
  trendingSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#14532d', marginBottom: 10 },
  trendingCard: {
    backgroundColor: '#fffbeb', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#fde68a',
  },
  trendingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  trendingText: { color: '#92400E', fontWeight: '700', fontSize: 15 },
  trendingMeta: { color: '#b45309', fontSize: 13, fontWeight: '600' },

  /* POSTS */
  postCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  postCardSuccess: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  successBadge: { alignSelf: 'flex-start', backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#fde68a' },
  successBadgeText: { color: '#92400e', fontSize: 11, fontWeight: '800' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24 },
  postMeta: { marginLeft: 12, flex: 1 },
  postAuthor: { fontWeight: '800', fontSize: 16, color: '#1f2937' },
  postSub: { color: '#6b7280', fontSize: 12, marginTop: 2, fontWeight: '500' },
  levelBadge: { marginLeft: 8, backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  levelText: { fontSize: 11, color: '#166534', fontWeight: '800' },
  postContent: { color: '#374151', marginBottom: 14, fontSize: 15, lineHeight: 22 },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { color: '#6b7280', fontWeight: '600', fontSize: 14, marginLeft: 6 },
  likeActive: { color: '#EF4444' },

  /* CHALLENGES */
  challengeCard: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  challengeLeft: { width: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 14, marginRight: 14 },
  challengeEmoji: { fontSize: 32 },
  challengeBody: { flex: 1 },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeTitle: { fontWeight: '800', fontSize: 16, color: '#14532d', flex: 1, paddingRight: 10 },
  challengeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeHard: { backgroundColor: '#fee2e2' },
  badgeMedium: { backgroundColor: '#fef3c7' },
  challengeBadgeText: { fontSize: 11, fontWeight: '800', color: '#1f2937', textTransform: 'capitalize' },
  challengeDesc: { color: '#4b5563', marginVertical: 8, fontSize: 13, lineHeight: 18 },
  challengeMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  metaTextGold: { color: '#d97706', fontSize: 12, fontWeight: '800' },
  outlineButton: { borderWidth: 1.5, borderColor: '#22c55e', paddingVertical: 10, borderRadius: 12, backgroundColor: '#f0fdf4' },
  outlineButtonText: { color: '#166534', fontWeight: '800', textAlign: 'center', fontSize: 13 },

  /* LEADERBOARD */
  leaderCard: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
  },
  rankOne: { borderColor: '#fbbf24', borderWidth: 2, backgroundColor: '#fffbeb' },
  rankTwo: { borderColor: '#9ca3af', borderWidth: 2, backgroundColor: '#f9fafb' },
  rankThree: { borderColor: '#f97316', borderWidth: 2, backgroundColor: '#fff7ed' },
  leaderLeft: { width: 70, alignItems: 'center', justifyContent: 'center' },
  leaderAvatar: { fontSize: 36 },
  rankCircle: { marginTop: -10, backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  rankText: { fontSize: 12, fontWeight: '900', color: '#1f2937' },
  leaderBody: { flex: 1, paddingLeft: 12, justifyContent: 'center' },
  leaderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  leaderName: { fontSize: 16, fontWeight: '800', color: '#1f2937' },
  leaderPoints: { color: '#d97706', fontWeight: '900', fontSize: 15 },
  leaderSub: { color: '#6b7280', fontSize: 13, fontWeight: '600' },

  /* FAB */
  fabContainer: { position: 'absolute', right: 20, bottom: 90 }, // Clears custom tab bar
  fab: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#021F0F', // Dark theme green
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)',
  },

  /* MODAL */
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: '#ffffff', padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#14532d' },
  modalCloseBtn: { padding: 4 },
  textarea: {
    backgroundColor: '#f9fafb', minHeight: 120, borderRadius: 16, padding: 16,
    fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb', color: '#1f2937', textAlignVertical: 'top'
  },
  modalFooter: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  photoButton: { padding: 10, backgroundColor: '#dcfce7', borderRadius: 12 },
  actionPrimary: { backgroundColor: '#22c55e', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  actionPrimaryText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  disabled: { opacity: 0.5 },
});