// Quiz Service - Fetch quiz questions from API
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizCategory, QuizQuestion } from '../data/quizMockData';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

// Maps raw MongoDB question to QuizQuestion (preserves difficulty)
const mapQuestion = (q: any, categoryId: string): QuizQuestion => ({
  id: q._id || q.id,
  question: q.questionText || q.question,
  type: q.options?.length === 2 ? 'true-false' : 'multiple-choice',
  options: q.options,
  correctAnswer: q.correctAnswerIndex ?? q.correctAnswer,
  explanation: q.explanation || '',
  points: q.points || 25,
  category: categoryId,
  difficulty: q.difficulty || 'medium',
});

// Maps raw MongoDB quiz to QuizCategory
const mapQuiz = (quiz: any): QuizCategory => ({
  id: quiz.category || quiz.id,
  name: quiz.title || quiz.name,
  description: quiz.description || '',
  icon: quiz.icon || '📚',
  questions: (quiz.questions || []).map((q: any) => mapQuestion(q, quiz.category || quiz.id)),
});

export const fetchAllQuizzes = async (): Promise<QuizCategory[]> => {
  try {
    console.log(`Fetching all quizzes from: ${API_BASE_URL}/quiz/all`);
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/quiz/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch all quizzes from API');
      return [];
    }

    const data = await response.json();

    if (data.quizzes && Array.isArray(data.quizzes)) {
      return data.quizzes.map(mapQuiz);
    }

    return [];
  } catch (error) {
    console.warn('Error fetching all quizzes:', error);
    return [];
  }
};

export const fetchQuizByCategory = async (categoryId: string): Promise<QuizCategory | null> => {
  try {
    console.log(`Fetching quiz from: ${API_BASE_URL}/quiz/${categoryId}`);
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/quiz/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch quiz for category ${categoryId}`);
      return null;
    }

    const data = await response.json();

    if (data.quiz) {
      return mapQuiz(data.quiz);
    }

    return null;
  } catch (error) {
    console.warn(`Error fetching quiz for category ${categoryId}:`, error);
    return null;
  }
};

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
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) return null;

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
