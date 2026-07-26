import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./models/Task.js";

dotenv.config();

const tasks = [
  // ====================== INITIAL TASKS ======================
  {
    title: "Inspect Crops for Pests",
    description: "Walk through your field and inspect crops for early pest infestation.",
    xpReward: 30,
    coinReward: 10,
    category: "Pest Control",
    difficulty: "Easy",
    estimatedTime: 10,
    season: ["Kharif", "Rabi"],
    cropTypes: ["Rice", "Wheat", "Cotton", "Tomato"],
    states: ["Maharashtra", "Punjab", "Gujarat"],
    skillLevel: "Beginner",
    repeatType: "Daily",
    requiresProof: true,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef"
  },

  {
    title: "Check Soil Moisture",
    description: "Measure soil moisture before irrigating your crops.",
    xpReward: 25,
    coinReward: 8,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 8,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Daily",
    requiresProof: false,
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399"
  },

  {
    title: "Use Organic Fertilizer",
    description: "Apply compost or organic fertilizer to improve soil health.",
    xpReward: 60,
    coinReward: 20,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 25,
    season: ["Kharif"],
    cropTypes: ["Vegetables", "Fruits"],
    states: ["All"],
    skillLevel: "Intermediate",
    repeatType: "Weekly",
    requiresProof: true,
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735"
  },

  {
    title: "Clean Irrigation Channels",
    description: "Remove weeds and debris from irrigation channels.",
    xpReward: 50,
    coinReward: 15,
    category: "Water Conservation",
    difficulty: "Medium",
    estimatedTime: 20,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Weekly",
    requiresProof: true,
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
  },

  {
    title: "Record Farm Weather",
    description: "Record today's weather conditions in the app.",
    xpReward: 20,
    coinReward: 5,
    category: "General",
    difficulty: "Easy",
    estimatedTime: 5,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Daily",
    requiresProof: false,
    image: "https://images.unsplash.com/photo-1498928715928-e47e0267b78f"
  },

  // ====================== SOIL HEALTH ======================

  {
    title: "Apply Organic Compost",
    description: "Spread organic compost evenly across your field.",
    xpReward: 50,
    coinReward: 20,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 25,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Weekly",
    requiresProof: true,
    image: ""
  },

  {
    title: "Test Soil pH",
    description: "Measure soil pH using a testing kit.",
    xpReward: 60,
    coinReward: 25,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 20,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Intermediate",
    repeatType: "Monthly",
    requiresProof: true,
    image: ""
  },

  {
    title: "Loosen Topsoil",
    description: "Break hardened soil to improve aeration.",
    xpReward: 35,
    coinReward: 12,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 15,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Weekly",
    requiresProof: false,
    image: ""
  },

  {
    title: "Remove Field Stones",
    description: "Clear stones and debris from the cultivation area.",
    xpReward: 25,
    coinReward: 10,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 20,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "One-Time",
    requiresProof: false,
    image: ""
  },

  {
    title: "Add Vermicompost",
    description: "Apply vermicompost around crop roots.",
    xpReward: 55,
    coinReward: 22,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 20,
    season: ["All"],
    cropTypes: ["Vegetables", "Fruits"],
    states: ["All"],
    skillLevel: "Intermediate",
    repeatType: "Weekly",
    requiresProof: true,
    image: ""
  },

  {
    title: "Prepare Compost Pit",
    description: "Build or maintain your compost pit.",
    xpReward: 70,
    coinReward: 30,
    category: "Soil Health",
    difficulty: "Hard",
    estimatedTime: 45,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Advanced",
    repeatType: "One-Time",
    requiresProof: true,
    image: ""
  },

  {
    title: "Inspect Soil Texture",
    description: "Check whether soil is sandy, clayey or loamy.",
    xpReward: 30,
    coinReward: 12,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 10,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Monthly",
    requiresProof: false,
    image: ""
  },

  {
    title: "Apply Mulch",
    description: "Cover soil with mulch to retain moisture.",
    xpReward: 50,
    coinReward: 18,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 25,
    season: ["Summer"],
    cropTypes: ["Vegetables", "Fruits"],
    states: ["All"],
    skillLevel: "Intermediate",
    repeatType: "Weekly",
    requiresProof: true,
    image: ""
  },

  {
    title: "Inspect Soil Erosion",
    description: "Look for signs of soil erosion after rainfall.",
    xpReward: 35,
    coinReward: 15,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 10,
    season: ["Monsoon"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Weekly",
    requiresProof: false,
    image: ""
  },

  {
    title: "Collect Soil Sample",
    description: "Collect soil samples for laboratory testing.",
    xpReward: 45,
    coinReward: 18,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 20,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Intermediate",
    repeatType: "Monthly",
    requiresProof: true,
    image: ""
  },

  {
    title: "Check Earthworm Activity",
    description: "Observe earthworm presence as a sign of healthy soil.",
    xpReward: 25,
    coinReward: 10,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 10,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Weekly",
    requiresProof: false,
    image: ""
  },

  {
    title: "Mix Green Manure",
    description: "Incorporate green manure into the soil.",
    xpReward: 60,
    coinReward: 22,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 30,
    season: ["Kharif"],
    cropTypes: ["Rice", "Sugarcane"],
    states: ["All"],
    skillLevel: "Intermediate",
    repeatType: "Seasonal",
    requiresProof: true,
    image: ""
  },

  {
    title: "Remove Weeds",
    description: "Remove weeds competing for soil nutrients.",
    xpReward: 35,
    coinReward: 15,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 20,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Daily",
    requiresProof: true,
    image: ""
  },

  {
    title: "Apply Biofertilizer",
    description: "Use biofertilizer to improve nutrient availability.",
    xpReward: 55,
    coinReward: 20,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 20,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Intermediate",
    repeatType: "Monthly",
    requiresProof: true,
    image: ""
  },

  {
    title: "Check Soil Temperature",
    description: "Measure soil temperature before sowing.",
    xpReward: 30,
    coinReward: 12,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 8,
    season: ["Winter", "Summer"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Daily",
    requiresProof: false,
    image: ""
  },

  {
    title: "Prepare Raised Beds",
    description: "Create raised beds for better drainage.",
    xpReward: 60,
    coinReward: 25,
    category: "Soil Health",
    difficulty: "Hard",
    estimatedTime: 40,
    season: ["All"],
    cropTypes: ["Vegetables"],
    states: ["All"],
    skillLevel: "Advanced",
    repeatType: "One-Time",
    requiresProof: true,
    image: ""
  },

  {
    title: "Monitor Nutrient Deficiency",
    description: "Inspect crops for symptoms of nutrient deficiency.",
    xpReward: 45,
    coinReward: 18,
    category: "Soil Health",
    difficulty: "Medium",
    estimatedTime: 15,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Intermediate",
    repeatType: "Weekly",
    requiresProof: false,
    image: ""
  },

  {
    title: "Level the Field",
    description: "Ensure the field is level for uniform irrigation.",
    xpReward: 70,
    coinReward: 30,
    category: "Soil Health",
    difficulty: "Hard",
    estimatedTime: 45,
    season: ["Before Sowing"],
    cropTypes: ["Rice", "Wheat"],
    states: ["All"],
    skillLevel: "Advanced",
    repeatType: "Seasonal",
    requiresProof: true,
    image: ""
  },

  {
    title: "Maintain Soil Health Log",
    description: "Record today's soil observations in the app.",
    xpReward: 20,
    coinReward: 8,
    category: "Soil Health",
    difficulty: "Easy",
    estimatedTime: 5,
    season: ["All"],
    cropTypes: ["All"],
    states: ["All"],
    skillLevel: "Beginner",
    repeatType: "Daily",
    requiresProof: false,
    image: ""
  }
];

const seedTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Remove old tasks
    await Task.deleteMany();

    console.log("🗑 Old tasks removed");

    // Insert new tasks
    await Task.insertMany(tasks);

    console.log(`🌱 Successfully inserted ${tasks.length} tasks`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding tasks:", error);
    process.exit(1);
  }
};

seedTasks();