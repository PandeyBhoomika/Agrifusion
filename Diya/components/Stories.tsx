// components/Stories.tsx
// Drop this file into Diya/components/Stories.tsx
// Then import StoriesBar into your communitydashboard.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────

interface StoryItem {
  _id: string;
  imageUrl: string;
  caption: string;
  viewCount: number;
  hasSeen: boolean;
  createdAt: string;
  expiresAt: string;
}

interface UserStories {
  userId: string;
  userName: string;
  userState: string;
  hasUnseenStory: boolean;
  stories: StoryItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h left`;
  if (mins > 0) return `${mins}m left`;
  return 'Expiring soon';
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ─── Story Viewer (fullscreen) ────────────────────────────────────────────

interface StoryViewerProps {
  userStories: UserStories;
  allUsers: UserStories[];
  startUserIndex: number;
  onClose: () => void;
  onViewed: (storyId: string) => void;
}

function StoryViewer({ userStories, allUsers, startUserIndex, onClose, onViewed }: StoryViewerProps) {
  const [userIndex, setUserIndex] = useState(startUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentUser = allUsers[userIndex];
  const currentStory = currentUser?.stories[storyIndex];
  const STORY_DURATION = 5000;

  // Mark as viewed
  useEffect(() => {
    if (!currentStory) return;
    onViewed(currentStory._id);
  }, [currentStory?._id]);

  // Progress bar animation
  useEffect(() => {
    if (!currentStory) return;
    progressAnim.setValue(0);
    if (progressRef.current) progressRef.current.stop();
    progressRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    progressRef.current.start(({ finished }) => {
      if (finished) goNext();
    });
    return () => progressRef.current?.stop();
  }, [storyIndex, userIndex]);

  const goNext = () => {
    const hasNextStory = storyIndex < currentUser.stories.length - 1;
    if (hasNextStory) {
      setStoryIndex(s => s + 1);
    } else if (userIndex < allUsers.length - 1) {
      setUserIndex(u => u + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(s => s - 1);
    } else if (userIndex > 0) {
      setUserIndex(u => u - 1);
      setStoryIndex(allUsers[userIndex - 1].stories.length - 1);
    }
  };

  if (!currentStory || !currentUser) return null;

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={sv.container}>
        {/* Background image */}
        <Image source={{ uri: currentStory.imageUrl }} style={sv.image} resizeMode="cover" />

        {/* Dark overlay */}
        <View style={sv.overlay} />

        {/* Progress bars */}
        <View style={sv.progressRow}>
          {currentUser.stories.map((_, i) => (
            <View key={i} style={sv.progressTrack}>
              <Animated.View
                style={[
                  sv.progressFill,
                  {
                    width: i < storyIndex
                      ? '100%'
                      : i === storyIndex
                      ? progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                      : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={sv.header}>
          <View style={sv.authorRow}>
            <View style={sv.authorAvatar}>
              <Text style={sv.authorInitials}>{getInitials(currentUser.userName)}</Text>
            </View>
            <View>
              <Text style={sv.authorName}>{currentUser.userName}</Text>
              <Text style={sv.storyMeta}>
                {timeLeft(currentStory.expiresAt)} • {currentStory.viewCount} views
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={sv.closeBtn}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {currentStory.caption ? (
          <View style={sv.captionContainer}>
            <Text style={sv.caption}>{currentStory.caption}</Text>
          </View>
        ) : null}

        {/* Tap zones */}
        <View style={sv.tapZones}>
          <TouchableOpacity style={sv.tapLeft} onPress={goPrev} activeOpacity={1} />
          <TouchableOpacity style={sv.tapRight} onPress={goNext} activeOpacity={1} />
        </View>
      </View>
    </Modal>
  );
}

const sv = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  progressRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 12, paddingTop: Platform.OS === 'ios' ? 56 : 40, zIndex: 10 },
  progressTrack: { flex: 1, height: 2.5, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 10, zIndex: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  authorInitials: { color: '#fff', fontSize: 13, fontWeight: '700' },
  authorName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  storyMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 1 },
  closeBtn: { padding: 6 },
  captionContainer: { position: 'absolute', bottom: 90, left: 0, right: 0, paddingHorizontal: 20, zIndex: 10 },
  caption: { color: '#fff', fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, textAlign: 'center' },
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', zIndex: 5 },
  tapLeft: { flex: 1 },
  tapRight: { flex: 1 },
});

// ─── Story Circle (single avatar in the bar) ──────────────────────────────

interface StoryCircleProps {
  userStories: UserStories;
  onPress: () => void;
  isMe?: boolean;
}

function StoryCircle({ userStories, onPress, isMe }: StoryCircleProps) {
  return (
    <TouchableOpacity style={sc.wrap} onPress={onPress} activeOpacity={0.8}>
      {/* Ring — green if unseen, grey if seen */}
      <View style={[sc.ring, userStories.hasUnseenStory ? sc.ringUnseen : sc.ringSeen]}>
        <View style={sc.avatarWrap}>
          <Text style={sc.initials}>{isMe ? '+' : getInitials(userStories.userName)}</Text>
        </View>
      </View>
      {isMe && (
        <View style={sc.addIcon}>
          <Ionicons name="add" size={10} color="#fff" />
        </View>
      )}
      <Text style={sc.name} numberOfLines={1}>
        {isMe ? 'Your Story' : userStories.userName.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
}

const sc = StyleSheet.create({
  wrap: { alignItems: 'center', marginRight: 14, width: 66 },
  ring: { width: 66, height: 66, borderRadius: 33, padding: 3, alignItems: 'center', justifyContent: 'center' },
  ringUnseen: { borderWidth: 2.5, borderColor: '#22c55e' },
  ringSeen: { borderWidth: 2, borderColor: '#d1d5db' },
  avatarWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  initials: { fontSize: 18, fontWeight: '700', color: '#15803d' },
  addIcon: { position: 'absolute', bottom: 20, right: 2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  name: { marginTop: 5, fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
});

// ─── Create Story Modal ───────────────────────────────────────────────────

interface CreateStoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  token: string;
  userId: string;
}

function CreateStoryModal({ visible, onClose, onCreated, token, userId }: CreateStoryModalProps) {
  const [image, setImage] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow access to your photos to add a story.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [9, 16],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, type: asset.mimeType || 'image/jpeg', name: `story_${Date.now()}.jpg` });
    }
  };

  const handleUpload = async () => {
    if (!image || uploading) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', { uri: image.uri, type: image.type, name: image.name } as any);
      if (caption.trim()) formData.append('caption', caption.trim());

      const res = await fetch(`${API_URL}/stories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('✅ Posted!', 'Your story is live for 24 hours.');
        setImage(null);
        setCaption('');
        onCreated();
        onClose();
      } else {
        Alert.alert('Error', json.message || 'Upload failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Check backend is running.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={csm.overlay}>
        <View style={csm.sheet}>
          <View style={csm.dragBar} />
          <Text style={csm.title}>Add to Your Story</Text>

          {/* Image preview / picker */}
          <TouchableOpacity style={csm.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {image ? (
              <Image source={{ uri: image.uri }} style={csm.preview} resizeMode="cover" />
            ) : (
              <View style={csm.placeholder}>
                <Ionicons name="image-outline" size={40} color="#9ca3af" />
                <Text style={csm.placeholderText}>Tap to choose a photo</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Will be cropped to 9:16</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Caption */}
          <TextInput
            style={csm.captionInput}
            placeholder="Add a caption... (optional)"
            placeholderTextColor="#9ca3af"
            value={caption}
            onChangeText={setCaption}
            maxLength={150}
          />
          <Text style={csm.charCount}>{caption.length}/150</Text>

          {/* Expiry note */}
          <View style={csm.infoRow}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={csm.infoText}>Your story will disappear after 24 hours</Text>
          </View>

          {/* Buttons */}
          <View style={csm.btnRow}>
            <TouchableOpacity style={csm.cancelBtn} onPress={onClose}>
              <Text style={csm.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[csm.postBtn, (!image || uploading) && { opacity: 0.4 }]}
              onPress={handleUpload}
              disabled={!image || uploading}
            >
              {uploading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={csm.postText}>Share Story</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const csm = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 36 },
  dragBar: { width: 44, height: 5, backgroundColor: '#e5e7eb', borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: '#1B4332', marginBottom: 16 },
  imagePicker: { width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f9fafb', marginBottom: 14, borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed' },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderText: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  captionInput: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 13, fontSize: 14, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  charCount: { textAlign: 'right', fontSize: 11, color: '#9ca3af', marginTop: 4, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  infoText: { fontSize: 12, color: '#6b7280' },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#6b7280' },
  postBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#1B4332', alignItems: 'center' },
  postText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

// ─── StoriesBar (main export — put at top of feed) ────────────────────────

export default function StoriesBar() {
  const [stories, setStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<UserStories | null>(null);
  const [viewingUserIndex, setViewingUserIndex] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [myEntry, setMyEntry] = useState<UserStories | null>(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const t = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('authToken') || '';
        const u = await AsyncStorage.getItem('user');
        setToken(t);
        if (u) {
          const parsed = JSON.parse(u);
          setUserId(parsed._id || parsed.id || '');
        }
      } catch (e) {}
    };
    loadAuth();
  }, []);

  const fetchStories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        const data: UserStories[] = json.data;
        // Separate my stories from others
        const me = data.find(u => u.userId === userId);
        const others = data.filter(u => u.userId !== userId);
        setMyEntry(me || null);
        setStories(others);
      }
    } catch (err) {
      console.error('fetchStories error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handleViewed = async (storyId: string) => {
    try {
      await fetch(`${API_URL}/stories/${storyId}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Locally mark as seen
      setStories(prev => prev.map(u => ({
        ...u,
        stories: u.stories.map(s => s._id === storyId ? { ...s, hasSeen: true, viewCount: s.viewCount + 1 } : s),
        hasUnseenStory: u.stories.some(s => s._id !== storyId && !s.hasSeen),
      })));
    } catch {}
  };

  const openStories = (userStories: UserStories, index: number) => {
    setViewingUser(userStories);
    setViewingUserIndex(index);
  };

  // Full list for the viewer (includes "my" entry at front if exists)
  const allForViewer = myEntry ? [myEntry, ...stories] : stories;

  if (loading) {
    return (
      <View style={sb.wrap}>
        <ActivityIndicator color="#16a34a" size="small" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={sb.bar}
        contentContainerStyle={sb.content}
      >
        {/* "Your Story" bubble — always first */}
        <TouchableOpacity style={sc.wrap} onPress={() => setShowCreate(true)} activeOpacity={0.8}>
          <View style={[sc.ring, myEntry?.hasUnseenStory ? sc.ringUnseen : sc.ringSeen]}>
            <View style={sc.avatarWrap}>
              <Text style={sc.initials}>👤</Text>
            </View>
          </View>
          <View style={sc.addIcon}>
            <Ionicons name="add" size={10} color="#fff" />
          </View>
          <Text style={sc.name}>Your Story</Text>
        </TouchableOpacity>

        {/* My existing stories (tap to view) */}
        {myEntry && (
          <StoryCircle
            userStories={myEntry}
            onPress={() => openStories(myEntry, 0)}
            isMe
          />
        )}

        {/* Other users' stories */}
        {stories.map((u, i) => (
          <StoryCircle
            key={u.userId}
            userStories={u}
            onPress={() => openStories(u, myEntry ? i + 1 : i)}
          />
        ))}

        {stories.length === 0 && !myEntry && (
          <Text style={sb.emptyText}>No stories yet — be the first! 🌱</Text>
        )}
      </ScrollView>

      {/* Story viewer */}
      {viewingUser && (
        <StoryViewer
          userStories={viewingUser}
          allUsers={allForViewer}
          startUserIndex={viewingUserIndex}
          onClose={() => setViewingUser(null)}
          onViewed={handleViewed}
        />
      )}

      {/* Create story modal */}
      <CreateStoryModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchStories}
        token={token}
        userId={userId}
      />
    </>
  );
}

const sb = StyleSheet.create({
  bar: { marginTop: 12, marginBottom: 4 },
  content: { paddingHorizontal: 16, paddingVertical: 8 },
  wrap: { alignItems: 'center', marginRight: 14, width: 66 },
  emptyText: { color: '#9ca3af', fontSize: 13, alignSelf: 'center', paddingLeft: 8 },
});
