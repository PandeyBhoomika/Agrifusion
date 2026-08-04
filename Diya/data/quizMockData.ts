// Quiz data types - no mock data, all data comes from MongoDB via API

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  questions: QuizQuestion[];
}

// No mock data - app uses real MongoDB data only
export const mockQuizCategories: QuizCategory[] = [];
