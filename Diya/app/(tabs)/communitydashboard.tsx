import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 16 * 2 - 12) / 2; // 16px screen padding, 12px gap

// --- Mock data ---
const STORIES = [
  { id: 'me', name: 'Your Story', avatar: '➕', isMe: true },
  { id: '1', name: 'Suresh', avatar: '👨‍🌾' },
  { id: '2', name: 'Kavitha', avatar: '👩‍🌾' },
  { id: '3', name: 'Ravi', avatar: '👨‍🌾' },
  { id: '4', name: 'Meena', avatar: '👩‍🌾' },
];

const POSTS = [
  {
    id: '1',
    author: { name: 'Ravi Kumar', avatar: '👨‍🌾', level: 4, location: 'Nashik' },
    timestamp: '2h ago',
    content: 'Neem oil spray worked really well against aphids this season 🌱',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    height: 220,
    likes: 24,
    comments: 2,
    shares: 3,
  },
  {
    id: '2',
    author: { name: 'Meena Patil', avatar: '👩‍🌾', level: 6, location: 'Pune' },
    timestamp: '4h ago',
    content: 'Drip irrigation setup cut my water usage by 40% 💧',
    image: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800',
    height: 300,
    likes: 58,
    comments: 9,
    shares: 6,
  },
  {
    id: '3',
    author: { name: 'Suresh Naik', avatar: '👨‍🌾', level: 8, location: 'Kolhapur' },
    timestamp: '6h ago',
    content: 'Harvest day! Organic turmeric finally ready 🌾',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
    height: 260,
    likes: 91,
    comments: 14,
    shares: 11,
  },
  {
    id: '4',
    author: { name: 'Kavitha Rao', avatar: '👩‍🌾', level: 5, location: 'Belagavi' },
    timestamp: '1d ago',
    content: 'Composting setup for the new season 🍂',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800',
    height: 190,
    likes: 33,
    comments: 5,
    shares: 2,
  },
];

const REELS = [
  {
    id: 'r1',
    title: '🎥 Organic Fertilizer Tips',
    sub: '240 likes • 12 comments',
    image: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200',
  },
  {
    id: 'r2',
    title: '💧 Smart Irrigation Hacks',
    sub: '185 likes • 9 comments',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
  },
];

type TabKey = 'feed' | 'reels' | 'challenges' | 'leaderboard';

const TABS: { key: TabKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'feed', icon: 'grid-outline' },
  { key: 'reels', icon: 'play-circle-outline' },
  { key: 'challenges', icon: 'flag-outline' },
  { key: 'leaderboard', icon: 'trophy-outline' },
];

export default function CommunityScreen() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);
  const [posts] = useState(POSTS);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const [showComments, setShowComments] = useState(false);
  const [heartPostId, setHeartPostId] = useState<string | null>(null);

  const handleDoubleTap = (id: string) => {
    setHeartPostId(id);
    setTimeout(() => setHeartPostId(null), 800);
  };

  // Split posts into two masonry columns
  const leftColumn = posts.filter((_, i) => i % 2 === 0);
  const rightColumn = posts.filter((_, i) => i % 2 === 1);

  const renderPostCard = (item: (typeof POSTS)[0]) => (
    <View key={item.id} style={styles.pinCard}>
      <TouchableOpacity activeOpacity={0.95} onPress={() => handleDoubleTap(item.id)}>
        <Image source={{ uri: item.image }} style={[styles.pinImage, { height: item.height }]} />
        {heartPostId === item.id && (
          <Animated.View entering={ZoomIn.duration(250)} style={styles.bigHeart}>
            <Ionicons name="heart" size={64} color="#fff" />
          </Animated.View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.pinGradient}
        >
          <Text style={styles.pinContent} numberOfLines={2}>
            {item.content}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.pinFooter}>
        <View style={styles.pinAuthorRow}>
          <View style={styles.pinAvatar}>
            <Text style={{ fontSize: 14 }}>{item.author.avatar}</Text>
          </View>
          <Text style={styles.pinAuthorName} numberOfLines={1}>
            {item.author.name}
          </Text>
        </View>
        <View style={styles.pinStatsRow}>
          <TouchableOpacity style={styles.pinStat}>
            <Ionicons name="heart-outline" size={15} color="#5B7553" />
            <Text style={styles.pinStatText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pinStat} onPress={() => setShowComments(true)}>
            <Ionicons name="chatbubble-outline" size={14} color="#5B7553" />
            <Text style={styles.pinStatText}>{item.comments}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#F0FFF4', '#E8F5E9', '#F1F8E9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>AgriFusion</Text>
            <Text style={styles.subtitle}>Grow together, harvest together</Text>
          </View>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#1B4332" />
            {notifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search farmers, tips, crops..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* TABS — compact icon only bar at top */}
        <View style={styles.tabBarWrap}>
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const active = selectedTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabPill, active && styles.tabPillActive]}
                  onPress={() => setSelectedTab(tab.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={active ? '#10b981' : '#9ca3af'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* FEED — Pinterest masonry */}
        {selectedTab === 'feed' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={styles.trendingSection}>
              <Text style={styles.sectionTitle}>🔥 Trending</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['🌱 Organic Farming', '💧 Drip Irrigation', '🐛 Pest Control', '🍂 Composting'].map(
                  (tag) => (
                    <View key={tag} style={styles.trendingChip}>
                      <Text style={styles.trendingChipText}>{tag}</Text>
                    </View>
                  )
                )}
              </ScrollView>
            </View>

            <View style={styles.masonryRow}>
              <View style={styles.masonryColumn}>{leftColumn.map(renderPostCard)}</View>
              <View style={styles.masonryColumn}>{rightColumn.map(renderPostCard)}</View>
            </View>
          </ScrollView>
        )}

        {/* REELS */}
        {selectedTab === 'reels' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          >
            {REELS.map((reel) => (
              <View key={reel.id} style={styles.reelCard}>
                <Image source={{ uri: reel.image }} style={styles.reelImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  style={styles.reelGradient}
                >
                  <View style={styles.reelPlayBtn}>
                    <Ionicons name="play" size={22} color="#fff" />
                  </View>
                  <Text style={styles.reelTitle}>{reel.title}</Text>
                  <Text style={styles.reelSubtitle}>{reel.sub}</Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        )}

        {/* CHALLENGES */}
        {selectedTab === 'challenges' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          >
            <View style={styles.challengeCard}>
              <Text style={styles.challengeEmoji}>🌱</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeTitle}>Zero Waste Week</Text>
                <Text style={styles.challengeDesc}>
                  Implement zero waste practices in your farming operations.
                </Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '70%' }]} />
                </View>
                <Text style={styles.progressText}>5/7 days completed • 500 XP</Text>
              </View>
            </View>

            <View style={styles.challengeCard}>
              <Text style={styles.challengeEmoji}>💧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeTitle}>Smart Irrigation Challenge</Text>
                <Text style={styles.challengeDesc}>Save water with smart irrigation.</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '40%' }]} />
                </View>
                <Text style={styles.progressText}>3/7 days completed • 750 XP</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* LEADERBOARD */}
        {selectedTab === 'leaderboard' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          >
            <View style={styles.podiumContainer}>
              <View style={styles.secondCard}>
                <Text style={styles.podiumEmoji}>🥈</Text>
                <Text style={styles.podiumName}>Kavitha</Text>
                <Text style={styles.podiumPoints}>2180 XP</Text>
              </View>
              <View style={styles.firstCard}>
                <Text style={styles.podiumEmoji}>🥇</Text>
                <Text style={styles.podiumName}>Suresh</Text>
                <Text style={styles.podiumPoints}>2450 XP</Text>
              </View>
              <View style={styles.thirdCard}>
                <Text style={styles.podiumEmoji}>🥉</Text>
                <Text style={styles.podiumName}>Ravi</Text>
                <Text style={styles.podiumPoints}>1890 XP</Text>
              </View>
            </View>

            <View style={styles.leaderCard}>
              <Text style={styles.leaderText}>#4 Rajesh Kumar</Text>
              <Text style={styles.leaderXp}>1720 XP</Text>
            </View>
            <View style={styles.leaderCard}>
              <Text style={styles.leaderText}>#5 Priya Sharma</Text>
              <Text style={styles.leaderXp}>1640 XP</Text>
            </View>
          </ScrollView>
        )}

        {/* FAB MENU */}
        <View style={styles.fabMenu}>
          <TouchableOpacity style={styles.smallFab}>
            <Ionicons name="camera" size={20} color="#1B4332" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallFab}>
            <Ionicons name="videocam" size={20} color="#1B4332" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={() => setShowCreatePost(true)}>
            <LinearGradient colors={['#5B7553', '#1B4332']} style={styles.fabGradient}>
              <Feather name="edit-2" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* CREATE POST MODAL */}
        <Modal visible={showCreatePost} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.dragBar} />
              <Text style={styles.modalTitle}>Create Post</Text>
              <RNTextInput
                style={styles.textarea}
                placeholder="Share something..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={newPostContent}
                onChangeText={setNewPostContent}
              />
              <TouchableOpacity
                style={styles.postButton}
                onPress={() => {
                  setNewPostContent('');
                  setShowCreatePost(false);
                }}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* COMMENTS MODAL */}
        <Modal visible={showComments} transparent animationType="slide">
          <View style={styles.commentOverlay}>
            <View style={styles.commentSheet}>
              <View style={styles.dragBar} />
              <Text style={styles.commentTitle}>Comments</Text>
              <View style={styles.commentCard}>
                <Text style={styles.commentUser}>Ravi Kumar</Text>
                <Text style={styles.commentText}>Neem oil spray worked really well 🌱</Text>
              </View>
              <View style={styles.commentCard}>
                <Text style={styles.commentUser}>Priya Sharma</Text>
                <Text style={styles.commentText}>
                  I had the same issue and solved it with drip irrigation 💧
                </Text>
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity style={styles.commentSend} onPress={() => setShowComments(false)}>
                <Text style={styles.postButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE9DC',
  },
  title: { fontSize: 32, fontWeight: '900', color: '#0d3d0d', letterSpacing: -1 },
  subtitle: { color: '#4a7c4e', marginTop: 3, fontSize: 14, fontWeight: '600' },
  iconButton: {
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 14,
    shadowColor: '#22c55e',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff5722',
    borderRadius: 20,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#ff5722',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '800' },

  searchRow: { paddingHorizontal: 16, marginTop: 12, marginBottom: 6 },
  searchContainer: {
    backgroundColor: '#fff',
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0d3d0d', fontWeight: '600' },

  // STORIES
  storySection: { marginTop: 20, paddingLeft: 16, marginBottom: 8 },
  storyCard: { alignItems: 'center', marginRight: 14, width: 64 },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyInner: {
    flex: 1,
    width: '100%',
    borderRadius: 29,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E0D5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyName: { marginTop: 6, fontSize: 11, fontWeight: '600', color: '#57534E' },

  // TAB BAR
  tabBarWrap: { paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'flex-start',
    gap: 16,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  tabPillActive: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
  tabPillLabel: { color: '#22c55e', fontWeight: '800', fontSize: 12 },

  // TRENDING
  trendingSection: { paddingHorizontal: 16, marginTop: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0d3d0d', marginBottom: 8, letterSpacing: -0.3 },
  trendingChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  trendingChipText: { fontWeight: '700', fontSize: 12, color: '#0d3d0d' },

  // MASONRY FEED (Pinterest)
  masonryRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 8, marginBottom: 32, gap: 14 },
  masonryColumn: { flex: 1, gap: 14 },
  pinCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  pinImage: { width: '100%' },
  pinGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    justifyContent: 'flex-end',
    padding: 12,
    background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
  },
  pinContent: { color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 18, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  bigHeart: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -32,
    marginTop: -32,
  },
  pinFooter: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  pinAuthorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pinAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pinAuthorName: { fontSize: 13, fontWeight: '700', color: '#0d3d0d', flexShrink: 1 },
  pinStatsRow: { flexDirection: 'row', gap: 12, paddingTop: 2 },
  pinStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pinStatText: { fontSize: 11, fontWeight: '600', color: '#666' },

  // REELS
  reelCard: {
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  reelImage: { height: '100%', width: '100%' },
  reelGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    height: '50%',
    justifyContent: 'flex-end',
  },
  reelPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reelTitle: { fontSize: 19, fontWeight: '800', color: 'white' },
  reelSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 12.5 },

  // CHALLENGES
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: '#1B4332',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  challengeEmoji: { fontSize: 34, marginRight: 16 },
  challengeTitle: { fontSize: 15.5, fontWeight: '800', color: '#1B4332' },
  challengeDesc: { marginTop: 6, color: '#8C8579', lineHeight: 19, fontSize: 12.5 },
  progressBarBg: { height: 8, backgroundColor: '#EFE9DC', borderRadius: 20, marginTop: 14 },
  progressBarFill: { height: 8, backgroundColor: '#5B7553', borderRadius: 20 },
  progressText: { marginTop: 8, fontWeight: '700', color: '#1B4332', fontSize: 12 },

  // LEADERBOARD
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 28,
    marginTop: 16,
    gap: 10,
  },
  firstCard: {
    width: 104,
    height: 168,
    backgroundColor: '#1B4332',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondCard: {
    width: 94,
    height: 138,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE9DC',
  },
  thirdCard: {
    width: 94,
    height: 128,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE9DC',
  },
  podiumEmoji: { fontSize: 34 },
  podiumName: { marginTop: 8, fontWeight: '800', fontSize: 13 },
  podiumPoints: { marginTop: 4, fontWeight: '700', fontSize: 11, opacity: 0.7 },
  leaderCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EFE9DC',
  },
  leaderText: { fontWeight: '700', fontSize: 14, color: '#1B4332' },
  leaderXp: { fontWeight: '800', color: '#5B7553' },

  // FAB
  fabMenu: { position: 'absolute', right: 18, bottom: 24, alignItems: 'center' },
  smallFab: {
    height: 46,
    width: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#1B4332',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  fab: { borderRadius: 30, overflow: 'hidden', elevation: 6 },
  fabGradient: { height: 60, width: 60, alignItems: 'center', justifyContent: 'center' },

  // MODALS
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(27,67,50,0.35)' },
  modalContent: { backgroundColor: 'white', padding: 22, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  modalTitle: { fontSize: 19, fontWeight: '800', marginBottom: 16, color: '#1B4332' },
  textarea: {
    backgroundColor: '#FAF7F2',
    height: 130,
    borderRadius: 16,
    padding: 16,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#1B4332',
  },
  postButton: { marginTop: 16, backgroundColor: '#1B4332', paddingVertical: 14, borderRadius: 16 },
  postButtonText: { color: 'white', fontWeight: '800', fontSize: 15, textAlign: 'center' },

  commentOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(27,67,50,0.35)' },
  commentSheet: { backgroundColor: 'white', padding: 22, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  dragBar: { width: 44, height: 5, backgroundColor: '#EFE9DC', borderRadius: 3, alignSelf: 'center', marginBottom: 14 },
  commentTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12, color: '#1B4332' },
  commentCard: { padding: 13, backgroundColor: '#FAF7F2', borderRadius: 14, marginBottom: 10 },
  commentUser: { fontWeight: '800', fontSize: 13, color: '#1B4332' },
  commentText: { marginTop: 5, color: '#8C8579', fontSize: 13 },
  commentInput: { backgroundColor: '#FAF7F2', borderRadius: 14, padding: 13, marginTop: 8, fontSize: 13 },
  commentSend: { marginTop: 14, backgroundColor: '#1B4332', paddingVertical: 13, borderRadius: 14 },
});
