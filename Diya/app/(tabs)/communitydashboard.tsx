import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';

// --- Mock data (replace with real data / API calls) ---
const STORIES = [
  { id: '1', name: 'Suresh', avatar: '👨‍🌾' },
  { id: '2', name: 'Kavitha', avatar: '👩‍🌾' },
  { id: '3', name: 'Ravi', avatar: '👨‍🌾' },
];

const POSTS = [
  {
    id: '1',
    author: { name: 'Ravi Kumar', avatar: '👨‍🌾', level: 4, location: 'Nashik' },
    timestamp: '2h ago',
    content: 'Neem oil spray worked really well against aphids this season 🌱',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
    likes: 24,
    comments: 2,
    shares: 3,
  },
];

type TabKey = 'feed' | 'reels' | 'challenges' | 'leaderboard';

export default function CommunityScreen() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);
  const [posts] = useState(POSTS);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const [showComments, setShowComments] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleTap = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  };

  return (
    <LinearGradient colors={['#F5F3EE', '#FFFDFB']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <Animated.View style={styles.header}>
          <View>
            <Text style={styles.title}>AgriFusion</Text>
            <Text style={styles.subtitle}>Grow together with farmers across India</Text>
          </View>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#14532d" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifications}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#166534" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search farmers..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* STORIES */}
        <View style={styles.storySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STORIES.map((story) => (
              <View key={story.id} style={styles.storyCard}>
                <View style={styles.storyCircle}>
                  <Text style={{ fontSize: 30 }}>{story.avatar}</Text>
                </View>
                <Text style={styles.storyName}>{story.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {(['feed', 'reels', 'challenges', 'leaderboard'] as TabKey[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, selectedTab === tab && styles.tabItemActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FEED */}
        {selectedTab === 'feed' && (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.trendingSection}>
                <Text style={styles.sectionTitle}>🔥 Trending</Text>
                <View style={styles.trendingCard}>
                  <Text style={styles.trendingTag}>🌱 Organic Farming</Text>
                  <Text style={styles.trendingTag}>💧 Drip Irrigation</Text>
                  <Text style={styles.trendingTag}>🐛 Pest Control</Text>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: 28 }}>{item.author.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.postAuthor}>{item.author.name}</Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#10B981"
                        style={{ marginLeft: 4 }}
                      />
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>Lv.{item.author.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.postSub}>
                      {item.author.location} • {item.timestamp}
                    </Text>
                  </View>
                </View>

                <Text style={styles.postContent}>{item.content}</Text>

                {/* Double-tap to like */}
                <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap}>
                  <Image source={{ uri: item.image }} style={styles.postImage} />
                  {showHeart && (
                    <Animated.View entering={ZoomIn.duration(300)} style={styles.bigHeart}>
                      <Ionicons name="heart" size={90} color="#EF4444" />
                    </Animated.View>
                  )}
                </TouchableOpacity>

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart" size={22} color="#EF4444" />
                    <Text style={styles.actionText}>{item.likes}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowComments(true)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                    <Text style={styles.actionText}>{item.comments}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Feather name="share-2" size={20} color="#6B7280" />
                    <Text style={styles.actionText}>{item.shares}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {/* REELS */}
        {selectedTab === 'reels' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          >
            <View style={styles.reelCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200',
                }}
                style={styles.reelImage}
              />
              <View style={styles.reelOverlay}>
                <Text style={styles.reelTitle}>🎥 Organic Fertilizer Tips</Text>
                <Text style={styles.reelSubtitle}>240 likes • 12 comments</Text>
              </View>
            </View>

            <View style={styles.reelCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
                }}
                style={styles.reelImage}
              />
              <View style={styles.reelOverlay}>
                <Text style={styles.reelTitle}>💧 Smart Irrigation Hacks</Text>
                <Text style={styles.reelSubtitle}>185 likes • 9 comments</Text>
              </View>
            </View>
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
            <Ionicons name="camera" size={22} color="#14532d" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallFab}>
            <Ionicons name="videocam" size={22} color="#14532d" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.fab} onPress={() => setShowCreatePost(true)}>
            <Feather name="edit-2" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* CREATE POST MODAL */}
        <Modal visible={showCreatePost} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Post</Text>

              <RNTextInput
                style={styles.textarea}
                placeholder="Share something..."
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

              <TextInput style={styles.commentInput} placeholder="Write a comment..." />

              <TouchableOpacity
                style={styles.commentSend}
                onPress={() => setShowComments(false)}
              >
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
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 30, fontWeight: '900', color: '#1B4332' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  iconButton: { backgroundColor: '#fff', padding: 14, borderRadius: 20 },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    paddingHorizontal: 6,
  },
  badgeText: { color: 'white' },
  searchRow: { paddingHorizontal: 16 },
  searchContainer: {
    backgroundColor: '#fff',
    height: 55,
    borderRadius: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    flexDirection: 'row',
  },
  searchInput: { flex: 1, marginLeft: 10 },
  storySection: { marginTop: 20, paddingLeft: 16 },
  storyCard: { alignItems: 'center', marginRight: 16 },
  storyCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyName: { marginTop: 8, fontWeight: '700' },
  tabsContainer: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  tabItem: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  tabItemActive: { backgroundColor: '#14532d' },
  tabText: { fontWeight: '700' },
  tabTextActive: { color: 'white' },
  trendingSection: { margin: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  trendingCard: { backgroundColor: '#FFF8D6', padding: 18, borderRadius: 20 },
  trendingTag: { fontWeight: '700', marginBottom: 10 },
  postCard: {
    backgroundColor: '#FFFDFB',
    borderRadius: 30,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 6,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DFF5E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAuthor: { fontWeight: '800', fontSize: 16, color: '#1B4332' },
  postSub: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  levelBadge: {
    backgroundColor: '#DFF5E3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  levelText: { fontWeight: '700', fontSize: 11, color: '#14532d' },
  postContent: { fontSize: 15, lineHeight: 23, color: '#374151', marginBottom: 15 },
  postImage: { height: 220, width: '100%', borderRadius: 24, marginBottom: 15 },
  bigHeart: { position: 'absolute', top: '35%', left: '40%' },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 15,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 6, fontWeight: '700', color: '#6B7280' },
  reelCard: { height: 320, borderRadius: 30, overflow: 'hidden', marginBottom: 20 },
  reelImage: { height: '100%', width: '100%' },
  reelOverlay: { position: 'absolute', bottom: 20, left: 20 },
  reelTitle: { fontSize: 22, fontWeight: '900', color: 'white' },
  reelSubtitle: { color: 'white', marginTop: 5 },
  challengeCard: {
    backgroundColor: '#FFFDFB',
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    flexDirection: 'row',
  },
  challengeEmoji: { fontSize: 40, marginRight: 20 },
  challengeTitle: { fontSize: 17, fontWeight: '800', color: '#14532d' },
  challengeDesc: { marginTop: 8, color: '#6B7280', lineHeight: 20 },
  progressBarBg: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 20, marginTop: 18 },
  progressBarFill: { height: 10, backgroundColor: '#A7D7A8', borderRadius: 20 },
  progressText: { marginTop: 10, fontWeight: '700', color: '#14532d' },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 35,
    marginTop: 25,
  },
  firstCard: {
    width: 110,
    height: 180,
    backgroundColor: '#FFF8D6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondCard: {
    width: 100,
    height: 150,
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  thirdCard: {
    width: 100,
    height: 140,
    backgroundColor: '#FFE8D6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  podiumEmoji: { fontSize: 40 },
  podiumName: { marginTop: 10, fontWeight: '800', color: '#1B4332' },
  podiumPoints: { marginTop: 8, fontWeight: '700', color: '#6B7280' },
  leaderCard: {
    backgroundColor: '#FFFDFB',
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leaderText: { fontWeight: '800', fontSize: 15 },
  leaderXp: { fontWeight: '900', color: '#14532d' },
  fabMenu: { position: 'absolute', right: 20, bottom: 100, alignItems: 'center' },
  smallFab: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
  },
  fab: {
    height: 65,
    width: 65,
    borderRadius: 33,
    backgroundColor: '#021F0F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.5)' },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 20, color: '#14532d' },
  textarea: {
    backgroundColor: '#F9FAFB',
    height: 140,
    borderRadius: 20,
    padding: 20,
    textAlignVertical: 'top',
  },
  postButton: { marginTop: 20, backgroundColor: '#14532d', paddingVertical: 15, borderRadius: 20 },
  postButtonText: { color: 'white', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  commentOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  commentSheet: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  dragBar: { width: 60, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 10 },
  commentTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  commentCard: { padding: 12, backgroundColor: '#FFFDFB', borderRadius: 12, marginBottom: 10 },
  commentUser: { fontWeight: '800' },
  commentText: { marginTop: 6, color: '#6B7280' },
  commentInput: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginTop: 10 },
  commentSend: { marginTop: 12, backgroundColor: '#14532d', paddingVertical: 12, borderRadius: 12 },
  expertBadge: {
    backgroundColor: '#FFF8D6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  expertText: {
    fontWeight: '700',
    color: '#92400E',
  },
});




