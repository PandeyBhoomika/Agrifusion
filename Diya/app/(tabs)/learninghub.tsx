import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

// ─── Category colours for thumbnail placeholder ───────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'crop-rotation': '#16a34a',
  'irrigation': '#0284c7',
  'pest-control': '#dc2626',
  'soil-health': '#92400e',
  'crop-management': '#7c3aed',
  'water-management': '#0369a1',
  'sustainability': '#059669',
  'organic-farming': '#65a30d',
  'post-harvest': '#d97706',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  'crop-rotation': '🔄',
  'irrigation': '💧',
  'pest-control': '🐛',
  'soil-health': '🧪',
  'crop-management': '🌾',
  'water-management': '🌊',
  'sustainability': '♻️',
  'organic-farming': '🌱',
  'post-harvest': '📦',
};

// Thumbnail — always shows styled card (YouTube URLs blocked on localhost/CORS)
const VideoThumbnail = ({ video, style }: { video: VideoModule; style: any }) => {
  const bgColor = CATEGORY_COLORS[video.category] || '#166534';
  const emoji = CATEGORY_EMOJIS[video.category] || '📹';
  return (
    <View style={[style, { backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center', padding: 16 }]}>
      <Text style={{ fontSize: 42, marginBottom: 10 }}>{emoji}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.95)', fontWeight: '800', fontSize: 14, textAlign: 'center', lineHeight: 20 }} numberOfLines={3}>
        {video.title}
      </Text>
      {video.instructor ? (
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 6 }}>
          👤 {video.instructor}
        </Text>
      ) : null}
    </View>
  );
};
import { StatusBar } from 'expo-status-bar';
import YoutubePlayer from 'react-native-youtube-iframe';
import {
  fetchAllVideos,
  fetchVideosByCategory,
  searchVideos,
  getVideoProgress,
  updateVideoProgress,
  VideoModule,
} from '../../services/videoService';
import { useLanguage } from '../../context/LanguageContext';

// ─── Static module types (simulations / quizzes) ──────────────────────────────

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type ModuleType = 'simulation' | 'video' | 'quiz';

interface LearningModule {
  id: string; title: string; description: string; duration: string;
  difficulty: Difficulty; category: string; type: ModuleType;
  completed: boolean; progress: number; points: number; locked: boolean;
}

const learningModules: LearningModule[] = [
  { id: 'irrigation-basics', title: 'Smart Irrigation Systems', description: 'Efficient water management & irrigation methods', duration: '12 min', difficulty: 'beginner', category: 'irrigation', type: 'simulation', completed: true, progress: 100, points: 150, locked: false },
  { id: 'crop-rotation-basics', title: 'Sustainable Crop Rotation', description: 'Crop rotation for soil health and yields', duration: '8 min', difficulty: 'beginner', category: 'crop-rotation', type: 'simulation', completed: true, progress: 100, points: 120, locked: false },
  { id: 'pest-control-organic', title: 'Organic Pest Management', description: 'Protect crops without harmful chemicals', duration: '15 min', difficulty: 'intermediate', category: 'pest-control', type: 'simulation', completed: false, progress: 60, points: 200, locked: false },
  { id: 'plant-growth-simulation', title: 'Crop Growth Stages (1–6)', description: 'Watch every stage of crop growth, from land prep to harvest', duration: '6 stages', difficulty: 'beginner', category: 'crop-management', type: 'simulation', completed: false, progress: 0, points: 180, locked: false },
];

const plantGrowthStages = [
  { id: 1, title: 'Land Preparation', embedUrl: 'https://player.cloudinary.com/embed/?cloud_name=dujotdx5w&public_id=Stage_1_-_Land_Preparation_dnykgx&profile=cld-default' },
  { id: 2, title: 'Seed / Nursery Preparation', embedUrl: 'https://player.cloudinary.com/embed/?cloud_name=dujotdx5w&public_id=Stage2_-_Seed_or_Nursery_Prepartion_nkgx5y&profile=cld-default' },
  { id: 3, title: 'Planting', embedUrl: 'https://player.cloudinary.com/embed/?cloud_name=dujotdx5w&public_id=Stage3_-_Planting_ummsuf&profile=cld-default' },
  { id: 4, title: 'Vegetative Growth', embedUrl: 'https://player.cloudinary.com/embed/?cloud_name=dujotdx5w&public_id=Stage_4-_Vegetative_Growth_ebcfvw&profile=cld-default' },
  { id: 5, title: 'Reproductive Stage', embedUrl: 'https://player.cloudinary.com/embed/?cloud_name=dujotdx5w&public_id=Stage_5-_Reproductive_Stage_zizbrc&profile=cld-default' },
  { id: 6, title: 'Harvest & Post-Harvest', embedUrl: 'https://player.cloudinary.com/embed/?cloud_name=dujotdx5w&public_id=Stage_6_-_Harvest_and_Post_Harvest_zsp3vw&profile=cld-default' },
];

const userProgress = {
  totalPoints: 650, completedModules: 3, totalModules: 6,
  level: 3, weeklyGoal: 4, weeklyCompleted: 2,
};

// ─── Category tabs for video filter ──────────────────────────────────────────

const VIDEO_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📹' },
  { id: 'crop-rotation', label: 'Crop Rotation', emoji: '🔄' },
  { id: 'irrigation', label: 'Irrigation', emoji: '💧' },
  { id: 'pest-control', label: 'Pest Control', emoji: '🐛' },
  { id: 'soil-health', label: 'Soil Health', emoji: '🧪' },
  { id: 'crop-management', label: 'Crop Mgmt', emoji: '🌾' },
  { id: 'water-management', label: 'Water', emoji: '🌊' },
  { id: 'sustainability', label: 'Sustainability', emoji: '♻️' },
  { id: 'organic-farming', label: 'Organic', emoji: '🌱' },
  { id: 'post-harvest', label: 'Post-Harvest', emoji: '📦' },
];

// ─── Difficulty badge colours ─────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

interface LearningHubProps {
  onBack?: () => void;
  autoDemo?: boolean;
  onMiniGames?: () => void;
}

export default function LearningHub({ onBack, autoDemo = false, onMiniGames }: LearningHubProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // ── Video state ────────────────────────────────────────────────────────────
  const [allVideos, setAllVideos] = useState<VideoModule[]>([]);
  const [displayVideos, setDisplayVideos] = useState<VideoModule[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoSource, setVideoSource] = useState<'api' | 'mock' | null>(null);

  // ── Selected video / player state ─────────────────────────────────────────
  const [selectedVideo, setSelectedVideo] = useState<VideoModule | null>(null);
  const [playing, setPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [shouldSeek, setShouldSeek] = useState(false);
  const youtubePlayerRef = useRef<any>(null);

  // ── Tab / search / filter state ────────────────────────────────────────────
  const [selectedTab, setSelectedTab] = useState<'overview' | 'simulations' | 'videos' | 'quizzes' | 'mini-games'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState('all');

  // ── Crop growth-stage simulation state ─────────────────────────────────────
  const [selectedSimulation, setSelectedSimulation] = useState<LearningModule | null>(null);
  const [activeStage, setActiveStage] = useState(0);

  // ── Load all videos on mount ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoadingVideos(true);
      const vids = await fetchAllVideos();
      setAllVideos(vids);
      setDisplayVideos(vids);
      // Detect API vs mock: mock IDs start with 'video-'
      setVideoSource(vids[0]?.id?.startsWith('video-') ? 'mock' : 'api');
      setIsLoadingVideos(false);
    };
    load();
  }, []);

  // ── Video category filter ──────────────────────────────────────────────────
  useEffect(() => {
    if (selectedVideoCategory === 'all') {
      setDisplayVideos(allVideos);
    } else {
      setDisplayVideos(allVideos.filter(v => v.category === selectedVideoCategory));
    }
  }, [selectedVideoCategory, allVideos]);

  // ── Search (debounced via useEffect) ──────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayVideos(
        selectedVideoCategory === 'all'
          ? allVideos
          : allVideos.filter(v => v.category === selectedVideoCategory)
      );
      return;
    }
    const q = searchQuery.toLowerCase();
    setDisplayVideos(
      allVideos.filter(v =>
        (selectedVideoCategory === 'all' || v.category === selectedVideoCategory) &&
        (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, selectedVideoCategory, allVideos]);

  // ── Load saved progress when a video is selected ──────────────────────────
  useEffect(() => {
    if (!selectedVideo) return;
    const loadProgress = async () => {
      setIsLoadingProgress(true);
      setProgressLoaded(false);
      setShouldSeek(false);
      setPlaying(false);
      try {
        const saved = await getVideoProgress(selectedVideo.id);
        if (saved && saved.currentTime > 0) {
          setVideoProgress(saved.progress);
          setCurrentTime(saved.currentTime);
          setVideoDuration(saved.duration);
          setShouldSeek(true);
        } else {
          setVideoProgress(0); setCurrentTime(0); setVideoDuration(0);
        }
      } catch (e) { console.error('Error loading progress:', e); }
      finally { setIsLoadingProgress(false); setProgressLoaded(true); }
    };
    loadProgress();
  }, [selectedVideo?.id]);

  // ── Poll player time every second ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedVideo || !progressLoaded) return;
    const interval = setInterval(async () => {
      if (!youtubePlayerRef.current) return;
      try {
        const curr = await youtubePlayerRef.current.getCurrentTime();
        const dur = await youtubePlayerRef.current.getDuration();
        if (dur > 0 && curr > 0) {
          setVideoDuration(dur);
          setCurrentTime(curr);
          setVideoProgress(Math.round((curr / dur) * 100));
        }
      } catch { }
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedVideo, progressLoaded]);

  // ── Auto-save progress every 5 seconds ────────────────────────────────────
  useEffect(() => {
    if (!selectedVideo || videoDuration === 0 || currentTime === 0) return;
    const save = setInterval(() => {
      updateVideoProgress(selectedVideo.id, videoProgress, currentTime, videoDuration, videoProgress >= 100);
    }, 5000);
    return () => clearInterval(save);
  }, [selectedVideo?.id, videoProgress, currentTime, videoDuration]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const renderProgressBar = (value: number) => (
    <View style={styles.progressBarTrack}>
      <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;

  const TAB_LABELS: Record<string, string> = {
    overview: t.learningHub.all,
    simulations: t.learningHub.simulations,
    videos: t.learningHub.videos,
    quizzes: t.learningHub.quizzes,
    'mini-games': t.learningHub.miniGames,
  };

  // ── VIDEO PLAYER SCREEN ───────────────────────────────────────────────────

  if (selectedVideo) {
    return (
      <LinearGradient colors={['#021F0F', '#042818', '#053B24']} style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor="#021F0F" />
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.playerHeader}>
            <TouchableOpacity onPress={() => { setSelectedVideo(null); setPlaying(false); }} style={styles.playerBackBtn}>
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.playerHeaderTitle} numberOfLines={1}>{selectedVideo.title}</Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
            {isLoadingProgress ? (
              <View style={{ padding: 60, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#22c55e" />
                <Text style={{ color: '#86efac', marginTop: 16, fontWeight: '600' }}>
                  {t.learningHub.loadingVideo}
                </Text>
              </View>
            ) : (
              <>
                {/* Resume pill */}
                {currentTime > 30 && videoProgress < 98 && (
                  <View style={styles.resumePill}>
                    <Ionicons name="time-outline" size={14} color="#166534" style={{ marginRight: 6 }} />
                    <Text style={styles.resumePillText}>
                      Resuming from {formatTime(currentTime)} ({videoProgress}% watched)
                    </Text>
                  </View>
                )}

                {/* YouTube Player */}
                {selectedVideo.youtubeId ? (
                  <View style={styles.videoContainer}>
                    <YoutubePlayer
                      ref={youtubePlayerRef}
                      height={220}
                      play={playing}
                      videoId={selectedVideo.youtubeId}
                      onChangeState={(state: string) => {
                        if (state === 'ended') { setPlaying(false); setVideoProgress(100); }
                        if (state === 'playing') setPlaying(true);
                        if (state === 'paused') setPlaying(false);
                      }}
                      onReady={() => {
                        if (shouldSeek && currentTime > 0) {
                          setTimeout(() => {
                            youtubePlayerRef.current?.seekTo(currentTime, true);
                            setShouldSeek(false);
                          }, 500);
                        }
                      }}
                      onError={(error: string) => {
                        console.warn('YouTube player error:', error);
                      }}
                    />
                  </View>
                ) : (
                  <View style={[styles.videoContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 48, marginBottom: 12 }}>🎬</Text>
                    <Text style={{ color: '#86efac', fontWeight: '800', fontSize: 16, textAlign: 'center' }}>
                      Video Coming Soon
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6, textAlign: 'center', paddingHorizontal: 24 }}>
                      Add a YouTube video ID in the backend seeder to activate this lesson.
                    </Text>
                  </View>
                )}

                {/* Progress bar */}
                <View style={{ marginTop: 12 }}>
                  {renderProgressBar(videoProgress)}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: '#86efac', fontSize: 11 }}>{formatTime(currentTime)}</Text>
                    <Text style={{ color: '#86efac', fontSize: 11 }}>{videoProgress}% watched</Text>
                    <Text style={{ color: '#86efac', fontSize: 11 }}>{formatTime(videoDuration)}</Text>
                  </View>
                </View>

                {/* Video meta */}
                <View style={styles.videoMeta}>
                  <Text style={styles.videoMetaTitle}>{selectedVideo.title}</Text>
                  <View style={styles.videoMetaRow}>
                    <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[selectedVideo.difficulty] + '22' }]}>
                      <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[selectedVideo.difficulty] }]}>
                        {selectedVideo.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.videoMetaDuration}>⏱ {selectedVideo.duration}</Text>
                    <Text style={styles.videoMetaPoints}>+{selectedVideo.points} XP</Text>
                  </View>
                  {selectedVideo.instructor ? (
                    <Text style={styles.instructorText}>👤 {selectedVideo.instructor}</Text>
                  ) : null}
                  <Text style={styles.videoMetaDesc}>{selectedVideo.description}</Text>
                </View>

                {/* Completed pill */}
                {videoProgress >= 98 && (
                  <View style={styles.completedPill}>
                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" style={{ marginRight: 8 }} />
                    <Text style={styles.completedPillText}>
                      {t.learningHub.videoCompleted?.replace('{points}', String(selectedVideo.points)) ||
                        `🎉 Completed! +${selectedVideo.points} XP earned`}
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── CROP GROWTH SIMULATION SCREEN ────────────────────────────────────────

  if (selectedSimulation) {
    return (
      <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={{ flex: 1 }}>
        <StatusBar style="dark" backgroundColor="transparent" />
        <SafeAreaView style={styles.safe}>
          <View style={styles.simHeader}>
            <TouchableOpacity onPress={() => setSelectedSimulation(null)} style={styles.simBackBtn}>
              <Ionicons name="arrow-back" size={20} color="#14532d" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.simHeaderTitle} numberOfLines={1}>{selectedSimulation.title}</Text>
              <Text style={styles.simHeaderSub}>{selectedSimulation.duration} • {selectedSimulation.difficulty}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
            {selectedSimulation.id === 'plant-growth-simulation' && (
              <View style={styles.simCard}>
                <Text style={styles.simCardTitle}>🌱 {plantGrowthStages[activeStage].title}</Text>
                <Text style={styles.simCardSub}>Stage {activeStage + 1} of {plantGrowthStages.length}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
                  {plantGrowthStages.map((stage, idx) => (
                    <TouchableOpacity
                      key={stage.id}
                      onPress={() => setActiveStage(idx)}
                      style={[styles.tabBtn, { marginRight: 10, paddingHorizontal: 14 }, activeStage === idx && styles.tabBtnActive]}
                    >
                      <Text style={[styles.tabBtnText, activeStage === idx && styles.tabBtnTextActive]}>
                        Stage {stage.id}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={[styles.videoContainer, { height: 220 }]}>
                  {Platform.OS === 'web' ? (
                    React.createElement('iframe', {
                      key: plantGrowthStages[activeStage].id,
                      src: plantGrowthStages[activeStage].embedUrl,
                      style: { width: '100%', height: '100%', border: 'none' },
                      allow: 'autoplay; fullscreen; encrypted-media',
                      allowFullScreen: true,
                    })
                  ) : (
                    <WebView
                      key={plantGrowthStages[activeStage].id}
                      source={{ uri: plantGrowthStages[activeStage].embedUrl }}
                      style={{ flex: 1, backgroundColor: '#000' }}
                      allowsFullscreenVideo
                      javaScriptEnabled
                      domStorageEnabled
                    />
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  <TouchableOpacity
                    disabled={activeStage === 0}
                    onPress={() => setActiveStage((s) => Math.max(0, s - 1))}
                    style={[styles.simNavBtn, { marginRight: 8, opacity: activeStage === 0 ? 0.4 : 1 }]}
                  >
                    <Text style={styles.simNavBtnText}>← Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={activeStage === plantGrowthStages.length - 1}
                    onPress={() => setActiveStage((s) => Math.min(plantGrowthStages.length - 1, s + 1))}
                    style={[styles.simNavBtn, { marginLeft: 8, opacity: activeStage === plantGrowthStages.length - 1 ? 0.4 : 1 }]}
                  >
                    <Text style={styles.simNavBtnText}>Next →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── MAIN LEARNING HUB ─────────────────────────────────────────────────────

  const moduleData =
    selectedTab === 'overview'
      ? learningModules
      : selectedTab === 'simulations'
        ? learningModules.filter(m => m.type === 'simulation')
        : selectedTab === 'quizzes'
          ? learningModules.filter(m => m.type === 'quiz')
          : [];

  return (
    <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>

        <FlatList
          data={selectedTab === 'videos' ? displayVideos : (moduleData as any[])}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}

          ListHeaderComponent={
            <>
              {/* HEADER */}
              <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                <Text style={styles.headerTitle}>{t.learningHub.title}</Text>
                <Text style={styles.headerSub}>{t.learningHub.subtitle}</Text>
              </Animated.View>

              {/* SEARCH */}
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#166534" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder={t.learningHub.searchPlaceholder}
                  placeholderTextColor="#6b7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={[styles.searchInput, isSearchFocused && { borderColor: '#22c55e' }]}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </Animated.View>

              {/* FEATURED CARD */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <LinearGradient colors={['#0F7A4A', '#053B24']} style={styles.featuredCard}>
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>{t.learningHub.featuredLabel}</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{t.learningHub.featuredTitle}</Text>
                  <Text style={styles.featuredSub}>{t.learningHub.featuredSub}</Text>
                  <TouchableOpacity
                    style={styles.featuredBtn}
                    onPress={() => { setSelectedTab('videos'); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.featuredBtnText}>{t.learningHub.startCourse}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>

              {/* PROGRESS CARD */}
              <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.progressCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.progressTitle}>Level {userProgress.level}</Text>
                    <Text style={styles.progressSub}>{userProgress.totalPoints} total points</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.progressSub}>{t.learningHub.weeklyGoal}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#14532d' }}>
                      {userProgress.weeklyCompleted}/{userProgress.weeklyGoal}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 12, color: '#166534', fontWeight: '600', marginBottom: 4 }}>
                    {t.learningHub.courseCompletion}
                  </Text>
                  {renderProgressBar((userProgress.completedModules / userProgress.totalModules) * 100)}
                </View>
              </Animated.View>

              {/* TABS */}
              <Animated.View entering={SlideInRight.delay(400).duration(400)}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {(['overview', 'simulations', 'videos', 'quizzes', 'mini-games'] as const).map(tab => (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
                      onPress={() => setSelectedTab(tab)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.tabBtnText, selectedTab === tab && styles.tabBtnTextActive]}>
                        {TAB_LABELS[tab]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>

              {/* VIDEO CATEGORY FILTER — shown only on Videos tab */}
              {selectedTab === 'videos' && (
                <Animated.View entering={FadeInDown.duration(300)}>
                  {/* Source banner */}
                  {videoSource === 'mock' && (
                    <View style={styles.fallbackBanner}>
                      <Ionicons name="wifi-outline" size={13} color="#fde68a" />
                      <Text style={styles.fallbackText}>
                        Showing offline videos. Connect to backend to load real content.
                      </Text>
                    </View>
                  )}
                  {videoSource === 'api' && (
                    <View style={styles.apiBanner}>
                      <Ionicons name="checkmark-circle" size={13} color="#86efac" />
                      <Text style={styles.apiText}>
                        {allVideos.length} videos loaded from backend
                      </Text>
                    </View>
                  )}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {VIDEO_CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedVideoCategory(cat.id)}
                        style={[styles.catChip, selectedVideoCategory === cat.id && styles.catChipActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.catChipEmoji}>{cat.emoji}</Text>
                        <Text style={[styles.catChipLabel, selectedVideoCategory === cat.id && styles.catChipLabelActive]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {isLoadingVideos && (
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#22c55e" />
                    </View>
                  )}
                </Animated.View>
              )}

              <View style={{ height: 4 }} />
            </>
          }

          renderItem={({ item, index }) => {
            if (selectedTab === 'videos') {
              const v = item as VideoModule;
              return (
                <Animated.View entering={FadeInUp.delay(index * 60).duration(400)}>
                  <TouchableOpacity
                    style={styles.videoCard}
                    activeOpacity={0.85}
                    onPress={() => setSelectedVideo(v)}
                  >
                    {/* Thumbnail */}
                    <View style={styles.thumbnailWrap}>
                      <VideoThumbnail video={v} style={styles.thumbnail} />
                      {/* Play overlay */}
                      <View style={styles.playOverlay}>
                        <View style={styles.playCircle}>
                          <Ionicons name="play" size={22} color="#ffffff" style={{ marginLeft: 3 }} />
                        </View>
                      </View>
                      {/* Duration pill */}
                      <View style={styles.durationPill}>
                        <Text style={styles.durationText}>⏱ {v.duration}</Text>
                      </View>
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1, padding: 12 }}>
                      <Text style={styles.videoCardTitle} numberOfLines={2}>{v.title}</Text>
                      <Text style={styles.videoCardDesc} numberOfLines={2}>{v.description}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                        <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[v.difficulty] + '22' }]}>
                          <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[v.difficulty] }]}>
                            {v.difficulty}
                          </Text>
                        </View>
                        <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '700' }}>+{v.points} XP</Text>
                      </View>
                      {v.progress > 0 && (
                        <View style={{ marginTop: 8 }}>
                          {renderProgressBar(v.progress)}
                          <Text style={{ color: '#6b7280', fontSize: 10, marginTop: 2 }}>
                            {v.progress >= 100 ? '✅ Completed' : `${v.progress}% watched`}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }

            // Simulation / quiz card
            const m = item as LearningModule;
            const isGrowthSim = m.id === 'plant-growth-simulation';
            return (
              <Animated.View entering={FadeInUp.delay(index * 80).duration(400)}>
                <TouchableOpacity
                  style={styles.moduleCard}
                  activeOpacity={isGrowthSim ? 0.85 : 1}
                  disabled={!isGrowthSim}
                  onPress={() => { if (isGrowthSim) { setSelectedSimulation(m); setActiveStage(0); } }}
                >
                  <View style={styles.cardThumbnail}>
                    <FontAwesome5 name={m.type === 'simulation' ? 'gamepad' : 'book'} size={24} color="#16a34a" />
                  </View>
                  <View style={{ flex: 1, padding: 16 }}>
                    <Text style={styles.moduleTitle} numberOfLines={1}>{m.title}</Text>
                    <Text style={styles.moduleDesc} numberOfLines={2}>{m.description}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <View style={styles.moduleMetaPill}>
                        <Text style={styles.moduleMetaText}>{m.type} • {m.duration}</Text>
                      </View>
                      <Text style={styles.modulePoints}>+{m.points} XP</Text>
                    </View>
                    <View style={{ marginTop: 10 }}>{renderProgressBar(m.progress)}</View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}

          ListFooterComponent={
            <>
              {selectedTab === 'videos' && displayVideos.length === 0 && !isLoadingVideos && (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Ionicons name="videocam-off-outline" size={48} color="rgba(0,0,0,0.2)" />
                  <Text style={{ color: '#6b7280', marginTop: 12, fontWeight: '600' }}>No videos found</Text>
                </View>
              )}

              {selectedTab === 'quizzes' && (
                <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.quizSection}>
                  <Text style={styles.sectionTitle}>{t.learningHub.quizCenter}</Text>
                  <TouchableOpacity style={styles.quizCard} onPress={() => router.push('/quiz')} activeOpacity={0.8}>
                    <View style={styles.quizIconWrap}><Text style={{ fontSize: 28 }}>📝</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizCenterTitle}>{t.learningHub.takeFullQuiz}</Text>
                      <Text style={styles.quizCenterSub}>{t.learningHub.quizSub}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={24} color="#10B981" />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {selectedTab === 'mini-games' && (
                <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.quizSection}>
                  <Text style={styles.sectionTitle}>{t.learningHub.availableGames}</Text>
                  <TouchableOpacity style={[styles.quizCard, { marginBottom: 16 }]} onPress={() => router.push('/games/crop-rotation')} activeOpacity={0.8}>
                    <View style={styles.quizIconWrap}><Text style={{ fontSize: 28 }}>🌽</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizCenterTitle}>{t.learningHub.cropRotationGame}</Text>
                      <Text style={styles.quizCenterSub}>{t.learningHub.cropRotationSub}</Text>
                    </View>
                    <Ionicons name="play-circle" size={32} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quizCard} onPress={() => router.push('/games/farm-day')} activeOpacity={0.8}>
                    <View style={[styles.quizIconWrap, { backgroundColor: '#EFF6FF' }]}><Text style={{ fontSize: 28 }}>🚜</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizCenterTitle}>{t.learningHub.farmDayGame}</Text>
                      <Text style={styles.quizCenterSub}>{t.learningHub.farmDaySub}</Text>
                    </View>
                    <Ionicons name="play-circle" size={32} color="#3B82F6" />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#14532d', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#166534', marginTop: 4, fontWeight: '600' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1.5, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  searchInput: { flex: 1, height: 50, fontSize: 15, color: '#1f2937', fontWeight: '500' },

  featuredCard: { padding: 20, borderRadius: 24, marginBottom: 16, shadowColor: '#0F7A4A', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  featuredBadge: { backgroundColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  featuredBadgeText: { color: '#86efac', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  featuredTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  featuredSub: { color: '#bbf7d0', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  featuredBtn: { backgroundColor: '#22c55e', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  featuredBtnText: { color: '#021F0F', fontWeight: '800', fontSize: 14 },

  progressCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  progressTitle: { fontSize: 18, fontWeight: '800', color: '#14532d' },
  progressSub: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginTop: 2 },

  tabBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', marginRight: 10 },
  tabBtnActive: { backgroundColor: '#14532d', borderColor: '#14532d' },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: '#166534' },
  tabBtnTextActive: { color: '#ffffff' },

  // Category chips
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, marginRight: 8, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  catChipActive: { backgroundColor: '#14532d', borderColor: '#14532d' },
  catChipEmoji: { fontSize: 13, marginRight: 5 },
  catChipLabel: { fontSize: 12, fontWeight: '700', color: '#166534' },
  catChipLabelActive: { color: '#ffffff' },

  // Banners
  fallbackBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)' },
  fallbackText: { color: '#92400e', fontSize: 12, flex: 1 },
  apiBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)' },
  apiText: { color: '#166534', fontSize: 12, flex: 1, fontWeight: '600' },

  // Video card (list)
  videoCard: { backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  thumbnailWrap: { position: 'relative', width: '100%', height: 180 },
  thumbnail: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  playCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  durationPill: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  durationText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  videoCardTitle: { fontSize: 15, fontWeight: '800', color: '#1f2937' },
  videoCardDesc: { color: '#6b7280', fontSize: 13, lineHeight: 18, marginTop: 4 },

  // Module card
  moduleCard: { backgroundColor: '#ffffff', borderRadius: 20, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardThumbnail: { width: 90, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  moduleTitle: { fontSize: 16, fontWeight: '800', color: '#1f2937' },
  moduleDesc: { color: '#6b7280', marginTop: 4, fontSize: 13, lineHeight: 18 },
  moduleMetaPill: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  moduleMetaText: { fontSize: 11, color: '#4b5563', fontWeight: '600', textTransform: 'capitalize' },
  modulePoints: { fontSize: 13, fontWeight: '800', color: '#d97706' },

  progressBarTrack: { height: 6, backgroundColor: '#dcfce7', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#22c55e', borderRadius: 3 },

  // Quiz / games
  quizSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#14532d', marginBottom: 12 },
  quizCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  quizIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  quizCenterTitle: { fontSize: 16, fontWeight: '800', color: '#1f2937' },
  quizCenterSub: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 18 },

  // Player screen
  playerHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  playerBackBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  playerHeaderTitle: { flex: 1, color: '#ffffff', fontWeight: '700', fontSize: 16 },
  videoContainer: { width: '100%', height: 220, backgroundColor: '#000', borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#14532d' },
  resumePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', padding: 12, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  resumePillText: { color: '#166534', fontSize: 13, fontWeight: '700' },
  completedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', padding: 14, borderRadius: 12, marginTop: 16, borderLeftWidth: 4, borderLeftColor: '#d97706' },
  completedPillText: { color: '#92400e', fontSize: 14, fontWeight: '700' },
  videoMeta: { marginTop: 20, padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  videoMetaTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 10 },
  videoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  videoMetaDuration: { color: '#86efac', fontSize: 13, fontWeight: '600' },
  videoMetaPoints: { color: '#fbbf24', fontSize: 13, fontWeight: '800', marginLeft: 'auto' },
  videoMetaDesc: { color: '#d1d5db', fontSize: 14, lineHeight: 22, marginTop: 8 },
  instructorText: { color: '#9ca3af', fontSize: 13, marginBottom: 4 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  difficultyText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

  // Crop growth-stage simulation screen
  simHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  simBackBtn: { padding: 10, backgroundColor: '#ffffff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  simHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#14532d' },
  simHeaderSub: { fontSize: 13, color: '#166534', marginTop: 2, fontWeight: '600' },
  simCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  simCardTitle: { fontSize: 20, fontWeight: '800', color: '#14532d' },
  simCardSub: { color: '#4b5563', fontSize: 14, marginTop: 4, fontWeight: '600' },
  simNavBtn: { flex: 1, backgroundColor: '#22c55e', padding: 16, borderRadius: 16, alignItems: 'center' },
  simNavBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
});
