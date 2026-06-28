import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoModule {
  // From MongoDB
  id: string;
  _id?: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl: string;
  youtubeId: string;    // NEW: extracted ID — used directly by YoutubePlayer
  thumbnail: string;    // either stored URL or built from youtubeId
  thumbnailUrl?: string; // virtual from backend
  instructor: string;
  points: number;
  isActive?: boolean;
  // Frontend-only (not in DB, tracked locally via AsyncStorage)
  completed: boolean;
  progress: number;
}

export interface VideoProgressData {
  videoId: string;
  progress: number;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

// ─── Normaliser ───────────────────────────────────────────────────────────────
// Maps the backend Video document to the VideoModule shape the screen expects.

const extractYoutubeId = (url: string): string => {
  const match = url?.match(/(?:v=|youtu\.be\/)([^&?/\s]{11})/);
  return match ? match[1] : '';
};

export const normaliseVideo = (raw: any): VideoModule => {
  const ytId = raw.youtubeId || extractYoutubeId(raw.videoUrl || '');
  const thumb =
    raw.thumbnailUrl ||
    raw.thumbnail ||
    (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');

  return {
    id:          raw._id   || raw.id || '',
    title:       raw.title || '',
    description: raw.description || '',
    duration:    raw.duration  || '',
    category:    raw.category  || '',
    difficulty:  raw.difficulty || 'beginner',
    videoUrl:    raw.videoUrl  || '',
    youtubeId:   ytId,
    thumbnail:   thumb,
    instructor:  raw.instructor || '',
    points:      raw.points ?? 100,
    isActive:    raw.isActive !== false,
    // Progress is local-only — load from AsyncStorage separately
    completed:   false,
    progress:    0,
  };
};

// ─── Fallback mock data ───────────────────────────────────────────────────────

export const mockVideos: VideoModule[] = [
  {
    id: 'video-1', title: 'Sustainable Crop Rotation',
    description: 'Fundamentals of crop rotation for improved soil health and higher yields.',
    duration: '8 min', category: 'crop-rotation', difficulty: 'beginner',
    videoUrl: 'https://www.youtube.com/watch?v=XzSchrmBt8g', youtubeId: 'XzSchrmBt8g',
    thumbnail: 'https://img.youtube.com/vi/XzSchrmBt8g/hqdefault.jpg',
    instructor: 'Dr. Rajesh Kumar', points: 120, completed: true, progress: 100,
  },
  {
    id: 'video-2', title: 'Smart Irrigation Techniques',
    description: 'Master modern irrigation methods including drip and sprinkler systems.',
    duration: '12 min', category: 'irrigation', difficulty: 'intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=TboW5yVrLrQ', youtubeId: 'TboW5yVrLrQ',
    thumbnail: 'https://img.youtube.com/vi/TboW5yVrLrQ/hqdefault.jpg',
    instructor: 'Dr. Priya Sharma', points: 150, completed: false, progress: 45,
  },
  {
    id: 'video-3', title: 'Organic Pest Management',
    description: 'Natural methods to protect crops using companion planting and neem-based sprays.',
    duration: '15 min', category: 'pest-control', difficulty: 'intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=VjWgNmjaRq4', youtubeId: 'VjWgNmjaRq4',
    thumbnail: 'https://img.youtube.com/vi/VjWgNmjaRq4/hqdefault.jpg',
    instructor: 'Prof. Amit Patel', points: 180, completed: false, progress: 0,
  },
  {
    id: 'video-4', title: 'Soil Testing & Analysis',
    description: 'Understanding soil composition and nutrient levels for optimal farming.',
    duration: '10 min', category: 'soil-health', difficulty: 'beginner',
    videoUrl: 'https://www.youtube.com/watch?v=QqjLGSv-gHM', youtubeId: 'QqjLGSv-gHM',
    thumbnail: 'https://img.youtube.com/vi/QqjLGSv-gHM/hqdefault.jpg',
    instructor: 'Dr. Sunita Verma', points: 130, completed: false, progress: 0,
  },
];

// ─── Fetch all videos ─────────────────────────────────────────────────────────

export const fetchAllVideos = async (): Promise<VideoModule[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to fetch videos from API, using mock data');
      return mockVideos;
    }

    const json = await response.json();

    // ✅ KEY FIX: backend returns { success, count, data: [...] }
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      console.log(`✅ Loaded ${json.data.length} videos from API`);
      // Merge local progress into each video
      const normalised = json.data.map(normaliseVideo);
      return await mergeLocalProgress(normalised);
    }

    console.warn('⚠️ API returned empty data, using mock data');
    return mockVideos;
  } catch (error) {
    console.error(`🚨 Connection failed: ${API_BASE_URL}/videos — check EXPO_PUBLIC_API_URL`);
    return mockVideos;
  }
};

// ─── Fetch by category ────────────────────────────────────────────────────────

export const fetchVideosByCategory = async (category: string): Promise<VideoModule[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/category/${category}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch category ${category}, filtering mock data`);
      return mockVideos.filter(v => v.category === category);
    }

    const json = await response.json();

    if (json.success && Array.isArray(json.data)) {
      const normalised = json.data.map(normaliseVideo);
      return await mergeLocalProgress(normalised);
    }

    return mockVideos.filter(v => v.category === category);
  } catch (error) {
    console.warn(`Error fetching category ${category}:`, error);
    return mockVideos.filter(v => v.category === category);
  }
};

// ─── Fetch single video ───────────────────────────────────────────────────────

export const fetchVideoById = async (videoId: string): Promise<VideoModule | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return mockVideos.find(v => v.id === videoId) || null;
    }

    const json = await response.json();

    if (json.success && json.data) {
      // ✅ KEY FIX: backend returns { success, data: {...} } not { video: {...} }
      const normalised = normaliseVideo(json.data);
      const saved = await getProgressFromAsyncStorage(normalised.id);
      if (saved) {
        normalised.progress  = saved.progress;
        normalised.completed = saved.completed;
      }
      return normalised;
    }

    return mockVideos.find(v => v.id === videoId) || null;
  } catch (error) {
    console.warn(`Error fetching video ${videoId}:`, error);
    return mockVideos.find(v => v.id === videoId) || null;
  }
};

// ─── Search videos ────────────────────────────────────────────────────────────

export const searchVideos = async (query: string): Promise<VideoModule[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/videos/search?q=${encodeURIComponent(query)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) return searchLocalVideos(mockVideos, query);

    const json = await response.json();

    if (json.success && Array.isArray(json.data)) {
      const normalised = json.data.map(normaliseVideo);
      return await mergeLocalProgress(normalised);
    }

    return searchLocalVideos(mockVideos, query);
  } catch {
    return searchLocalVideos(mockVideos, query);
  }
};

const searchLocalVideos = (videos: VideoModule[], query: string): VideoModule[] => {
  const q = query.toLowerCase().trim();
  if (!q) return videos;
  return videos.filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.description.toLowerCase().includes(q) ||
    v.category.toLowerCase().includes(q)
  );
};

// ─── Progress: AsyncStorage (local) ──────────────────────────────────────────

const PROGRESS_KEY = (id: string) => `video_progress_${id}`;

export const saveProgressToLocal = async (
  videoId: string,
  progress: number,
  currentTime: number,
  duration: number,
  completed: boolean
): Promise<void> => {
  try {
    const data: VideoProgressData = {
      videoId, progress, currentTime, duration, completed,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PROGRESS_KEY(videoId), JSON.stringify(data));
  } catch (error) {
    console.warn('Error saving progress to AsyncStorage:', error);
  }
};

const getProgressFromAsyncStorage = async (
  videoId: string
): Promise<VideoProgressData | null> => {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY(videoId));
    return raw ? (JSON.parse(raw) as VideoProgressData) : null;
  } catch {
    return null;
  }
};

// Merge locally saved progress into a list of videos
const mergeLocalProgress = async (videos: VideoModule[]): Promise<VideoModule[]> => {
  return Promise.all(
    videos.map(async (v) => {
      const saved = await getProgressFromAsyncStorage(v.id);
      if (saved) {
        return { ...v, progress: saved.progress, completed: saved.completed };
      }
      return v;
    })
  );
};

// ─── updateVideoProgress (saves locally; extend later for server sync) ────────

export const updateVideoProgress = async (
  videoId: string,
  progress: number,
  currentTime: number,
  duration: number,
  completed: boolean
): Promise<boolean> => {
  await saveProgressToLocal(videoId, progress, currentTime, duration, completed);
  // TODO: POST to /api/videos/:id/progress when that endpoint is ready
  return true;
};

// ─── getVideoProgress (reads from local storage) ─────────────────────────────

export const getVideoProgress = async (
  videoId: string
): Promise<VideoProgressData | null> => {
  return getProgressFromAsyncStorage(videoId);
};

// ─── Helpers for mock compatibility ──────────────────────────────────────────

export const getMockVideosByCategory = (category: string): VideoModule[] =>
  mockVideos.filter(v => v.category === category);

export const getMockVideoById = (id: string): VideoModule | null =>
  mockVideos.find(v => v.id === id) || null;

export const getAllMockVideos = (): VideoModule[] => mockVideos;
