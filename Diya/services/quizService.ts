// Quiz Service - Fetch quiz questions from API by category
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockQuizCategories, QuizCategory, QuizQuestion } from '../data/quizMockData';

// Fallback to laptop's IP if env var is missing. 
// Note: localhost will fail on physical devices!
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface QuizResponse {
  success: boolean;
  data?: QuizCategory;
  error?: string;
}

export interface AllQuizzesResponse {
  success: boolean;
  data?: QuizCategory[];
  error?: string;
}

/**
 * Fetch quiz questions by category from API
 * Falls back to mock data if API fails
 * @param categoryId - The quiz category ID (e.g., 'soil-health', 'crop-management')
 */
export const fetchQuizByCategory = async (categoryId: string): Promise<QuizCategory | null> => {
  try {
    console.log(`Fetching quiz from: ${API_BASE_URL}/quiz/${categoryId}`);
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/quiz/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch quiz for category ${categoryId}, using mock data`);
      return getMockQuizByCategory(categoryId);
    }

    const data = await response.json();

    if (data.quiz) {
      return data.quiz;
    }

    return getMockQuizByCategory(categoryId);
  } catch (error) {
    console.warn(`Error fetching quiz for category ${categoryId}, using mock data:`, error);
    return getMockQuizByCategory(categoryId);
  }
};

/**
 * Fetch all quiz categories from API
 * Falls back to mock data if API fails
 */
export const fetchAllQuizzes = async (): Promise<QuizCategory[]> => {
  try {
    console.log(`Fetching all quizzes from: ${API_BASE_URL}/quiz/all`);
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/quiz/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch all quizzes from API, using mock data');
      return mockQuizCategories;
    }

    const data = await response.json();

    if (data.quizzes && Array.isArray(data.quizzes)) {
      return data.quizzes;
    }

    return mockQuizCategories;
  } catch (error) {
    console.warn('Error fetching all quizzes, using mock data:', error);
    return mockQuizCategories;
  }
};

/**
 * Submit quiz answers and get score from backend
 * @param categoryId - The quiz category ID
 * @param answers - Object mapping question IDs to selected answer indices
 */
export const submitQuizAnswers = async (
  categoryId: string,
  answers: { [questionId: string]: number }
): Promise<{ score: number; totalPoints: number; percentage: number } | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/quiz/${categoryId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      console.warn('Failed to submit quiz, calculating locally');
      return null;
    }

    const data = await response.json();

    if (data.score !== undefined && data.totalPoints !== undefined) {
      return {
        score: data.score,
        totalPoints: data.totalPoints,
        percentage: data.percentage || Math.round((data.score / data.totalPoints) * 100),
      };
    }

    return null;
  } catch (error) {
    console.warn('Error submitting quiz:', error);
    return null;
  }
};

/**
 * Get mock quiz data by category (for offline/testing)
 */
export const getMockQuizByCategory = (categoryId: string): QuizCategory | null => {
  return mockQuizCategories.find(cat => cat.id === categoryId) || null;
};

/**
 * Get all mock quiz categories (for offline/testing)
 */
export const getAllMockQuizzes = (): QuizCategory[] => {
  return mockQuizCategories;
};