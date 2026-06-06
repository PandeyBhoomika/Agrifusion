import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { fetchAllVideos, getVideoProgress, updateVideoProgress } from '../../services/videoService';
import { VideoModule } from '../../data/videoMockData';

// Conditionally import WebView only for mobile platforms
let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

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

interface SimulationStep {
  id: string;
  title: string;
  description: string;
  action: 'tap' | 'drag' | 'select' | 'wait';
  target?: string;
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

/* ---------- sample data (kept simple & local) ---------- */
const learningModules: LearningModule[] = [
  {
    id: 'irrigation-basics',
    title: 'Smart Irrigation Systems',
    description: 'Efficient water management & irrigation methods',
    duration: '12 min',
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
    description: 'Protect crops without harmful chemicals',
    duration: '15 min',
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

const irrigationSimulation: SimulationStep[] = [
  {
    id: 'step-1',
    title: 'Check Soil Moisture',
    description: 'Tap the soil sensor to check moisture',
    action: 'tap',
    target: 'soil-sensor',
    feedback: 'Soil moisture is 25% — needs watering.',
    points: 20,
  },
  {
    id: 'step-2',
    title: 'Select Irrigation Zone',
    description: 'Choose the irrigation zone',
    action: 'select',
    target: 'zone-selector',
    feedback: 'Zone A selected — lowest moisture.',
    points: 30,
  },
  {
    id: 'step-3',
    title: 'Set Water Duration',
    description: 'Choose duration (recommended 15-20 min)',
    action: 'drag',
    target: 'time-slider',
    feedback: '18 minutes chosen — optimal.',
    points: 40,
  },
  {
    id: 'step-4',
    title: 'Start Irrigation',
    description: 'Start watering',
    action: 'tap',
    target: 'start-button',
    feedback: 'Water is flowing efficiently.',
    points: 50,
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

const cropTiles: CropTile[] = [
  { id: 'rice', name: 'Rice', type: 'grain', season: 1, nitrogenEffect: -1, pestResistance: 3, yieldMultiplier: 1.2, color: '#FDE68A' },
  { id: 'beans', name: 'Beans', type: 'legume', season: 2, nitrogenEffect: 2, pestResistance: 4, yieldMultiplier: 0.8, color: '#BBF7D0' },
  { id: 'tomato', name: 'Tomato', type: 'vegetable', season: 3, nitrogenEffect: -1, pestResistance: 2, yieldMultiplier: 1.5, color: '#FECACA' },
];

const gameLevels: GameLevel[] = [
  { id: 1, name: 'Beginner Farmer', goal: 'Maximize yield while keeping soil healthy', targetScore: 100, plotCount: 4, seasons: 2 },
  { id: 2, name: 'Soil Guardian', goal: 'Boost soil fertility above 70%', targetScore: 150, plotCount: 6, seasons: 3 },
];

/* ---------- LearningHub component (React Native) ---------- */
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
  const [playerReady, setPlayerReady] = useState(false);
  const [shouldSeek, setShouldSeek] = useState(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'simulations' | 'videos' | 'quizzes'>('overview');
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationScore, setSimulationScore] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);

  // game state
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

  // Fetch videos on component mount
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoadingVideos(true);
      const fetchedVideos = await fetchAllVideos();
      setVideos(fetchedVideos);
      setIsLoadingVideos(false);
    };
    loadVideos();
  }, []);

  // Load saved progress when video is selected
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (selectedVideo) {
        // Clean up previous player
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            // Ignore cleanup errors
          }
          playerRef.current = null;
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        
        setIsLoadingProgress(true);
        setProgressLoaded(false);
        setPlayerReady(false);
        setShouldSeek(false);
        try {
          const savedProgress = await getVideoProgress(selectedVideo.id);
          if (savedProgress && savedProgress.currentTime > 0) {
            setVideoProgress(savedProgress.progress);
            setCurrentTime(savedProgress.currentTime);
            setVideoDuration(savedProgress.duration);
            setShouldSeek(true); // Flag to seek when player is ready
            console.log('Loaded saved progress:', savedProgress);
          } else {
            // No saved progress, start from beginning
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
    
    // Cleanup on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [selectedVideo?.id]);

  // Auto-save progress every 5 seconds while video is playing
  useEffect(() => {
    if (!selectedVideo || videoDuration === 0) {
      console.log('⏸️ Auto-save disabled:', { hasVideo: !!selectedVideo, duration: videoDuration });
      return;
    }

    console.log('▶️ Auto-save enabled for:', selectedVideo.id);
    const saveInterval = setInterval(() => {
      if (currentTime > 0) {
        console.log('💾 Auto-saving progress:', { currentTime, progress: videoProgress, duration: videoDuration });
        const isCompleted = videoProgress >= 100;
        updateVideoProgress(
          selectedVideo.id,
          videoProgress,
          currentTime,
          videoDuration,
          isCompleted
        );
      } else {
        console.log('⏭️ Skipping save, currentTime is 0');
      }
    }, 5000); // Save every 5 seconds

    return () => {
      console.log('🛑 Clearing auto-save interval');
      clearInterval(saveInterval);
    };
  }, [selectedVideo?.id, videoProgress, currentTime, videoDuration]);

  const handleModuleSelect = useCallback((module: LearningModule) => {
    if (!module.locked) {
      setSelectedModule(module);
      setSimulationStep(0);
      setSimulationScore(0);
      setSimulationComplete(false);
      
      // If it's a video module, find the corresponding video data
      if (module.type === 'video') {
        const videoData = videos.find(v => v.category === module.category);
        setSelectedVideo(videoData || null);
        // Progress will be loaded by the useEffect
      }
    }
  }, [videos]);

  const handleSimulationAction = useCallback((stepId: string) => {
    const current = irrigationSimulation[simulationStep];
    if (current && current.id === stepId) {
      setSimulationScore((s) => s + current.points);
      if (simulationStep < irrigationSimulation.length - 1) {
        setSimulationStep((s) => s + 1);
      } else {
        setSimulationComplete(true);
      }
    }
  }, [simulationStep]);

  const initializeGame = useCallback((level: number) => {
    const levelData = gameLevels[level - 1];
    const plots: FarmPlot[] = [];
    for (let i = 0; i < levelData.plotCount; i++) {
      plots.push({
        id: `plot-${i}`,
        x: i % 3,
        y: Math.floor(i / 3),
        currentCrop: null,
        soilHealth: { nitrogen: 50 + Math.random() * 30, phosphorus: 60 + Math.random() * 20, potassium: 55 + Math.random() * 25 },
        pestPressure: Math.random() * 30,
        yield: 0,
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

  const advanceSeason = useCallback(() => {
    const levelData = gameLevels[currentLevel - 1];
    if (currentSeason < levelData.seasons) {
      setCurrentSeason((s) => s + 1);
      setFarmPlots((prev) => prev.map((plot) => ({
        ...plot,
        pestPressure: Math.min(100, plot.pestPressure + Math.random() * 20),
        soilHealth: {
          nitrogen: Math.max(0, plot.soilHealth.nitrogen - 5),
          phosphorus: Math.max(0, plot.soilHealth.phosphorus - 3),
          potassium: Math.max(0, plot.soilHealth.potassium - 4),
        },
      })));
      setGameMessage(`Season ${currentSeason + 1} begins.`);
    } else {
      const totalYield = farmPlots.reduce((s, p) => s + p.yield, 0);
      const avgSoil = farmPlots.length ? farmPlots.reduce((s, p) => s + (p.soilHealth.nitrogen + p.soilHealth.phosphorus + p.soilHealth.potassium) / 3, 0) / farmPlots.length : 0;
      const finalScore = Math.round(totalYield * 10 + avgSoil);
      setGameScore(finalScore);
      setGameMessage(`Final Score: ${finalScore}`);
    }
  }, [currentSeason, currentLevel, farmPlots]);

  const startCropRotationGame = useCallback(() => {
    initializeGame(1);
    setShowCropRotationGame(true);
  }, [initializeGame]);

  /* ---------- UI pieces ---------- */
  const renderProgressBar = (value: number) => (
    <View style={styles.progressBarTrack}>
      <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );

  /* ---------- render ---------- */
  if (selectedModule) {
    return (
      <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedModule(null)} style={styles.headerButton}><Text>← Back</Text></TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>{selectedModule.title}</Text>
            <Text style={styles.headerSub}>{selectedModule.duration} • {selectedModule.difficulty}</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {selectedModule.type === 'simulation' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Simulation Coming Soon</Text>
              <Text style={styles.cardText}>Interactive farming simulations will be available here.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setSelectedModule(null)}>
                <Text style={styles.primaryButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedModule.type === 'video' && selectedVideo && (
            <View style={styles.card}>
              {/* Loading state */}
              {isLoadingProgress && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={{ marginTop: 10, color: '#666' }}>Loading video...</Text>
                </View>
              )}
              
              {!isLoadingProgress && progressLoaded && (
                <>
                  {/* Resume notification */}
                  {currentTime > 0 && videoProgress > 0 && videoProgress < 100 && (
                    <View style={{ backgroundColor: '#DBEAFE', padding: 10, borderRadius: 8, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#3B82F6' }}>
                      <Text style={{ color: '#1E40AF', fontSize: 13, fontWeight: '600' }}>
                        📺 Resuming from {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} ({videoProgress}%)
                      </Text>
                    </View>
                  )}
                  
                  {/* YouTube Video Player with Progress Tracking */}
                  <View style={styles.videoContainer}>
                {Platform.OS === 'web' ? (
                  // For web platform, use iframe with proper YouTube API integration
                  <iframe
                    key={selectedVideo.id}
                    id="youtube-player-iframe"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    src={`https://www.youtube.com/embed/${selectedVideo.videoUrl.split('v=')[1]?.split('&')[0] || ''}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      if (typeof window !== 'undefined' && !playerRef.current) {
                        // Load YouTube IFrame API
                        if (!(window as any).YT) {
                          const tag = document.createElement('script');
                          tag.src = 'https://www.youtube.com/iframe_api';
                          const firstScriptTag = document.getElementsByTagName('script')[0];
                          firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
                        }
                        
                        // Wait for API and initialize player
                        const initPlayer = () => {
                          const YT = (window as any).YT;
                          if (YT && YT.Player && !playerRef.current) {
                            const iframe = document.getElementById('youtube-player-iframe') as HTMLIFrameElement;
                            playerRef.current = new YT.Player(iframe, {
                              events: {
                                'onReady': (event: any) => {
                                  console.log('Player ready, shouldSeek:', shouldSeek, 'currentTime:', currentTime);
                                  if (shouldSeek && currentTime > 0) {
                                    setTimeout(() => {
                                      console.log('Seeking to:', currentTime);
                                      event.target.seekTo(currentTime, true);
                                      setShouldSeek(false);
                                    }, 500);
                                  }
                                  
                                  // Clear any existing interval
                                  if (progressIntervalRef.current) {
                                    clearInterval(progressIntervalRef.current);
                                  }
                                  
                                  // Track progress
                                  progressIntervalRef.current = setInterval(() => {
                                    try {
                                      const current = event.target.getCurrentTime();
                                      const duration = event.target.getDuration();
                                      if (duration > 0) {
                                        setVideoDuration(duration);
                                        setCurrentTime(current);
                                        const progress = Math.round((current / duration) * 100);
                                        setVideoProgress(progress);
                                      }
                                    } catch (e) {
                                      // Ignore errors
                                    }
                                  }, 1000);
                                }
                              }
                            });
                          }
                        };
                        
                        if ((window as any).YT && (window as any).YT.Player) {
                          initPlayer();
                        } else {
                          (window as any).onYouTubeIframeAPIReady = initPlayer;
                        }
                      }
                    }}
                  />
                ) : (
                  // For mobile platforms, use WebView with YouTube IFrame API
                  WebView && (
                    <WebView
                      style={styles.videoPlayer}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      onMessage={(event: any) => {
                        try {
                          const data = JSON.parse(event.nativeEvent.data);
                          if (data.currentTime !== undefined && data.duration !== undefined) {
                            setCurrentTime(data.currentTime);
                            setVideoDuration(data.duration);
                            const progress = Math.round((data.currentTime / data.duration) * 100);
                            setVideoProgress(progress);
                          }
                        } catch (e) {
                          // Ignore parsing errors
                        }
                      }}
                      source={{
                        html: `
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <style>
                                body { margin: 0; padding: 0; background-color: #000; }
                                .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; }
                                .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                              </style>
                              <script src="https://www.youtube.com/iframe_api"></script>
                            </head>
                            <body>
                              <div class="video-container">
                                <div id="player"></div>
                              </div>
                              <script>
                                var player;
                                function onYouTubeIframeAPIReady() {
                                  const videoId = '${selectedVideo.videoUrl.split('v=')[1]?.split('&')[0] || ''}';
                                  player = new YT.Player('player', {
                                    height: '100%',
                                    width: '100%',
                                    videoId: videoId,
                                    events: {
                                      'onReady': onPlayerReady
                                    }
                                  });
                                }
                                
                                function onPlayerReady(event) {
                                  // Seek to saved position if available
                                  const savedTime = ${currentTime};
                                  if (savedTime > 0 && player.seekTo) {
                                    player.seekTo(savedTime, true);
                                  }
                                  
                                  // Start tracking when player is ready
                                  setInterval(function() {
                                    if (player && player.getCurrentTime) {
                                      const currentTime = player.getCurrentTime();
                                      const duration = player.getDuration();
                                      window.ReactNativeWebView.postMessage(JSON.stringify({
                                        currentTime: currentTime,
                                        duration: duration
                                      }));
                                    }
                                  }, 1000);
                                }
                              </script>
                            </body>
                          </html>
                        `,
                      }}
                    />
                  )
                )}
              </View>
              
              <View style={{ height: 16 }} />
              
              {/* Progress controls */}
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>Video Progress</Text>
                  <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600' }}>{videoProgress}%</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${videoProgress}%` }]} />
                </View>
                {videoDuration > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 11, color: '#6B7280' }}>
                      {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6B7280' }}>
                      {Math.floor(videoDuration / 60)}:{Math.floor(videoDuration % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <View style={[styles.progressButton, videoProgress >= 25 && styles.progressButtonActive]}>
                    <Text style={[styles.progressButtonText, videoProgress >= 25 && styles.progressButtonTextActive]}>25%</Text>
                  </View>
                  <View style={[styles.progressButton, videoProgress >= 50 && styles.progressButtonActive]}>
                    <Text style={[styles.progressButtonText, videoProgress >= 50 && styles.progressButtonTextActive]}>50%</Text>
                  </View>
                  <View style={[styles.progressButton, videoProgress >= 75 && styles.progressButtonActive]}>
                    <Text style={[styles.progressButtonText, videoProgress >= 75 && styles.progressButtonTextActive]}>75%</Text>
                  </View>
                  <View style={[styles.progressButton, videoProgress === 100 && styles.progressButtonActive]}>
                    <Text style={[styles.progressButtonText, videoProgress === 100 && styles.progressButtonTextActive]}>Complete</Text>
                  </View>
                </View>
                {/* Debug: Manual Save Button */}
                <TouchableOpacity 
                  style={{ backgroundColor: '#F59E0B', padding: 8, borderRadius: 6, marginTop: 8 }}
                  onPress={async () => {
                    const testTime = 60; // Save at 1 minute for testing
                    const testProgress = Math.round((testTime / 300) * 100); // Assuming 5 min video
                    await updateVideoProgress(selectedVideo.id, testProgress, testTime, 300, false);
                    alert(`Progress saved! Time: ${testTime}s, Progress: ${testProgress}%`);
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 11, textAlign: 'center' }}>🧪 Test Save (60s)</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle}>{selectedVideo.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                <Text style={{ color: '#666', fontSize: 12 }}>👤 {selectedVideo.instructor}</Text>
                <Text style={{ color: '#666', fontSize: 12 }}>⏱️ {selectedVideo.duration}</Text>
              </View>
              <Text style={styles.cardText}>{selectedVideo.description}</Text>
              <View style={{ height: 12 }} />
              
              {videoProgress === 100 && (
                <View style={{ backgroundColor: '#D1FAE5', padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#10B981' }}>
                  <Text style={{ color: '#065F46', fontWeight: '600', fontSize: 14 }}>✓ Video Completed!</Text>
                  <Text style={{ color: '#047857', fontSize: 12, marginTop: 4 }}>You've earned +{selectedVideo.points} points</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.primaryButton} onPress={() => { 
                setSelectedModule(null); 
                setSelectedVideo(null); 
                setVideoProgress(0);
                setVideoDuration(0);
                setCurrentTime(0);
                setProgressLoaded(false);
              }}>
                <Text style={styles.primaryButtonText}>Back to Videos</Text>
              </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      </LinearGradient>
    );
  }

  // build filtered modules list once
  const filteredModules = learningModules.filter((m) =>
    selectedTab === 'overview' ||
    (selectedTab === 'simulations' && m.type === 'simulation') ||
    (selectedTab === 'quizzes' && m.type === 'quiz')
  );

  // For videos tab, use actual video data
  const displayData = selectedTab === 'videos' ? videos : filteredModules;

  // Replace the outer ScrollView + inner FlatList with a single FlatList:
  return (
    <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Learning Hub</Text>
          <Text style={styles.headerSub}>Learn & grow your farm</Text>
        </View>
      </View>

      {isLoadingVideos && selectedTab === 'videos' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={{ marginTop: 12, color: '#666' }}>Loading videos...</Text>
        </View>
      ) : (
        <FlatList
          data={displayData as any}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => {
            // Check if item is VideoModule or LearningModule
            const isVideo = selectedTab === 'videos';
            const videoItem = isVideo ? (item as unknown as VideoModule) : null;
            const moduleItem = !isVideo ? (item as LearningModule) : null;

            return (
              <TouchableOpacity 
                style={styles.moduleCard} 
                onPress={() => {
                  if (isVideo && videoItem) {
                    setSelectedVideo(videoItem);
                    setSelectedModule({
                      id: videoItem.id,
                      title: videoItem.title,
                      description: videoItem.description,
                      duration: videoItem.duration,
                      difficulty: videoItem.difficulty,
                      category: videoItem.category,
                      type: 'video',
                      thumbnail: videoItem.thumbnail,
                      completed: videoItem.completed,
                      progress: videoItem.progress,
                      points: videoItem.points,
                      locked: false,
                    });
                  } else if (moduleItem) {
                    handleModuleSelect(moduleItem);
                  }
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleTitle}>{isVideo ? videoItem?.title : moduleItem?.title}</Text>
                  <Text style={styles.moduleDesc}>{isVideo ? videoItem?.description : moduleItem?.description}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      {isVideo ? `video • ${videoItem?.duration}` : `${moduleItem?.type} • ${moduleItem?.duration}`}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#10B981' }}>
                      +{isVideo ? videoItem?.points : moduleItem?.points} pts
                    </Text>
                  </View>
                  {isVideo && videoItem?.instructor && (
                    <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>👤 {videoItem.instructor}</Text>
                  )}
                  <View style={{ marginTop: 8 }}>
                    {renderProgressBar(isVideo ? videoItem?.progress || 0 : moduleItem?.progress || 0)}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 12 }}
        // header: progress + tabs
        ListHeaderComponent={
          <>
            <View style={styles.progressCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.progressTitle}>Level {userProgress.level}</Text>
                  <Text style={styles.progressSub}>{userProgress.totalPoints} points</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.progressSub}>Weekly</Text>
                  <Text>{userProgress.weeklyCompleted}/{userProgress.weeklyGoal}</Text>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: '#333' }}>Completion</Text>
                {renderProgressBar((userProgress.completedModules / userProgress.totalModules) * 100)}
              </View>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity style={[styles.tabBtn, selectedTab === 'overview' && styles.tabBtnActive]} onPress={() => setSelectedTab('overview')}><Text>All</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, selectedTab === 'simulations' && styles.tabBtnActive]} onPress={() => setSelectedTab('simulations')}><Text>Sims</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, selectedTab === 'videos' && styles.tabBtnActive]} onPress={() => setSelectedTab('videos')}><Text>Videos</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, selectedTab === 'quizzes' && styles.tabBtnActive]} onPress={() => setSelectedTab('quizzes')}><Text>Quizzes</Text></TouchableOpacity>
            </View>

            <View style={{ height: 8 }} />
          </>
        }
        // footer: mini games + spacing
        ListFooterComponent={
          <>
            <View style={{ height: 24 }} />

            {/* Quiz Center Section - Only show on Quizzes tab */}
            {selectedTab === 'quizzes' && (
              <View style={styles.quizCenterSection}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#111827' }}>Quiz Center</Text>
                <TouchableOpacity style={styles.quizCenterCard} onPress={() => router.push('/quiz')}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={styles.quizCenterIcon}>
                      <Text style={{ fontSize: 28 }}>📝</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 16, color: '#111827' }}>Take a Quiz</Text>
                      <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>Test your knowledge across categories</Text>
                    </View>
                    <Text style={{ fontSize: 20, color: '#10B981', marginLeft: 8 }}>→</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 80 }} />
          </>
        }
      />
      )}
    </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 12 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerButton: { 
    padding: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  headerSub: { 
    fontSize: 13, 
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  content: { padding: 16 },

  progressCard: { 
    backgroundColor: '#ECFDF5', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#D1FAE5',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: { 
    fontSize: 18, 
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.3,
  },
  progressSub: { 
    fontSize: 13, 
    color: '#047857',
    fontWeight: '600',
    marginTop: 2,
  },

  tabRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16,
    gap: 10,
  },
  tabBtn: { 
    flex: 1, 
    padding: 12, 
    alignItems: 'center', 
    borderRadius: 12, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnActive: { 
    backgroundColor: '#ECFDF5', 
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  moduleCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 12, 
    borderWidth: 2, 
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  moduleTitle: { 
    fontSize: 17, 
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  moduleDesc: { 
    color: '#6B7280', 
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  cardSubtitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#374151',
    marginTop: 4,
  },
  cardText: { 
    color: '#6B7280', 
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },

  primaryButton: { 
    backgroundColor: '#10B981', 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  progressBarTrack: { 
    height: 10, 
    backgroundColor: '#E5E7EB', 
    borderRadius: 5, 
    overflow: 'hidden', 
    marginTop: 8,
  },
  progressBarFill: { 
    height: 10, 
    backgroundColor: '#10B981',
    borderRadius: 5,
  },

  progressButton: { 
    flex: 1, 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#D1D5DB', 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  progressButtonActive: { 
    backgroundColor: '#ECFDF5', 
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressButtonText: { 
    fontSize: 13, 
    color: '#6B7280', 
    fontWeight: '700',
  },
  progressButtonTextActive: { 
    color: '#047857',
    fontWeight: '800',
  },

  optionButton: { 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#E5E7EB', 
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },
  optionButtonActive: { 
    backgroundColor: '#ECFDF5', 
    borderColor: '#10B981',
  },
  optionText: { 
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextActive: { 
    color: '#047857', 
    fontWeight: '800',
  },

  videoPlaceholder: { 
    width: '100%', 
    height: 220, 
    backgroundColor: '#1F2937', 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  videoContainer: { 
    width: '100%', 
    height: 240, 
    backgroundColor: '#000', 
    borderRadius: 14, 
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  videoPlayer: { 
    flex: 1, 
    backgroundColor: '#000',
  },

  quizCenterSection: { marginBottom: 16 },
  quizCenterCard: { 
    backgroundColor: '#DBEAFE', 
    padding: 18, 
    borderRadius: 14, 
    borderWidth: 2, 
    borderColor: '#93C5FD',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  quizCenterIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },

  gameCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 14, 
    borderWidth: 2, 
    borderColor: '#E5E7EB', 
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cropRow: { 
    flexDirection: 'row', 
    marginBottom: 14,
    gap: 10,
  },
  cropTile: { 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 12, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: '#E5E7EB',
  },

  plotsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
  },
  plotCell: { 
    width: '48%', 
    height: 150, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 14, 
    borderWidth: 2, 
    borderColor: '#E5E7EB',
  },
});