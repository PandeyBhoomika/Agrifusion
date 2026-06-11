import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockVideos, VideoModule } from '../data/videoMockData';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export interface VideoResponse {
  success: boolean;
  data?: VideoModule;
  error?: string;
}

export interface VideosListResponse {
  success: boolean;
  data?: VideoModule[];
  error?: string;
}

export interface VideoProgressUpdate {
  videoId: string;
  progress: number;
  currentTime: number;
  duration: number;
  completed: boolean;
}

export interface VideoProgressData {
  videoId: string;
  progress: number;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated: string;
}

/**
 * Fetch all learning videos from API
 * Falls back to mock data if API fails
 */
export const fetchAllVideos = async (): Promise<VideoModule[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch videos from API, using mock data');
      return mockVideos;
    }

    const data = await response.json();

    if (data.videos && Array.isArray(data.videos)) {
      return data.videos;
    }

    return mockVideos;
  } catch (error) {
    console.warn('Error fetching videos, using mock data:', error);
    return mockVideos;
  }
};

/**
 * Fetch videos by category
 * @param category - Category to filter by (e.g., 'irrigation', 'pest-control')
 */
export const fetchVideosByCategory = async (category: string): Promise<VideoModule[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/category/${category}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch videos for category ${category}, using mock data`);
      return getMockVideosByCategory(category);
    }

    const data = await response.json();

    if (data.videos && Array.isArray(data.videos)) {
      return data.videos;
    }

    return getMockVideosByCategory(category);
  } catch (error) {
    console.warn(`Error fetching videos for category ${category}, using mock data:`, error);
    return getMockVideosByCategory(category);
  }
};

/**
 * Fetch a specific video by ID
 * @param videoId - The video ID
 */
export const fetchVideoById = async (videoId: string): Promise<VideoModule | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch video ${videoId}, using mock data`);
      return getMockVideoById(videoId);
    }

    const data = await response.json();

    if (data.video) {
      return data.video;
    }

    return getMockVideoById(videoId);
  } catch (error) {
    console.warn(`Error fetching video ${videoId}, using mock data:`, error);
    return getMockVideoById(videoId);
  }
};

/**
 * Update video progress with timestamp
 * @param videoId - The video ID
 * @param progress - Progress percentage (0-100)
 * @param currentTime - Current playback time in seconds
 * @param duration - Total video duration in seconds
 * @param completed - Whether video is completed
 */
export const updateVideoProgress = async (
  videoId: string,
  progress: number,
  currentTime: number,
  duration: number,
  completed: boolean
): Promise<boolean> => {
  console.log('📹 updateVideoProgress called:', { videoId, progress, currentTime, duration, completed });

  // Always save to AsyncStorage immediately (React Native fallback)
  await saveProgressToAsyncStorage(videoId, progress, currentTime, duration, completed);

  try {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress,
        currentTime,
        duration,
        completed,
        lastUpdated: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to update video progress on server, using AsyncStorage');
      return false;
    }

    console.log('✅ Progress saved to server:', { videoId, progress, currentTime });
    return true;
  } catch (error) {
    console.warn('❌ Error updating video progress on server, using AsyncStorage:', error);
    return false;
  }
};

/**
 * Get video progress from server or async storage
 * @param videoId - The video ID
 */
export const getVideoProgress = async (videoId: string): Promise<VideoProgressData | null> => {
  // First try async storage (faster local load)
  const localProgress = await getProgressFromAsyncStorage(videoId);

  try {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch video progress from server, using async storage');
      return localProgress;
    }

    const data = await response.json();

    if (data.progress) {
      console.log('Loaded progress from server:', data.progress);
      return data.progress;
    }

    return localProgress;
  } catch (error) {
    console.warn('Error fetching video progress from server, using async storage:', error);
    return localProgress;
  }
};

/**
 * Save progress to AsyncStorage (fallback/offline mode for React Native)
 */
const saveProgressToAsyncStorage = async (
  videoId: string,
  progress: number,
  currentTime: number,
  duration: number,
  completed: boolean
): Promise<void> => {
  try {
    const progressData: VideoProgressData = {
      videoId,
      progress,
      currentTime,
      duration,
      completed,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(`video_progress_${videoId}`, JSON.stringify(progressData));
    console.log('✅ Saved to AsyncStorage:', progressData);
  } catch (error) {
    console.warn('❌ Error saving to AsyncStorage:', error);
  }
};

/**
 * Get progress from AsyncStorage
 */
const getProgressFromAsyncStorage = async (videoId: string): Promise<VideoProgressData | null> => {
  try {
    const data = await AsyncStorage.getItem(`video_progress_${videoId}`);
    if (data) {
      const parsed = JSON.parse(data) as VideoProgressData;
      console.log('✅ Loaded from AsyncStorage:', parsed);
      return parsed;
    } else {
      console.log('ℹ️ No saved progress found for:', videoId);
    }
  } catch (error) {
    console.warn('❌ Error reading from AsyncStorage:', error);
  }
  return null;
};

/**
 * Get mock videos by category (for offline/testing)
 */
export const getMockVideosByCategory = (category: string): VideoModule[] => {
  return mockVideos.filter(video => video.category === category);
};

/**
 * Get mock video by ID (for offline/testing)
 */
export const getMockVideoById = (videoId: string): VideoModule | null => {
  return mockVideos.find(video => video.id === videoId) || null;
};

/**
 * Get all mock videos (for offline/testing)
 */
export const getAllMockVideos = (): VideoModule[] => {
  return mockVideos;
};

/**
 * Search videos by title or description
 * @param query - Search query string
 */
export const searchVideos = async (query: string): Promise<VideoModule[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to search videos, using mock data');
      return searchMockVideos(query);
    }

    const data = await response.json();

    if (data.videos && Array.isArray(data.videos)) {
      return data.videos;
    }

    return searchMockVideos(query);
  } catch (error) {
    console.warn('Error searching videos, using mock data:', error);
    return searchMockVideos(query);
  }
};

/**
 * Search mock videos locally
 */
const searchMockVideos = (query: string): VideoModule[] => {
  const lowerQuery = query.toLowerCase();
  return mockVideos.filter(
    video =>
      video.title.toLowerCase().includes(lowerQuery) ||
      video.description.toLowerCase().includes(lowerQuery) ||
      video.category.toLowerCase().includes(lowerQuery)
  );
};