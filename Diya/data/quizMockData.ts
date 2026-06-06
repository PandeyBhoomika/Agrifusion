// Mock quiz data for development and fallback

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  category: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  questions: QuizQuestion[];
}

export const mockQuizCategories: QuizCategory[] = [
  {
    id: 'soil-health',
    name: 'Soil Health',
    description: 'Test your knowledge about soil management and health',
    icon: '🌱',
    questions: [
      {
        id: 'sh-q1',
        question: 'What is the ideal pH range for most crops?',
        type: 'multiple-choice',
        options: ['5.0-5.5', '6.0-7.0', '7.5-8.5', '8.0-9.0'],
        correctAnswer: 1,
        explanation: 'Most crops prefer a pH range of 6.0–7.0 as it allows optimal nutrient availability.',
        points: 25,
        category: 'soil-health',
      },
      {
        id: 'sh-q2',
        question: 'Organic matter helps soil retain water.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'True — organic matter improves water retention capacity of soil.',
        points: 20,
        category: 'soil-health',
      },
      {
        id: 'sh-q3',
        question: 'Which nutrient is represented by "N" in NPK fertilizer?',
        type: 'multiple-choice',
        options: ['Nickel', 'Nitrogen', 'Neon', 'Sodium'],
        correctAnswer: 1,
        explanation: 'N stands for Nitrogen, which is essential for leafy green growth.',
        points: 25,
        category: 'soil-health',
      },
      {
        id: 'sh-q4',
        question: 'Earthworms are harmful to soil health.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'False — earthworms are beneficial as they aerate soil and add nutrients.',
        points: 20,
        category: 'soil-health',
      },
    ],
  },
  {
    id: 'crop-management',
    name: 'Crop Management',
    description: 'Learn about effective crop cultivation techniques',
    icon: '🌾',
    questions: [
      {
        id: 'cm-q1',
        question: 'What is crop rotation?',
        type: 'multiple-choice',
        options: [
          'Planting the same crop repeatedly',
          'Alternating different crops in sequence',
          'Rotating crops during harvest',
          'Moving crops to different fields',
        ],
        correctAnswer: 1,
        explanation: 'Crop rotation involves alternating different crops in sequence to improve soil health.',
        points: 30,
        category: 'crop-management',
      },
      {
        id: 'cm-q2',
        question: 'Monocropping reduces pest problems.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'False — monocropping can increase pest problems as pests thrive in uniform environments.',
        points: 25,
        category: 'crop-management',
      },
      {
        id: 'cm-q3',
        question: 'Which season is best for wheat sowing in India?',
        type: 'multiple-choice',
        options: ['Summer', 'Monsoon', 'Winter', 'Spring'],
        correctAnswer: 2,
        explanation: 'Wheat is a Rabi crop, sown in winter and harvested in spring.',
        points: 30,
        category: 'crop-management',
      },
    ],
  },
  {
    id: 'irrigation-water',
    name: 'Irrigation & Water',
    description: 'Master water management and irrigation practices',
    icon: '💧',
    questions: [
      {
        id: 'iw-q1',
        question: 'Which irrigation method is most water-efficient?',
        type: 'multiple-choice',
        options: ['Flood irrigation', 'Drip irrigation', 'Sprinkler irrigation', 'Channel irrigation'],
        correctAnswer: 1,
        explanation: 'Drip irrigation delivers water directly to plant roots, minimizing waste.',
        points: 30,
        category: 'irrigation-water',
      },
      {
        id: 'iw-q2',
        question: 'Overwatering can harm plant roots.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'True — overwatering can lead to root rot and reduced oxygen availability.',
        points: 25,
        category: 'irrigation-water',
      },
      {
        id: 'iw-q3',
        question: 'What does the term "water table" refer to?',
        type: 'multiple-choice',
        options: [
          'Surface water level',
          'Underground water level',
          'Rainfall measurement',
          'Water quality index',
        ],
        correctAnswer: 1,
        explanation: 'The water table is the level below which the ground is saturated with water.',
        points: 30,
        category: 'irrigation-water',
      },
    ],
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Understand pest management and organic solutions',
    icon: '🐛',
    questions: [
      {
        id: 'pc-q1',
        question: 'Which is an example of biological pest control?',
        type: 'multiple-choice',
        options: [
          'Using chemical pesticides',
          'Introducing natural predators',
          'Burning infested crops',
          'Using herbicides',
        ],
        correctAnswer: 1,
        explanation: 'Biological pest control uses natural predators like ladybugs to control pests.',
        points: 30,
        category: 'pest-control',
      },
      {
        id: 'pc-q2',
        question: 'Neem oil is a natural pesticide.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'True — neem oil is widely used as an organic pesticide.',
        points: 25,
        category: 'pest-control',
      },
      {
        id: 'pc-q3',
        question: 'What does IPM stand for?',
        type: 'multiple-choice',
        options: [
          'Integrated Pest Management',
          'Insect Protection Method',
          'Internal Plant Monitoring',
          'Irrigation and Pest Maintenance',
        ],
        correctAnswer: 0,
        explanation: 'IPM stands for Integrated Pest Management, combining multiple pest control strategies.',
        points: 30,
        category: 'pest-control',
      },
    ],
  },
];
