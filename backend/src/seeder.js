import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./models/Task.js";
import Scheme from "./models/Scheme.js";
import Quiz from "./models/Quiz.js";
import Video from "./models/Video.js";

dotenv.config();

// ─── TASKS ────────────────────────────────────────────
const tasks = [
    {
        title: "Test Soil pH",
        description: "Use a pH testing kit on 3 different sections of your farm.",
        xpReward: 100,
        coinReward: 20,
        category: "Soil Health",
        difficulty: "Easy",
        stageOrder: 1,
        requiresProof: true
    },
    {
        title: "Install Drip Irrigation",
        description: "Set up a basic drip irrigation line for at least one crop row to save water.",
        xpReward: 300,
        coinReward: 50,
        category: "Water Conservation",
        difficulty: "Hard",
        stageOrder: 2,
        requiresProof: true
    }
];

// ─── SCHEMES ──────────────────────────────────────────
const schemes = [
    {
        title: "PM-KISAN Samman Nidhi",
        description: "Direct income support of Rs. 6000 per year to land-holding farmer families in three equal installments of Rs. 2000 each.",
        eligibility: ["Small and marginal farmers", "Must own cultivable land", "Valid Aadhaar card required"],
        state: "National",
        link: "https://pmkisan.gov.in/",
        category: "income-support"
    },
    {
        title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "Crop insurance scheme that provides financial support to farmers suffering crop loss or damage due to unforeseen events like natural calamities, pests and diseases.",
        eligibility: ["All farmers including sharecroppers and tenant farmers", "Growing notified crops in notified areas"],
        state: "National",
        link: "https://pmfby.gov.in/",
        category: "insurance"
    },
    {
        title: "Kisan Credit Card (KCC)",
        description: "Provides farmers with affordable credit for their agricultural operations, post-harvest expenses, and maintenance of farm assets.",
        eligibility: ["All farmers including tenant farmers and sharecroppers", "Age 18-75 years"],
        state: "National",
        link: "https://www.nabard.org/content1.aspx?id=523",
        category: "credit"
    },
    {
        title: "Rashtriya Krishi Vikas Yojana (RKVY)",
        description: "Scheme to incentivize states to increase public investment in agriculture and allied sectors.",
        eligibility: ["Farmer groups", "Agricultural cooperatives", "Agri-entrepreneurs"],
        state: "National",
        link: "https://rkvy.nic.in/",
        category: "development"
    },
    {
        title: "Soil Health Card Scheme",
        description: "Provides soil health cards to farmers which carry crop-wise recommendations of nutrients and fertilizers for individual farms.",
        eligibility: ["All farmers", "No restrictions on land size"],
        state: "National",
        link: "https://soilhealth.dac.gov.in/",
        category: "soil-health"
    },
    {
        title: "Per Drop More Crop (Micro Irrigation)",
        description: "Promotes water efficiency through drip and sprinkler irrigation with up to 55% subsidy on equipment cost.",
        eligibility: ["All farmers with water source access", "Land holding of any size"],
        state: "National",
        link: "https://pmksy.gov.in/",
        category: "irrigation"
    },
    {
        title: "Paramparagat Krishi Vikas Yojana (PKVY)",
        description: "Promotes organic farming to improve soil health and increase income of farmers through premium prices for organic produce.",
        eligibility: ["Farmers willing to convert to organic farming", "Group of minimum 50 farmers with 50 acres of land"],
        state: "National",
        link: "https://pgsindia-ncof.gov.in/pkvy/Index.aspx",
        category: "organic-farming"
    },
    {
        title: "Mahatma Jyotirao Phule Shetkari Karj Mukti Yojana",
        description: "Loan waiver scheme for distressed farmers in Maharashtra covering loans up to Rs. 2 lakh taken from cooperative and nationalized banks.",
        eligibility: ["Maharashtra farmers", "Loan defaulter due to drought or natural calamity", "Annual income below Rs. 1.5 lakh"],
        state: "Maharashtra",
        link: "https://mahafarm.maharashtra.gov.in/",
        category: "credit"
    },
    {
        title: "Gopinath Munde Shetkari Apghat Vima Yojana",
        description: "Accidental insurance scheme for farmers in Maharashtra providing Rs. 2 lakh cover in case of death or permanent disability.",
        eligibility: ["Maharashtra farmers aged 10-75 years", "Registered farmer in state records"],
        state: "Maharashtra",
        link: "https://mahafarm.maharashtra.gov.in/",
        category: "insurance"
    },
    {
        title: "Dr. Panjabrao Deshmukh Organic Farming Mission",
        description: "Maharashtra initiative to promote organic farming with financial assistance for certification, inputs, and market linkage.",
        eligibility: ["Maharashtra farmers", "Minimum 2 acres of cultivable land", "Willing to adopt organic practices for 3 years"],
        state: "Maharashtra",
        link: "https://mahafarm.maharashtra.gov.in/",
        category: "organic-farming"
    },
    {
        title: "Bhausaheb Fundkar Fal Baag Lagwad Yojana",
        description: "Subsidy scheme for establishment of fruit orchards in Maharashtra covering mango, orange, grapes, banana and other fruit crops.",
        eligibility: ["Maharashtra farmers", "Minimum land holding of 0.20 hectare", "Access to irrigation facility"],
        state: "Maharashtra",
        link: "https://mahafarm.maharashtra.gov.in/",
        category: "horticulture"
    },
    {
        title: "Subhiksha Keralam",
        description: "Kerala state initiative to achieve self-sufficiency in agriculture by promoting integrated farming across paddy, vegetables, and allied sectors.",
        eligibility: ["Kerala residents", "Willing to do integrated farming", "Minimum 0.25 acre land"],
        state: "Kerala",
        link: "https://keralaagriculture.gov.in/",
        category: "development"
    },
    {
        title: "Karshaka Samridhi",
        description: "Financial assistance scheme for farmers in Kerala to improve agricultural productivity through modern inputs and techniques.",
        eligibility: ["Small and marginal farmers in Kerala", "Land holding up to 2 hectares", "Registered with local Krishibhavan"],
        state: "Kerala",
        link: "https://keralaagriculture.gov.in/",
        category: "financial-assistance"
    },
    {
        title: "Punjab Kisan Karj Mafi Scheme",
        description: "Debt relief scheme for small and marginal farmers in Punjab with outstanding crop loans from cooperative banks.",
        eligibility: ["Punjab farmers", "Small and marginal land holders", "Cooperative bank loan holders"],
        state: "Punjab",
        link: "https://agripb.gov.in/",
        category: "credit"
    },
    {
        title: "Punjab Diversification to Maize/Basmati",
        description: "Incentive scheme for Punjab farmers to switch from paddy to maize or Basmati rice for water conservation with cash incentive of Rs. 17,500 per acre.",
        eligibility: ["Punjab farmers", "Currently growing Paddy (non-Basmati)", "Minimum 1 acre land"],
        state: "Punjab",
        link: "https://agripb.gov.in/",
        category: "irrigation"
    },
    {
        title: "UP Mukhyamantri Krishak Durghatna Kalyan Yojana",
        description: "Accident compensation scheme for farmers and farm workers in Uttar Pradesh providing up to Rs. 5 lakh on accidental death.",
        eligibility: ["UP farmers and farm workers", "Age 18-70 years", "Registered landowner or tenant farmer"],
        state: "Uttar Pradesh",
        link: "https://upagripardarshi.gov.in/",
        category: "insurance"
    },
    {
        title: "Mukhyamantri Bagayat Vikas Mission",
        description: "Gujarat scheme to develop horticulture clusters with subsidy on seeds, fertilizers and market infrastructure for fruit and vegetable farmers.",
        eligibility: ["Gujarat farmers", "Engaged in horticulture farming", "Minimum 0.5 acres dedicated to horticulture"],
        state: "Gujarat",
        link: "https://agri.gujarat.gov.in/",
        category: "horticulture"
    }
];

// ─── QUIZZES (slug categories, matching frontend) ─────
const quizzes = [
    {
        title: "Soil Health Basics",
        category: "soil-health",
        xpReward: 150,
        coinReward: 25,
        questions: [
            { questionText: "What is the ideal pH range for most crops?", options: ["5.0 - 5.5", "6.0 - 7.0", "7.5 - 8.5", "8.0 - 9.0"], correctAnswerIndex: 1 },
            { questionText: "Organic matter helps soil retain water.", options: ["True", "False"], correctAnswerIndex: 0 },
            { questionText: 'Which nutrient is represented by "N" in NPK fertilizer?', options: ["Nickel", "Nitrogen", "Neon", "Sodium"], correctAnswerIndex: 1 },
            { questionText: "Earthworms are harmful to soil health.", options: ["True", "False"], correctAnswerIndex: 1 }
        ]
    },
    {
        title: "Crop Management",
        category: "crop-management",
        xpReward: 150,
        coinReward: 25,
        questions: [
            { questionText: "What is crop rotation?", options: ["Planting the same crop repeatedly", "Alternating different crops in sequence", "Rotating crops during harvest", "Moving crops to different fields"], correctAnswerIndex: 1 },
            { questionText: "Monocropping reduces pest problems.", options: ["True", "False"], correctAnswerIndex: 1 },
            { questionText: "Which season is best for wheat sowing in India?", options: ["Summer", "Monsoon", "Winter", "Spring"], correctAnswerIndex: 2 }
        ]
    },
    {
        title: "Irrigation & Water",
        category: "irrigation-water",
        xpReward: 150,
        coinReward: 25,
        questions: [
            { questionText: "Which irrigation method is most water-efficient?", options: ["Flood irrigation", "Drip irrigation", "Sprinkler irrigation", "Channel irrigation"], correctAnswerIndex: 1 },
            { questionText: "Overwatering can harm plant roots.", options: ["True", "False"], correctAnswerIndex: 0 },
            { questionText: 'What does the term "water table" refer to?', options: ["Surface water level", "Underground water level", "Rainfall measurement", "Water quality index"], correctAnswerIndex: 1 }
        ]
    },
    {
        title: "Pest Control",
        category: "pest-control",
        xpReward: 150,
        coinReward: 25,
        questions: [
            { questionText: "Which is an example of biological pest control?", options: ["Using chemical pesticides", "Introducing natural predators", "Burning infested crops", "Using herbicides"], correctAnswerIndex: 1 },
            { questionText: "Neem oil is a natural pesticide.", options: ["True", "False"], correctAnswerIndex: 0 },
            { questionText: "What does IPM stand for?", options: ["Integrated Pest Management", "Insect Protection Method", "Internal Plant Monitoring", "Irrigation and Pest Maintenance"], correctAnswerIndex: 0 }
        ]
    }
];

// ─── VIDEOS (Bhoomika's learning hub) ─────────────────
const ytId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/\s]{11})/);
    return match ? match[1] : '';
};

const video = (title, description, category, url, duration, difficulty, instructor, points) => {
    const id = ytId(url);
    return {
        title, description, category,
        videoUrl: url,
        youtubeId: id,
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        duration, difficulty, instructor, points,
        isActive: true,
    };
};

const videos = [
    video('Sustainable Crop Rotation', 'Learn the fundamentals of crop rotation for improved soil health and higher yields.', 'crop-rotation', 'https://youtu.be/vkYEmC5xDDE', '8 min', 'beginner', 'Dr. Rajesh Kumar', 120),
    video('Smart Irrigation Techniques', 'Master modern irrigation methods including drip and sprinkler systems.', 'irrigation', 'https://youtu.be/Ulf8E1XnhgI?si=kcKeWtqh2zQNXCt-', '12 min', 'intermediate', 'Dr. Priya Sharma', 150),
    video('Organic Pest Management', 'Natural and eco-friendly methods to protect your crops from pests using companion planting and neem-based sprays.', 'pest-control', 'https://youtu.be/-K80djZC8y0?si=jk_Wi3gvTW2q8PGC', '15 min', 'intermediate', 'Prof. Amit Patel', 180),
    video('Soil Testing & Analysis', 'Understanding soil composition and nutrient levels. Learn how to collect samples and read test results.', 'soil-health', 'https://youtu.be/L6EtmGMJflI?si=jeh8d6-NKan4hgSn', '10 min', 'beginner', 'Dr. Sunita Verma', 130),
    video('Seasonal Crop Planning', 'Plan your crops according to Kharif, Rabi, and Zaid seasons.', 'crop-management', 'https://youtu.be/d-5jeEgP1BM?si=rFzzjR35EC-zYWsL', '14 min', 'intermediate', 'Mr. Ravi Thakur', 160),
    video('Water Conservation Methods', 'Save water with rainwater harvesting, farm ponds, and efficient storage techniques.', 'water-management', 'https://youtu.be/gJmY3dzg3Gk?si=54gGQCPLpyQ7kdz3', '11 min', 'beginner', 'Dr. Meera Singh', 140),
    video('Advanced Fertilizer Application', 'NPK ratios, micronutrients, and precision fertilizer application.', 'soil-health', 'https://youtu.be/JHXKiUUMdL8?si=yhx6uLjWXK61SvFp', '16 min', 'advanced', 'Prof. Anil Desai', 200),
    video('Climate-Smart Agriculture', 'Adapt your farming practices to changing climate conditions.', 'sustainability', 'https://youtu.be/_92sTa6Ge5I?si=gZb9tbRCnjIC7tUa', '13 min', 'advanced', 'Dr. Kavita Joshi', 190),
    video('Integrated Farming Systems', 'Combine crop cultivation with livestock, fishery, or horticulture for higher income.', 'crop-management', 'https://youtu.be/tIqvxD7ao74?si=XPmdBhfCxxORCKgg', '18 min', 'intermediate', 'Dr. Suresh Nair', 175),
    video('Post-Harvest Storage Techniques', 'Reduce post-harvest losses with proper storage, drying, and grading techniques.', 'post-harvest', 'https://youtu.be/CaieNzMxO4M?si=b1uMDaq98c4rE8lL', '9 min', 'beginner', 'Ms. Anita Rao', 110),
    video('Vermicomposting at Home', 'Turn farm waste into rich organic manure using earthworms.', 'organic-farming', 'https://youtu.be/zKnacCj7lXw?si=9TlUbeZFLG5kba0E', '7 min', 'beginner', 'Mr. Prakash Iyer', 100),
    video('Greenhouse Farming Basics', 'Introduction to protected cultivation — polyhouse setup, ventilation, and temperature control.', 'crop-management', 'https://youtu.be/RTMIyPiqTYE?si=olGp83xBChfP8neW', '20 min', 'advanced', 'Dr. Ramesh Gupta', 220),
];

// ─── IMPORT ───────────────────────────────────────────
const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding...");

        await Task.deleteMany();
        await Scheme.deleteMany();
        await Quiz.deleteMany();
        await Video.deleteMany();
        console.log("Old data cleared.");

        await Task.insertMany(tasks);
        await Scheme.insertMany(schemes);
        await Quiz.insertMany(quizzes);
        await Video.insertMany(videos);

        console.log(`\n✅ Data successfully seeded!`);
        console.log(`   📋 ${tasks.length} tasks`);
        console.log(`   🏛️  ${schemes.length} schemes`);
        console.log(`   ❓ ${quizzes.length} quizzes`);
        console.log(`   📹 ${videos.length} videos`);
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

importData();