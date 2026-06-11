import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import YoutubePlayer from 'react-native-youtube-iframe';

import { fetchAllVideos, getVideoProgress, updateVideoProgress } from '../../services/videoService';
import { VideoModule } from '../../data/videoMockData';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type ModuleType = 'simulation' | 'video' | 'quiz';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: Difficulty;
  category: string;
  type: ModuleType;
  thumbnail: string;
  completed: boolean;
  progress: number;
  points: number;
  locked: boolean;
  prerequisites?: string[];
}

// ✅ UPGRADED SIMULATION DATA STRUCTURE FOR GAMIFICATION
interface SimulationStep {
  id: string;
  title: string;
  description: string;
  actionText: string;
  visual: string;         // Emoji or icon before action
  successVisual: string;  // Emoji or icon after action
  feedback: string;
  points: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

interface CropTile {
  id: string;
  name: string;
  type: 'grain' | 'legume' | 'vegetable' | 'root';
  season: number;
  nitrogenEffect: number;
  pestResistance: number;
  yieldMultiplier: number;
  color: string;
}

interface FarmPlot {
  id: string;
  x: number;
  y: number;
  currentCrop: CropTile | null;
  soilHealth: { nitrogen: number; phosphorus: number; potassium: number };
  pestPressure: number;
  yield: number;
}

interface GameLevel {
  id: number;
  name: string;
  goal: string;
  targetScore: number;
  plotCount: number;
  seasons: number;
  specialChallenge?: string;
}

interface LearningHubProps {
  onBack?: () => void;
  onViewVirtualFarm?: () => void;
  onViewDashboard?: () => void;
  onViewWeeklyTasks?: () => void;
  autoDemo?: boolean;
  onMiniGames?: () => void;
}

/* ---------- GAMIFIED SIMULATION DATA ---------- */
const irrigationSimulation: SimulationStep[] = [
  { id: 's1', title: 'Check Soil Moisture', description: 'Insert the smart sensor into the dry soil.', actionText: 'Insert Sensor 🌡️', visual: '🏜️ 🥀', successVisual: '📊 Moisture: 25%', feedback: 'Soil is critically dry! Needs immediate watering.', points: 20 },
  { id: 's2', title: 'Select Target Zone', description: 'Zone A is showing drought stress. Target water delivery to save resources.', actionText: 'Select Zone A 🎯', visual: '🗺️ 🔴', successVisual: '🗺️ 🟢 Target Locked', feedback: 'Precision targeting saves up to 40% water.', points: 30 },
  { id: 's3', title: 'Set Drip Duration', description: 'Set timer to 18 minutes for optimal root absorption without runoff.', actionText: 'Set to 18 Min ⏱️', visual: '⏳ 00:00', successVisual: '⏳ 18:00', feedback: 'Perfect timing prevents water waste.', points: 40 },
  { id: 's4', title: 'Activate Drip System', description: 'Start the pump and deliver water directly to the roots.', actionText: 'Start Pump 💧', visual: '🚰 🚫', successVisual: '🌱 💦 🌿', feedback: 'Crops are thriving! You saved 50L of water.', points: 50 },
];

const pestSimulation: SimulationStep[] = [
  { id: 'p1', title: 'Identify Pest', description: 'Aphids detected on tomato leaves.', actionText: 'Scan Leaf 🔍', visual: '🍅 🐛', successVisual: '🦠 Aphids Found', feedback: 'Early detection prevents massive crop loss.', points: 20 },
  { id: 'p2', title: 'Choose Organic Remedy', description: 'Select Neem Oil instead of harsh chemical pesticides.', actionText: 'Select Neem Oil 🌿', visual: '🧪 vs 🌿', successVisual: '🌿 Neem Oil Ready', feedback: 'Neem oil protects beneficial insects like ladybugs.', points: 30 },
  { id: 'p3', title: 'Apply Spray', description: 'Spray lightly on the underside of leaves.', actionText: 'Spray Crops 💨', visual: '🪴 🐛', successVisual: '🪴 ✨', feedback: 'Pests cleared! Soil remains chemical-free.', points: 50 },
];

const learningModules: LearningModule[] = [
  {
    id: 'irrigation-basics',
    title: 'Smart Irrigation Systems',
    description: 'Learn efficient water management & irrigation methods step-by-step.',
    duration: '5 min',
    difficulty: 'beginner',
    category: 'irrigation',
    type: 'simulation',
    thumbnail: '',
    completed: true,
    progress: 100,
    points: 150,
    locked: false,
  },
  {
    id: 'crop-rotation-basics',
    title: 'Sustainable Crop Rotation',
    description: 'Crop rotation for soil health and yields',
    duration: '8 min',
    difficulty: 'beginner',
    category: 'crop-rotation',
    type: 'video',
    thumbnail: '',
    completed: true,
    progress: 100,
    points: 120,
    locked: false,
  },
  {
    id: 'pest-control-organic',
    title: 'Organic Pest Management',
    description: 'Protect crops without harmful chemicals interactively.',
    duration: '5 min',
    difficulty: 'intermediate',
    category: 'pest-control',
    type: 'simulation',
    thumbnail: '',
    completed: false,
    progress: 60,
    points: 200,
    locked: false,
  },
];

const userProgress = {
  totalPoints: 650,
  completedModules: 3,
  totalModules: 6,
  currentStreak: 5,
  level: 3,
  badges: ['First Steps', 'Water Wise', 'Crop Expert'],
  weeklyGoal: 4,
  weeklyCompleted: 2,
};

const gameLevels: GameLevel[] = [
  { id: 1, name: 'Beginner Farmer', goal: 'Maximize yield while keeping soil healthy', targetScore: 100, plotCount: 4, seasons: 2 },
  { id: 2, name: 'Soil Guardian', goal: 'Boost soil fertility above 70%', targetScore: 150, plotCount: 6, seasons: 3 },
];

/* ---------- LearningHub component ---------- */
export default function LearningHub({
  onBack,
  onViewVirtualFarm,
  onViewDashboard,
  onViewWeeklyTasks,
  autoDemo = false,
  onMiniGames,
}: LearningHubProps) {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoModule | null>(null);
  const [videos, setVideos] = useState<VideoModule[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Video Player Specific States
  const [playing, setPlaying] = useState(false);
  const [shouldSeek, setShouldSeek] = useState(false);
  const youtubePlayerRef = useRef<any>(null);

  const [selectedTab, setSelectedTab] = useState<'overview' | 'simulations' | 'videos' | 'quizzes' | 'mini-games'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ✅ SIMULATION SPECIFIC STATES
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationScore, setSimulationScore] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [stepSuccess, setStepSuccess] = useState(false); 

  // Game state
  const [showCropRotationGame, setShowCropRotationGame] = useState(false);
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropTile | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [gameScore, setGameScore] = useState(0);
  const [gameMessage, setGameMessage] = useState('');

  useEffect(() => {
    if (autoDemo && onMiniGames) {
      const t = setTimeout(() => onMiniGames(), 2500);
      return () => clearTimeout(t);
    }
  }, [autoDemo, onMiniGames]);

  // Fetch videos
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoadingVideos(true);
      const fetchedVideos = await fetchAllVideos();
      setVideos(fetchedVideos);
      setIsLoadingVideos(false);
    };
    loadVideos();
  }, []);

  // Load saved progress
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (selectedVideo) {
        setIsLoadingProgress(true);
        setProgressLoaded(false);
        setShouldSeek(false);
        setPlaying(false);
        try {
          const savedProgress = await getVideoProgress(selectedVideo.id);
          if (savedProgress && savedProgress.currentTime > 0) {
            setVideoProgress(savedProgress.progress);
            setCurrentTime(savedProgress.currentTime);
            setVideoDuration(savedProgress.duration);
            setShouldSeek(true);
          } else {
            setVideoProgress(0);
            setCurrentTime(0);
            setVideoDuration(0);
            setShouldSeek(false);
          }
        } catch (error) {
          console.error('Error loading progress:', error);
        } finally {
          setIsLoadingProgress(false);
          setProgressLoaded(true);
        }
      }
    };
    loadSavedProgress();
  }, [selectedVideo?.id]);

  // Track Youtube iframe time directly
  useEffect(() => {
    if (!selectedVideo || !progressLoaded) return;

    const interval = setInterval(async () => {
      if (youtubePlayerRef.current) {
        try {
          const current = await youtubePlayerRef.current.getCurrentTime();
          const duration = await youtubePlayerRef.current.getDuration();
          if (duration > 0 && current > 0) {
            setVideoDuration(duration);
            setCurrentTime(current);
            setVideoProgress(Math.round((current / duration) * 100));
          }
        } catch (e) {
          // Player loading or unmounted, safe to ignore
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedVideo, progressLoaded]);

  // Auto-save progress
  useEffect(() => {
    if (!selectedVideo || videoDuration === 0) return;

    const saveInterval = setInterval(() => {
      if (currentTime > 0) {
        const isCompleted = videoProgress >= 100;
        updateVideoProgress(selectedVideo.id, videoProgress, currentTime, videoDuration, isCompleted);
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [selectedVideo?.id, videoProgress, currentTime, videoDuration]);

  const handleModuleSelect = useCallback((module: LearningModule) => {
    if (!module.locked) {
      setSelectedModule(module);
      setSimulationStep(0);
      setSimulationScore(0);
      setSimulationComplete(false);
      setStepSuccess(false);

      if (module.type === 'video') {
        const videoData = videos.find(v => v.category === module.category);
        setSelectedVideo(videoData || null);
      }
    }
  }, [videos]);

  // ✅ NEW GAMIFIED SIMULATION ENGINE LOGIC
  const activeSimulation = selectedModule?.category === 'pest-control' ? pestSimulation : irrigationSimulation;

  const handleSimulationAction = useCallback(() => {
    const current = activeSimulation[simulationStep];
    
    // Trigger Success Visuals & Score
    setStepSuccess(true);
    setSimulationScore((s) => s + current.points);

    // Wait 2.5 seconds to read feedback, then move to next step automatically
    setTimeout(() => {
      setStepSuccess(false);
      if (simulationStep < activeSimulation.length - 1) {
        setSimulationStep((s) => s + 1);
      } else {
        setSimulationComplete(true);
      }
    }, 2500); 
  }, [simulationStep, activeSimulation]);

  // ✅ DOWNLOAD OFFLINE GUIDE LOGIC
  const handleGuideDownload = () => {
    Alert.alert(
      'Download Complete!', 
      'The farming guide has been saved for offline reading. You earned +50 XP for continuing your education!',
      [{ text: 'Awesome', style: 'default' }]
    );
  };

  const initializeGame = useCallback((level: number) => {
    const levelData = gameLevels[level - 1];
    const plots: FarmPlot[] = [];
    for (let i = 0; i < levelData.plotCount; i++) {
      plots.push({
        id: `plot-${i}`, x: i % 3, y: Math.floor(i / 3), currentCrop: null,
        soilHealth: { nitrogen: 50 + Math.random() * 30, phosphorus: 60 + Math.random() * 20, potassium: 55 + Math.random() * 25 },
        pestPressure: Math.random() * 30, yield: 0,
      });
    }
    setFarmPlots(plots);
    setCurrentSeason(1);
    setGameScore(0);
    setSelectedCrop(null);
    setGameMessage(`Level ${level}: ${gameLevels[level - 1].goal}`);
  }, []);

  const handleCropDrop = useCallback((plotId: string, crop: CropTile) => {
    setFarmPlots((prev) =>
      prev.map((plot) => {
        if (plot.id === plotId) {
          const updated = { ...plot, currentCrop: crop };
          updated.soilHealth.nitrogen = Math.max(0, Math.min(100, updated.soilHealth.nitrogen + crop.nitrogenEffect * 10));
          const avgSoil = (updated.soilHealth.nitrogen + updated.soilHealth.phosphorus + updated.soilHealth.potassium) / 3;
          updated.yield = (avgSoil / 100) * crop.yieldMultiplier * (100 - plot.pestPressure) / 100;
          return updated;
        }
        return plot;
      })
    );
    setSelectedCrop(null);
  }, []);

  /* ---------- UI Pieces ---------- */
  const renderProgressBar = (value: number) => (
    <View style={styles.progressBarTrack}>
      <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );

  // Filter Data
  const baseData = selectedTab === 'videos' ? videos : learningModules.filter((m) =>
    selectedTab === 'overview' ||
    (selectedTab === 'simulations' && m.type === 'simulation') ||
    (selectedTab === 'quizzes' && m.type === 'quiz')
  );

  const displayData = baseData.filter((item: any) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---------- RENDER SELECTED VIDEO / MODULE ---------- */
  if (selectedModule) {
    return (
      <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={{ flex: 1 }}>
        <StatusBar style="dark" backgroundColor="transparent" />
        <SafeAreaView style={styles.safe}>

          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedModule(null)} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={20} color="#14532d" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle} numberOfLines={1}>{selectedModule.title}</Text>
              <Text style={styles.headerSub}>{selectedModule.duration} • {selectedModule.difficulty}</Text>
            </View>
            <View style={{ width: 40 }} />
          </Animated.View>

          <ScrollView contentContainerStyle={styles.content}>
            <Animated.View entering={FadeInUp.delay(100).duration(400)}>
              
              {/* ✅ GAMIFIED INTERACTIVE SIMULATION PLAYER */}
              {selectedModule.type === 'simulation' && (
                <View style={styles.simCard}>
                  {!simulationComplete ? (
                    <>
                      {/* Step Progress & Score */}
                      <View style={styles.simHeader}>
                        <Text style={styles.simStepText}>Step {simulationStep + 1} of {activeSimulation.length}</Text>
                        <View style={styles.xpBadge}><Text style={styles.xpBadgeText}>{simulationScore} XP</Text></View>
                      </View>
                      
                      {/* Virtual Stage */}
                      <LinearGradient colors={stepSuccess ? ['#ecfdf5', '#d1fae5'] : ['#f3f4f6', '#e5e7eb']} style={styles.simStage}>
                        <Animated.Text entering={ZoomIn} key={stepSuccess ? 'success' : 'visual'} style={styles.simStageVisual}>
                          {stepSuccess ? activeSimulation[simulationStep].successVisual : activeSimulation[simulationStep].visual}
                        </Animated.Text>
                      </LinearGradient>

                      {/* Text & Controls */}
                      <View style={{ padding: 20 }}>
                        <Text style={styles.simTitle}>{activeSimulation[simulationStep].title}</Text>
                        
                        {!stepSuccess ? (
                          <>
                            <Text style={styles.simDesc}>{activeSimulation[simulationStep].description}</Text>
                            <TouchableOpacity style={styles.simActionBtn} onPress={handleSimulationAction} activeOpacity={0.8}>
                              <Text style={styles.simActionBtnText}>{activeSimulation[simulationStep].actionText}</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <Animated.View entering={FadeInDown.duration(300)} style={styles.simFeedbackBox}>
                            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={styles.simFeedbackText}>{activeSimulation[simulationStep].feedback}</Text>
                              <Text style={styles.simPointsEarned}>+{activeSimulation[simulationStep].points} XP Earned!</Text>
                            </View>
                          </Animated.View>
                        )}
                      </View>
                    </>
                  ) : (
                    <Animated.View entering={ZoomIn.duration(500)} style={styles.simCompleteBox}>
                      <Text style={{ fontSize: 60, marginBottom: 16 }}>🏆</Text>
                      <Text style={styles.simCompleteTitle}>Simulation Mastered!</Text>
                      <Text style={styles.simCompleteDesc}>
                        Excellent work! You made sustainable choices and earned a total of <Text style={{fontWeight: '800', color: '#d97706'}}>{simulationScore} XP</Text>.
                      </Text>
                      <View style={styles.simImpactBox}>
                        <Text style={styles.simImpactTitle}>🌍 Real-World Impact</Text>
                        <Text style={styles.simImpactText}>
                          {selectedModule.category === 'pest-control' ? '0 Chemicals Used • Soil Microbiome Saved' : '50L Water Saved • Deep Root Hydration Achieved'}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.primaryButton} onPress={() => setSelectedModule(null)}>
                        <Text style={styles.primaryButtonText}>Collect Rewards & Exit</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              )}

              {/* VIDEO PLAYER */}
              {selectedModule.type === 'video' && selectedVideo && (
                <View style={styles.card}>
                  {isLoadingProgress && (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                      <ActivityIndicator size="large" color="#22c55e" />
                      <Text style={{ marginTop: 16, color: '#166534', fontWeight: '600' }}>Loading video...</Text>
                    </View>
                  )}

                  {!isLoadingProgress && progressLoaded && (
                    <>
                      {currentTime > 0 && videoProgress > 0 && videoProgress < 100 && (
                        <View style={styles.resumePill}>
                          <Text style={styles.resumePillText}>
                            📺 Resuming from {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} ({videoProgress}%)
                          </Text>
                        </View>
                      )}

                      <View style={styles.videoContainer}>
                        <YoutubePlayer
                          ref={youtubePlayerRef}
                          height={220}
                          play={playing}
                          videoId={selectedVideo.videoUrl.split('v=')[1]?.split('&')[0] || ''}
                          onChangeState={(state) => {
                            if (state === 'ended') {
                              setPlaying(false);
                              setVideoProgress(100);
                            }
                          }}
                          onReady={() => {
                            if (shouldSeek && currentTime > 0) {
                              setTimeout(() => {
                                youtubePlayerRef.current?.seekTo(currentTime, true);
                                setShouldSeek(false);
                              }, 500);
                            }
                          }}
                        />
                      </View>

                      <View style={{ marginTop: 20 }}>
                        <Text style={styles.cardTitle}>{selectedVideo.title}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                          <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: '500' }}>👤 {selectedVideo.instructor}</Text>
                          <Text style={{ color: '#166534', fontSize: 13, fontWeight: '700' }}>+{selectedVideo.points} XP</Text>
                        </View>
                        <Text style={styles.cardText}>{selectedVideo.description}</Text>
                      </View>

                      {videoProgress >= 100 && (
                        <View style={styles.completedPill}>
                          <Text style={styles.completedPillText}>✓ Video Completed! You earned +{selectedVideo.points} XP</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  /* ---------- MAIN LEARNING HUB RENDER ---------- */
  return (
    <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>

        {/* HEADER */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Learning Hub 📚</Text>
            <Text style={styles.headerSub}>Master modern farming techniques</Text>
          </View>
        </Animated.View>

        {/* LIST / BODY */}
        <FlatList
          data={displayData as any}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={
            <>
              {/* SEARCH BAR */}
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#166534" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search modules & videos..."
                  placeholderTextColor="#6b7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={[styles.searchInput, isSearchFocused && styles.searchInputFocused]}
                />
              </Animated.View>

              {/* FEATURED CARD */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <LinearGradient colors={['#0F7A4A', '#053B24']} style={styles.featuredCard}>
                  <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>Featured</Text></View>
                  <Text style={styles.featuredTitle}>Master Crop Rotation</Text>
                  <Text style={styles.featuredSub}>Boost yield by 40% this season. Start the full interactive course today.</Text>
                  <TouchableOpacity style={styles.featuredBtn} activeOpacity={0.8}>
                    <Text style={styles.featuredBtnText}>Start Course</Text>
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
                    <Text style={styles.progressSub}>Weekly Goal</Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#14532d' }}>
                      {userProgress.weeklyCompleted}/{userProgress.weeklyGoal}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 12, color: '#166534', fontWeight: '600', marginBottom: 4 }}>Course Completion</Text>
                  {renderProgressBar((userProgress.completedModules / userProgress.totalModules) * 100)}
                </View>
              </Animated.View>

              {/* CATEGORY PILLS (TABS) */}
              <Animated.View entering={SlideInRight.delay(400).duration(400)}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollContainer}>
                  {['overview', 'simulations', 'videos', 'quizzes', 'mini-games'].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
                      onPress={() => setSelectedTab(tab as any)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.tabBtnText, selectedTab === tab && styles.tabBtnTextActive]}>
                        {tab === 'overview' ? 'All' : tab === 'mini-games' ? 'Mini Games' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>

              <View style={{ height: 16 }} />
            </>
          }

          renderItem={({ item, index }) => {
            const isVideo = selectedTab === 'videos';
            const videoItem = isVideo ? (item as unknown as VideoModule) : null;
            const moduleItem = !isVideo ? (item as LearningModule) : null;

            return (
              <Animated.View entering={FadeInUp.delay(500 + (index * 100)).duration(400)}>
                <TouchableOpacity
                  style={styles.moduleCard}
                  activeOpacity={0.75}
                  onPress={() => {
                    if (isVideo && videoItem) {
                      setSelectedVideo(videoItem);
                      setSelectedModule({
                        id: videoItem.id, title: videoItem.title, description: videoItem.description,
                        duration: videoItem.duration, difficulty: videoItem.difficulty, category: videoItem.category,
                        type: 'video', thumbnail: videoItem.thumbnail, completed: videoItem.completed,
                        progress: videoItem.progress, points: videoItem.points, locked: false,
                      });
                    } else if (moduleItem) {
                      handleModuleSelect(moduleItem);
                    }
                  }}
                >
                  <View style={styles.cardThumbnail}>
                    <FontAwesome5 name={isVideo ? 'play' : moduleItem?.type === 'simulation' ? 'gamepad' : 'book'} size={24} color="#16a34a" />
                  </View>

                  <View style={{ flex: 1, padding: 16 }}>
                    <Text style={styles.moduleTitle} numberOfLines={1}>{isVideo ? videoItem?.title : moduleItem?.title}</Text>
                    <Text style={styles.moduleDesc} numberOfLines={2}>{isVideo ? videoItem?.description : moduleItem?.description}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <View style={styles.moduleMetaPill}>
                        <Text style={styles.moduleMetaText}>
                          {isVideo ? `Video • ${videoItem?.duration}` : `${moduleItem?.type} • ${moduleItem?.duration}`}
                        </Text>
                      </View>
                      <Text style={styles.modulePoints}>+{isVideo ? videoItem?.points : moduleItem?.points} XP</Text>
                    </View>

                    <View style={{ marginTop: 12 }}>
                      {renderProgressBar(isVideo ? videoItem?.progress || 0 : moduleItem?.progress || 0)}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}

          ListFooterComponent={
            <>
              {/* QUIZ CENTER */}
              {selectedTab === 'quizzes' && (
                <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.quizCenterSection}>
                  <Text style={styles.sectionTitle}>Quiz Center</Text>
                  <TouchableOpacity style={styles.quizCenterCard} onPress={() => router.push('/quiz')} activeOpacity={0.8}>
                    <View style={styles.quizIconWrap}><Text style={{ fontSize: 28 }}>📝</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizCenterTitle}>Take a Full Quiz</Text>
                      <Text style={styles.quizCenterSub}>Test your knowledge across all modules and earn major XP.</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={24} color="#10B981" />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* MINI GAMES CENTER */}
              {selectedTab === 'mini-games' && (
                <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.quizCenterSection}>
                  <Text style={styles.sectionTitle}>Available Games</Text>
                  <TouchableOpacity style={[styles.quizCenterCard, { marginBottom: 16 }]} onPress={() => router.push('/games/crop-rotation')} activeOpacity={0.8}>
                    <View style={styles.quizIconWrap}><Text style={{ fontSize: 28 }}>🌽</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizCenterTitle}>Crop Rotation Master</Text>
                      <Text style={styles.quizCenterSub}>Learn how to balance soil nutrients!</Text>
                    </View>
                    <Ionicons name="play-circle" size={32} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quizCenterCard} onPress={() => router.push('/games/farm-day')} activeOpacity={0.8}>
                    <View style={[styles.quizIconWrap, { backgroundColor: '#EFF6FF' }]}><Text style={{ fontSize: 28 }}>🚜</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizCenterTitle}>Farm Day Challenge</Text>
                      <Text style={styles.quizCenterSub}>Manage your farm and grow crops!</Text>
                    </View>
                    <Ionicons name="play-circle" size={32} color="#3B82F6" />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* ✅ OFFLINE SUPPORT / DOWNLOADABLE GUIDES */}
              {(selectedTab === 'simulations' || selectedTab === 'overview') && (
                <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.quizCenterSection}>
                  <Text style={styles.sectionTitle}>Offline Support</Text>
                  <TouchableOpacity style={styles.quizCenterCard} onPress={handleGuideDownload} activeOpacity={0.8}>
                    <View style={[styles.quizIconWrap, { backgroundColor: '#FEF3C7' }]}><Text style={{ fontSize: 28 }}>📥</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizCenterTitle}>Downloadable Guides</Text>
                      <Text style={styles.quizCenterSub}>Save farming handbooks to your device for offline reading. Earn XP even without active missions!</Text>
                    </View>
                    <Ionicons name="cloud-download" size={26} color="#D97706" />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {isLoadingVideos && selectedTab === 'videos' && (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#22c55e" />
                </View>
              )}
            </>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },

  /* HEADER */
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#14532d', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#166534', marginTop: 4, fontWeight: '600' },
  headerButton: { padding: 10, backgroundColor: '#ffffff', borderRadius: 12, marginRight: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  /* SEARCH BAR */
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1.5, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  searchInput: { flex: 1, height: 50, fontSize: 15, color: '#1f2937', fontWeight: '500' },
  searchInputFocused: { borderColor: '#22c55e' }, 

  /* FEATURED CARD */
  featuredCard: { padding: 20, borderRadius: 24, marginBottom: 16, shadowColor: '#0F7A4A', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  featuredBadge: { backgroundColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  featuredBadgeText: { color: '#86efac', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  featuredTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  featuredSub: { color: '#bbf7d0', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  featuredBtn: { backgroundColor: '#22c55e', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  featuredBtnText: { color: '#021F0F', fontWeight: '800', fontSize: 14 },

  /* PROGRESS CARD */
  progressCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  progressTitle: { fontSize: 18, fontWeight: '800', color: '#14532d', letterSpacing: -0.3 },
  progressSub: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginTop: 2 },

  /* CATEGORY PILLS */
  tabScrollContainer: { flexDirection: 'row', marginBottom: 8 },
  tabBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', marginRight: 10 },
  tabBtnActive: { backgroundColor: '#14532d', borderColor: '#14532d' },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: '#166534' },
  tabBtnTextActive: { color: '#ffffff' },

  /* MODULE CARDS */
  moduleCard: { backgroundColor: '#ffffff', borderRadius: 20, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardThumbnail: { width: 100, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  moduleTitle: { fontSize: 16, fontWeight: '800', color: '#1f2937' },
  moduleDesc: { color: '#6b7280', marginTop: 4, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  moduleMetaPill: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  moduleMetaText: { fontSize: 11, color: '#4b5563', fontWeight: '600', textTransform: 'capitalize' },
  modulePoints: { fontSize: 13, fontWeight: '800', color: '#d97706' },

  /* PROGRESS BARS */
  progressBarTrack: { height: 6, backgroundColor: '#dcfce7', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#22c55e', borderRadius: 3 },

  /* VIDEO DETAILS VIEW */
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#14532d' },
  cardText: { color: '#4b5563', fontSize: 15, lineHeight: 24, marginTop: 8 },
  primaryButton: { backgroundColor: '#22c55e', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  primaryButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  resumePill: { backgroundColor: '#dcfce7', padding: 12, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  resumePillText: { color: '#166534', fontSize: 13, fontWeight: '700' },
  completedPill: { backgroundColor: '#fef3c7', padding: 14, borderRadius: 12, marginTop: 16, borderLeftWidth: 4, borderLeftColor: '#d97706' },
  completedPillText: { color: '#92400e', fontSize: 14, fontWeight: '700' },
  videoContainer: { width: '100%', height: 220, backgroundColor: '#021F0F', borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#14532d' },

  /* ✅ NEW GAMIFIED SIMULATION STYLES */
  simCard: { backgroundColor: '#ffffff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
  simHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  simStepText: { fontSize: 14, fontWeight: '800', color: '#6b7280', textTransform: 'uppercase' },
  xpBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  xpBadgeText: { color: '#d97706', fontWeight: '900', fontSize: 14 },
  simStage: { height: 180, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  simStageVisual: { fontSize: 60 },
  simTitle: { fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 8 },
  simDesc: { fontSize: 15, color: '#4b5563', lineHeight: 22, marginBottom: 24 },
  simActionBtn: { backgroundColor: '#22c55e', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#22c55e', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  simActionBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  simFeedbackBox: { flexDirection: 'row', backgroundColor: '#ecfdf5', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#a7f3d0' },
  simFeedbackText: { fontSize: 14, color: '#065f46', fontWeight: '600', lineHeight: 20 },
  simPointsEarned: { fontSize: 13, color: '#16a34a', fontWeight: '800', marginTop: 4 },
  simCompleteBox: { padding: 30, alignItems: 'center' },
  simCompleteTitle: { fontSize: 24, fontWeight: '900', color: '#14532d', marginBottom: 12 },
  simCompleteDesc: { fontSize: 15, color: '#4b5563', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  simImpactBox: { width: '100%', backgroundColor: '#f0fdfa', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#6ee7b7', marginBottom: 24, alignItems: 'center' },
  simImpactTitle: { fontSize: 14, fontWeight: '800', color: '#047857', marginBottom: 6 },
  simImpactText: { fontSize: 15, color: '#065f46', fontWeight: '600', textAlign: 'center' },

  /* QUIZ CENTER & GAME CENTER & OFFLINE HUB */
  quizCenterSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#14532d', marginBottom: 12 },
  quizCenterCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  quizIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  quizCenterTitle: { fontSize: 16, fontWeight: '800', color: '#1f2937' },
  quizCenterSub: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 18 },
});