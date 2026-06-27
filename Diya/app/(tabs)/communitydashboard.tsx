import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.51:4000/api';

// ─── Auth header helper ───────────────────────────────
// Reads the JWT saved at login and returns headers including the
// Authorization bearer token. Backend derives identity from this token,
// so userId no longer needs to be sent in request bodies.
const authHeaders = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ─── Types ────────────────────────────────────────────
interface Comment {
  _id: string;
  userId: { _id: string; fullName: string };
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  userId: { _id: string; fullName: string; state: string; level?: number };
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────
const getInitials = (name: string) =>
  name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'F';

const avatarColors = [
  '#2D6A4F', '#1B4332', '#40916C', '#52B788',
  '#74C69D', '#B7E4C7', '#D8F3DC', '#081C15',
];

const getAvatarColor = (name: string) =>
  avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Main Component ───────────────────────────────────
export default function CommunityDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);

  // Comment modal
  const [commentModal, setCommentModal] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Current user from storage
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ─── Load current user ────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          setCurrentUserId(parsed._id || parsed.id || null);
        }
      } catch (e) {
        console.log('Could not load user from storage');
      }
    };
    loadUser();
    fetchPosts();
  }, []);

  // ─── Fetch posts ──────────────────────────────────
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/community`, {
        headers: await authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not load posts. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  // ─── Create post ──────────────────────────────────
  const handlePost = async () => {
    if (!newPostText.trim()) return;
    if (!currentUserId) {
      Alert.alert('Login required', 'Please log in to post.');
      return;
    }

    setPosting(true);
    try {
      const res = await fetch(`${API_URL}/community`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ content: newPostText.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => [json.data, ...prev]);
        setNewPostText('');
      } else {
        Alert.alert('Error', json.message || 'Could not create post.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not create post. Check your connection.');
    } finally {
      setPosting(false);
    }
  };

  // ─── Like / Unlike ────────────────────────────────
  const handleLike = async (post: Post) => {
    if (!currentUserId) {
      Alert.alert('Login required', 'Please log in to like posts.');
      return;
    }

    const isLiked = post.likes.includes(currentUserId);

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== post._id) return p;
        return {
          ...p,
          likes: isLiked
            ? p.likes.filter((id) => id !== currentUserId)
            : [...p.likes, currentUserId],
        };
      })
    );

    try {
      const res = await fetch(`${API_URL}/community/${post._id}/like`, {
        method: 'POST',
        headers: await authHeaders(),
      });
      const json = await res.json();
      if (!json.success) {
        // Revert if failed
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? post : p))
        );
      }
    } catch {
      // Revert on network error
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? post : p))
      );
    }
  };

  // ─── Open comment modal ───────────────────────────
  const openComments = (post: Post) => {
    setActivePost(post);
    setCommentModal(true);
  };

  // ─── Add comment ──────────────────────────────────
  const handleAddComment = async () => {
    if (!commentText.trim() || !activePost) return;
    if (!currentUserId) {
      Alert.alert('Login required', 'Please log in to comment.');
      return;
    }

    setCommentLoading(true);
    try {
      const res = await fetch(`${API_URL}/community/${activePost._id}/comment`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        // Update posts list with new comments
        setPosts((prev) =>
          prev.map((p) =>
            p._id === activePost._id ? { ...p, comments: json.data } : p
          )
        );
        // Update active post for modal
        setActivePost((prev) =>
          prev ? { ...prev, comments: json.data } : prev
        );
        setCommentText('');
      }
    } catch {
      Alert.alert('Error', 'Could not add comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  // ─── Post Card ────────────────────────────────────
  const PostCard = ({ post }: { post: Post }) => {
    const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
    const authorName = post.userId?.fullName || 'Farmer';

    return (
      <View style={styles.card}>
        {/* Author row */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(authorName) }]}>
            <Text style={styles.avatarText}>{getInitials(authorName)}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.authorMeta}>
              {post.userId?.state || 'India'} · {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.postContent}>{post.content}</Text>

        {/* Image if present */}
        {post.imageUrl ? (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : null}

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(post)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#E63946' : '#6B7280'}
            />
            <Text style={[styles.actionCount, isLiked && styles.likedText]}>
              {post.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => openComments(post)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
            <Text style={styles.actionCount}>{post.comments.length}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Render ───────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1B4332', '#2D6A4F']} style={styles.header}>
        <Text style={styles.headerTitle}>🌾 Community</Text>
        <Text style={styles.headerSubtitle}>Share knowledge with farmers</Text>
      </LinearGradient>

      <ScrollView
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2D6A4F"
          />
        }
      >
        {/* Compose Box */}
        <View style={styles.composeBox}>
          <TextInput
            style={styles.composeInput}
            placeholder="Share a farming tip or question..."
            placeholderTextColor="#9CA3AF"
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.postBtn, !newPostText.trim() && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!newPostText.trim() || posting}
            activeOpacity={0.8}
          >
            {posting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Feed */}
        {loading ? (
          <ActivityIndicator size="large" color="#2D6A4F" style={{ marginTop: 40 }} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share something!</Text>
          </View>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={commentModal}
        animationType="slide"
        transparent
        onRequestClose={() => setCommentModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Comments list */}
            <ScrollView style={styles.commentsList}>
              {activePost?.comments.length === 0 ? (
                <Text style={styles.noComments}>No comments yet. Be the first!</Text>
              ) : (
                activePost?.comments.map((c) => (
                  <View key={c._id} style={styles.commentItem}>
                    <View
                      style={[
                        styles.commentAvatar,
                        { backgroundColor: getAvatarColor(c.userId?.fullName || 'F') },
                      ]}
                    >
                      <Text style={styles.commentAvatarText}>
                        {getInitials(c.userId?.fullName || 'F')}
                      </Text>
                    </View>
                    <View style={styles.commentBody}>
                      <Text style={styles.commentAuthor}>
                        {c.userId?.fullName || 'Farmer'}
                      </Text>
                      <Text style={styles.commentText}>{c.text}</Text>
                      <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Add comment */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={300}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim() || commentLoading}
              >
                {commentLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#B7E4C7', marginTop: 2 },

  // Feed
  feed: { flex: 1 },

  // Compose
  composeBox: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  composeInput: {
    fontSize: 15,
    color: '#111827',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  postBtn: {
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  postBtnDisabled: { backgroundColor: '#9CA3AF' },
  postBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  // Card
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  authorMeta: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  postContent: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 12 },
  postImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 12 },

  // Actions
  cardActions: { flexDirection: 'row', gap: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 14, color: '#6B7280' },
  likedText: { color: '#E63946' },

  // Empty
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151' },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  commentsList: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  noComments: { textAlign: 'center', color: '#9CA3AF', marginTop: 30, fontSize: 14 },
  commentItem: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: '#111827' },
  commentText: { fontSize: 14, color: '#374151', marginTop: 2, lineHeight: 20 },
  commentTime: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#2D6A4F',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#9CA3AF' },
});