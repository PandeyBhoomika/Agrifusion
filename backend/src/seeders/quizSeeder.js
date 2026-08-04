// src/seeders/quizSeeder.js
// Run this once to populate your MongoDB with quiz data
// Command: node src/seeders/quizSeeder.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  xpReward: { type: Number, default: 100 },
  coinReward: { type: Number, default: 20 },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

const quizData = [
  {
    title: 'Soil Health',
    category: 'soil-health',
    xpReward: 100,
    coinReward: 20,
    questions: [
      // EASY
      {
        questionText: 'Organic matter helps soil retain water.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        difficulty: 'easy',
      },
      {
        questionText: 'Earthworms are harmful to soil health.',
        options: ['True', 'False'],
        correctAnswerIndex: 1,
        difficulty: 'easy',
      },
      {
        questionText: 'Which nutrient is represented by "N" in NPK fertilizer?',
        options: ['Nickel', 'Nitrogen', 'Neon', 'Sodium'],
        correctAnswerIndex: 1,
        difficulty: 'easy',
      },
      // MEDIUM
      {
        questionText: 'What is the ideal pH range for most crops?',
        options: ['5.0–5.5', '6.0–7.0', '7.5–8.5', '8.0–9.0'],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      {
        questionText: 'Which of the following improves soil structure the most?',
        options: ['Sand alone', 'Compost and organic matter', 'Chemical fertilizers', 'Plastic mulch'],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      {
        questionText: 'What does "K" represent in NPK fertilizer?',
        options: ['Krypton', 'Potassium', 'Phosphorus', 'Calcium'],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      // HARD
      {
        questionText: 'Which soil type has the highest water-holding capacity?',
        options: ['Sandy soil', 'Loamy soil', 'Clay soil', 'Silty soil'],
        correctAnswerIndex: 2,
        difficulty: 'hard',
      },
      {
        questionText: 'Cation Exchange Capacity (CEC) is a measure of:',
        options: [
          'Soil water content',
          'Soil ability to hold positively charged nutrients',
          'Soil temperature regulation',
          'Soil bacterial activity',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
      {
        questionText: 'Which microorganism is primarily responsible for nitrogen fixation in legume root nodules?',
        options: ['Aspergillus', 'Rhizobium', 'E. coli', 'Trichoderma'],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
    ],
  },
  {
    title: 'Crop Management',
    category: 'crop-management',
    xpReward: 120,
    coinReward: 25,
    questions: [
      // EASY
      {
        questionText: 'Monoculture farming increases pest resistance.',
        options: ['True', 'False'],
        correctAnswerIndex: 1,
        difficulty: 'easy',
      },
      {
        questionText: 'When is the best time to plant rice in most regions?',
        options: ['Winter', 'Summer', 'Monsoon season', 'Autumn'],
        correctAnswerIndex: 2,
        difficulty: 'easy',
      },
      {
        questionText: 'Crop rotation means planting the same crop every season.',
        options: ['True', 'False'],
        correctAnswerIndex: 1,
        difficulty: 'easy',
      },
      // MEDIUM
      {
        questionText: 'What is crop rotation?',
        options: [
          'Planting the same crop repeatedly',
          'Alternating different crops in sequence',
          'Rotating crops during harvest',
          'Moving crops to different fields',
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      {
        questionText: 'Which of these is a Kharif crop in India?',
        options: ['Wheat', 'Mustard', 'Rice', 'Barley'],
        correctAnswerIndex: 2,
        difficulty: 'medium',
      },
      {
        questionText: 'What is the purpose of thinning seedlings?',
        options: [
          'To increase crowding',
          'To remove weaker plants so stronger ones grow better',
          'To add more seeds',
          'To water the soil',
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      // HARD
      {
        questionText: 'Which crop is best suited for intercropping with maize to fix nitrogen?',
        options: ['Sunflower', 'Soybean', 'Sugarcane', 'Cotton'],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
      {
        questionText: 'The critical period of weed competition refers to:',
        options: [
          'Time when weeds grow tallest',
          'Period during which weeds cause maximum yield loss if not controlled',
          'Time when herbicides are applied',
          'Season when weeds produce seeds',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
      {
        questionText: 'Vernalization is the process by which:',
        options: [
          'Seeds are treated with fungicide',
          'Chilling temperatures promote flowering in certain crops',
          'Soil is prepared for planting',
          'Crops are dried after harvest',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
    ],
  },
  {
    title: 'Irrigation & Water',
    category: 'irrigation',
    xpReward: 110,
    coinReward: 22,
    questions: [
      // EASY
      {
        questionText: 'Early morning is the best time to irrigate crops.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        difficulty: 'easy',
      },
      {
        questionText: 'Which irrigation method is most water-efficient?',
        options: ['Flood irrigation', 'Sprinkler irrigation', 'Drip irrigation', 'Furrow irrigation'],
        correctAnswerIndex: 2,
        difficulty: 'easy',
      },
      {
        questionText: 'Plants can survive without any water.',
        options: ['True', 'False'],
        correctAnswerIndex: 1,
        difficulty: 'easy',
      },
      // MEDIUM
      {
        questionText: 'What percentage of soil moisture is ideal for most crops?',
        options: ['10–20%', '30–50%', '60–80%', '90–100%'],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      {
        questionText: 'Which method delivers water directly to the root zone of plants?',
        options: ['Flood irrigation', 'Basin irrigation', 'Drip irrigation', 'Aerial spraying'],
        correctAnswerIndex: 2,
        difficulty: 'medium',
      },
      {
        questionText: 'Over-irrigation can cause which problem?',
        options: ['Better root growth', 'Waterlogging and root rot', 'Higher yield', 'Faster germination'],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      // HARD
      {
        questionText: 'Evapotranspiration (ET) refers to:',
        options: [
          'Water loss through soil cracks',
          'Combined water loss through evaporation and plant transpiration',
          'Rainfall absorption by crops',
          'Water table measurement',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
      {
        questionText: 'Which instrument is used to measure soil moisture tension?',
        options: ['Thermometer', 'Tensiometer', 'Hygrometer', 'Barometer'],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
      {
        questionText: 'Deficit irrigation means:',
        options: [
          'Applying water above crop requirement',
          'Applying less water than full crop demand to save water while limiting yield loss',
          'Irrigating only at night',
          'Using only rainwater',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
    ],
  },
  {
    title: 'Pest Control',
    category: 'pest-control',
    xpReward: 130,
    coinReward: 28,
    questions: [
      // EASY
      {
        questionText: 'Neem oil is an effective organic pesticide.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        difficulty: 'easy',
      },
      {
        questionText: 'Which of these is a beneficial insect for pest control?',
        options: ['Aphid', 'Ladybug', 'Locust', 'Whitefly'],
        correctAnswerIndex: 1,
        difficulty: 'easy',
      },
      {
        questionText: 'Pesticides should be applied without any protective gear.',
        options: ['True', 'False'],
        correctAnswerIndex: 1,
        difficulty: 'easy',
      },
      // MEDIUM
      {
        questionText: 'What is integrated pest management (IPM)?',
        options: [
          'Using only chemical pesticides',
          'Combining multiple pest control strategies',
          'Ignoring pests completely',
          'Using only organic pesticides',
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      {
        questionText: 'Which pest is commonly associated with cotton crops in India?',
        options: ['Brown planthopper', 'Bollworm', 'Stem borer', 'Leaf miner'],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      {
        questionText: 'Biological pest control involves:',
        options: [
          'Spraying chemical insecticides',
          'Using natural predators or parasites to control pests',
          'Burning infected crops',
          'Applying synthetic hormones',
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      // HARD
      {
        questionText: 'Pheromone traps in pest management are used to:',
        options: [
          'Kill insects chemically',
          'Monitor and trap insects using chemical signals',
          'Repel insects with sound',
          'Spray pesticide automatically',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
      {
        questionText: 'Which mechanism causes pesticide resistance in insects?',
        options: [
          'Insects learn to avoid pesticides',
          'Selective survival and reproduction of resistant individuals',
          'Pesticides become weaker over time',
          'Insects migrate to new areas',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
      {
        questionText: 'Bt (Bacillus thuringiensis) is used in agriculture as a:',
        options: [
          'Chemical fungicide',
          'Biological insecticide targeting specific insect larvae',
          'Soil conditioner',
          'Growth hormone',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
    ],
  },
  {
    title: 'Sustainable Farming',
    category: 'sustainable-farming',
    xpReward: 150,
    coinReward: 30,
    questions: [
      // EASY
      {
        questionText: 'Cover crops help prevent soil erosion.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        difficulty: 'easy',
      },
      {
        questionText: 'Agroforestry involves growing trees alongside crops.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        difficulty: 'easy',
      },
      {
        questionText: 'What is the main benefit of composting?',
        options: [
          'It increases soil acidity',
          'It adds nutrients back to the soil',
          'It kills beneficial insects',
          'It reduces water retention',
        ],
        correctAnswerIndex: 1,
        difficulty: 'easy',
      },
      // MEDIUM
      {
        questionText: 'Which farming practice reduces greenhouse gas emissions?',
        options: ['Burning crop residue', 'Using chemical fertilizers only', 'No-till farming', 'Excessive irrigation'],
        correctAnswerIndex: 2,
        difficulty: 'medium',
      },
      {
        questionText: 'What is rainwater harvesting used for in farming?',
        options: [
          'Generating electricity',
          'Storing rainwater for irrigation during dry periods',
          'Cooling farm equipment',
          'Washing pesticide containers',
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium',
      },
      {
        questionText: 'Green manure refers to:',
        options: [
          'Artificial chemical fertilizer',
          'Animal dung mixed with grass',
          'Crops grown and ploughed back into the soil to enrich it',
          'Compost from kitchen waste only',
        ],
        correctAnswerIndex: 2,
        difficulty: 'medium',
      },
      // HARD
      {
        questionText: 'Carbon sequestration in farming refers to:',
        options: [
          'Burning crop waste to release CO2',
          'Capturing and storing atmospheric carbon in soil and plants',
          'Using carbon-based pesticides',
          'Measuring carbon in fertilizers',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
      {
        questionText: 'Which of the following is a principle of permaculture?',
        options: [
          'Maximize chemical input for yield',
          'Monoculture for efficiency',
          'Design systems that mimic natural ecosystems',
          'Eliminate all insects from farms',
        ],
        correctAnswerIndex: 2,
        difficulty: 'hard',
      },
      {
        questionText: 'Biochar when added to soil primarily helps by:',
        options: [
          'Increasing soil acidity',
          'Improving soil structure and long-term carbon storage',
          'Killing soil bacteria',
          'Reducing rainfall absorption',
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
      },
    ],
  },
];

const seedQuizzes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Quiz.deleteMany({});
    console.log('🗑️  Cleared existing quizzes');

    const inserted = await Quiz.insertMany(quizData);
    console.log(`✅ Inserted ${inserted.length} quizzes successfully!`);

    inserted.forEach(q => console.log(`  - ${q.title} (${q.category}) — ID: ${q._id}`));

    await mongoose.disconnect();
    console.log('\n🎉 Quiz seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedQuizzes();
