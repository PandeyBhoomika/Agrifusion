// Mock video data for learning hub

export interface VideoModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl: string;
  thumbnail: string;
  instructor: string;
  points: number;
  completed: boolean;
  progress: number;
}

export const mockVideos: VideoModule[] = [
  {
    id: 'video-1',
    title: 'Sustainable Crop Rotation',
    description: 'Learn the fundamentals of crop rotation for improved soil health and higher yields',
    duration: '8 min',
    category: 'crop-rotation',
    difficulty: 'beginner',
    videoUrl: 'https://www.youtube.com/watch?v=XzSchrmBt8g',
    thumbnail: 'https://via.placeholder.com/320x180/10B981/ffffff?text=Crop+Rotation',
    instructor: 'Dr. Rajesh Kumar',
    points: 120,
    completed: true,
    progress: 100,
  },
  {
    id: 'video-2',
    title: 'Smart Irrigation Techniques',
    description: 'Master modern irrigation methods including drip and sprinkler systems',
    duration: '12 min',
    category: 'irrigation',
    difficulty: 'intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=TboW5yVrLrQ',
    thumbnail: 'https://via.placeholder.com/320x180/3B82F6/ffffff?text=Irrigation',
    instructor: 'Dr. Priya Sharma',
    points: 150,
    completed: false,
    progress: 45,
  },
  {
    id: 'video-3',
    title: 'Organic Pest Management',
    description: 'Natural and eco-friendly methods to protect your crops from pests',
    duration: '15 min',
    category: 'pest-control',
    difficulty: 'intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=VjWgNmjaRq4',
    thumbnail: 'https://via.placeholder.com/320x180/F59E0B/ffffff?text=Pest+Control',
    instructor: 'Prof. Amit Patel',
    points: 180,
    completed: false,
    progress: 0,
  },
  {
    id: 'video-4',
    title: 'Soil Testing & Analysis',
    description: 'Understanding soil composition and nutrient levels for optimal farming',
    duration: '10 min',
    category: 'soil-health',
    difficulty: 'beginner',
    videoUrl: 'https://www.youtube.com/watch?v=QqjLGSv-gHM',
    thumbnail: 'https://via.placeholder.com/320x180/8B5CF6/ffffff?text=Soil+Testing',
    instructor: 'Dr. Sunita Verma',
    points: 130,
    completed: false,
    progress: 0,
  },
  {
    id: 'video-5',
    title: 'Seasonal Crop Planning',
    description: 'Plan your crops according to Kharif, Rabi, and Zaid seasons',
    duration: '14 min',
    category: 'crop-management',
    difficulty: 'intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=PzL5W0MHeyA',
    thumbnail: 'https://via.placeholder.com/320x180/EF4444/ffffff?text=Crop+Planning',
    instructor: 'Mr. Ravi Thakur',
    points: 160,
    completed: false,
    progress: 0,
  },
  {
    id: 'video-6',
    title: 'Water Conservation Methods',
    description: 'Save water with rainwater harvesting and efficient storage techniques',
    duration: '11 min',
    category: 'water-management',
    difficulty: 'beginner',
    videoUrl: 'https://www.youtube.com/watch?v=o2fC4JTjnxo',
    thumbnail: 'https://via.placeholder.com/320x180/06B6D4/ffffff?text=Water+Conservation',
    instructor: 'Dr. Meera Singh',
    points: 140,
    completed: false,
    progress: 0,
  },
  {
    id: 'video-7',
    title: 'Advanced Fertilizer Application',
    description: 'Learn about NPK ratios and precision fertilizer application techniques',
    duration: '16 min',
    category: 'soil-health',
    difficulty: 'advanced',
    videoUrl: 'https://www.youtube.com/watch?v=MrGKRHkSq54',
    thumbnail: 'https://via.placeholder.com/320x180/10B981/ffffff?text=Fertilizers',
    instructor: 'Prof. Anil Desai',
    points: 200,
    completed: false,
    progress: 0,
  },
  {
    id: 'video-8',
    title: 'Climate-Smart Agriculture',
    description: 'Adapt your farming practices to changing climate conditions',
    duration: '13 min',
    category: 'sustainability',
    difficulty: 'advanced',
    videoUrl: 'https://www.youtube.com/watch?v=WXiMS75o4aE',
    thumbnail: 'https://via.placeholder.com/320x180/EC4899/ffffff?text=Climate+Smart',
    instructor: 'Dr. Kavita Joshi',
    points: 190,
    completed: false,
    progress: 0,
  },
];
