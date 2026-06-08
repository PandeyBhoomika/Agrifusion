import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./models/Task.js";
import Scheme from "./models/Scheme.js";
import Quiz from "./models/Quiz.js";
import Video from "./models/Video.js";

// Load env variables to get the MONGO_URI
dotenv.config();

// The Sample Data
const tasks = [
    {
        title: "Test Soil pH",
        description: "Use a pH testing kit on 3 different sections of your farm.",
        xpReward: 100,
        coinReward: 20,
        category: "Soil Health",
        difficulty: "Easy"
    },
    {
        title: "Install Drip Irrigation",
        description: "Set up a basic drip irrigation line for at least one crop row to save water.",
        xpReward: 300,
        coinReward: 50,
        category: "Water Conservation",
        difficulty: "Hard"
    }
];

const schemes = [
    {
        title: "PM-KISAN Samman Nidhi",
        description: "Financial benefit of Rs. 6000 per year given to eligible farmer families.",
        eligibility: ["Small and marginal farmers", "Must own cultivable land"],
        state: "National",
        link: "https://pmkisan.gov.in/"
    },
    {
        title: "Subhiksha Keralam",
        description: "Kerala state initiative to achieve self-sufficiency in agriculture.",
        eligibility: ["Kerala resident", "Willing to do integrated farming"],
        state: "Kerala",
        link: "https://keralaagriculture.gov.in/"
    }
];

const quizzes = [
    {
        title: "Soil Health Basics",
        category: "Soil Health",
        xpReward: 150,
        coinReward: 25,
        questions: [
            {
                questionText: "What is the ideal soil pH for most vegetables?",
                options: ["4.0 - 5.0", "6.0 - 7.0", "8.0 - 9.0", "10+"],
                correctAnswerIndex: 1
            },
            {
                questionText: "Which nutrient is responsible for green, leafy growth?",
                options: ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)", "Calcium"],
                correctAnswerIndex: 0
            }
        ]
    }
];

// The Insertion Logic
const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding...");

        // Clear out existing data (Optional, but prevents duplicates during testing)
        await Task.deleteMany();
        await Scheme.deleteMany();
        await Quiz.deleteMany();
        console.log("Old data cleared.");

        // Insert the new data
        await Task.insertMany(tasks);
        await Scheme.insertMany(schemes);
        await Quiz.insertMany(quizzes);

        console.log("✅ Data successfully seeded!");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

// Run the function
importData();