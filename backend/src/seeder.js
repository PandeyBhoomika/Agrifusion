import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./models/Task.js";
import Scheme from "./models/Scheme.js";
import Quiz from "./models/Quiz.js";
import Video from "./models/Video.js";

dotenv.config();

const tasks = [
    // ── UNIVERSAL STAGES (shown in every crop's chain, stages 1-4) ──────
    {
        title: "Test Soil pH",
        description: "Use a pH testing kit on 3 different sections of your farm.",
        xpReward: 100,
        coinReward: 20,
        category: "Soil Health",
        difficulty: "Easy",
        stage: "Soil Test",
        stageOrder: 1,
        cropTypes: [],
        requiresProof: true
    },
    {
        title: "Prepare the Land",
        description: "Plough and level the field, clearing debris and weeds before sowing.",
        xpReward: 150,
        coinReward: 25,
        category: "Soil Health",
        difficulty: "Medium",
        stage: "Land Preparation",
        stageOrder: 2,
        cropTypes: [],
        requiresProof: true
    },
    {
        title: "Sow the Seeds",
        description: "Sow seeds at the recommended spacing and depth for your chosen crop.",
        xpReward: 200,
        coinReward: 30,
        category: "Crop Management",
        difficulty: "Medium",
        stage: "Sowing",
        stageOrder: 3,
        cropTypes: [],
        requiresProof: true
    },
    {
        title: "Install Drip Irrigation",
        description: "Set up a basic drip irrigation line for at least one crop row to save water.",
        xpReward: 300,
        coinReward: 50,
        category: "Water Conservation",
        difficulty: "Hard",
        stage: "First Irrigation",
        stageOrder: 4,
        cropTypes: [],
        requiresProof: true
    },

    // ── WHEAT-SPECIFIC STAGES (stages 5-7) ───────────────────────────
    {
        title: "Apply Fertilizer",
        description: "Apply the recommended NPK fertilizer mix for your wheat crop.",
        xpReward: 200,
        coinReward: 35,
        category: "Soil Health",
        difficulty: "Medium",
        stage: "Fertilizing",
        stageOrder: 5,
        cropTypes: ["Wheat"],
        requiresProof: true
    },
    {
        title: "Weed the Field",
        description: "Remove weeds competing with your wheat crop for nutrients and water.",
        xpReward: 150,
        coinReward: 25,
        category: "Crop Management",
        difficulty: "Easy",
        stage: "Weeding",
        stageOrder: 6,
        cropTypes: ["Wheat"],
        requiresProof: true
    },
    {
        title: "Harvest Wheat",
        description: "Harvest the wheat crop once grains have fully matured and dried.",
        xpReward: 400,
        coinReward: 75,
        category: "Crop Management",
        difficulty: "Hard",
        stage: "Harvest",
        stageOrder: 7,
        cropTypes: ["Wheat"],
        requiresProof: true
    },

    // ── RICE-SPECIFIC STAGES (stages 5-7) ────────────────────────────
    {
        title: "Transplant Seedlings",
        description: "Transplant rice seedlings from the nursery bed into the main flooded field.",
        xpReward: 250,
        coinReward: 40,
        category: "Crop Management",
        difficulty: "Medium",
        stage: "Transplanting",
        stageOrder: 5,
        cropTypes: ["Rice"],
        requiresProof: true
    },
    {
        title: "Pest Control Check",
        description: "Inspect for common rice pests (stem borer, leaf folder) and apply control measures if needed.",
        xpReward: 200,
        coinReward: 35,
        category: "Pest Control",
        difficulty: "Medium",
        stage: "Pest Control",
        stageOrder: 6,
        cropTypes: ["Rice"],
        requiresProof: true
    },
    {
        title: "Harvest Rice",
        description: "Harvest the rice crop once grains have reached full maturity.",
        xpReward: 400,
        coinReward: 75,
        category: "Crop Management",
        difficulty: "Hard",
        stage: "Harvest",
        stageOrder: 7,
        cropTypes: ["Rice"],
        requiresProof: true
    },

    // ── MAIZE-SPECIFIC STAGES (stages 5-7) ───────────────────────────
    {
        title: "Apply Fertilizer",
        description: "Apply the recommended fertilizer dose for your maize crop at the right growth stage.",
        xpReward: 200,
        coinReward: 35,
        category: "Soil Health",
        difficulty: "Medium",
        stage: "Fertilizing",
        stageOrder: 5,
        cropTypes: ["Maize"],
        requiresProof: true
    },
    {
        title: "Pest Control Check",
        description: "Inspect for fall armyworm and other common maize pests, and treat if necessary.",
        xpReward: 200,
        coinReward: 35,
        category: "Pest Control",
        difficulty: "Medium",
        stage: "Pest Control",
        stageOrder: 6,
        cropTypes: ["Maize"],
        requiresProof: true
    },
    {
        title: "Harvest Maize",
        description: "Harvest maize cobs once kernels have hardened and husks have dried.",
        xpReward: 400,
        coinReward: 75,
        category: "Crop Management",
        difficulty: "Hard",
        stage: "Harvest",
        stageOrder: 7,
        cropTypes: ["Maize"],
        requiresProof: true
    },

    // ── COTTON-SPECIFIC STAGES (stages 5-7) ──────────────────────────
    {
        title: "Pest Control Check",
        description: "Inspect for bollworm and whitefly infestation on your cotton crop and treat if necessary.",
        xpReward: 200,
        coinReward: 35,
        category: "Pest Control",
        difficulty: "Medium",
        stage: "Pest Control",
        stageOrder: 5,
        cropTypes: ["Cotton"],
        requiresProof: true
    },
    {
        title: "Prune the Plants",
        description: "Prune excess vegetative growth to encourage boll development on your cotton crop.",
        xpReward: 200,
        coinReward: 35,
        category: "Crop Management",
        difficulty: "Medium",
        stage: "Pruning",
        stageOrder: 6,
        cropTypes: ["Cotton"],
        requiresProof: true
    },
    {
        title: "Harvest Cotton",
        description: "Pick cotton bolls once they have fully opened and fibers are dry and fluffy.",
        xpReward: 400,
        coinReward: 75,
        category: "Crop Management",
        difficulty: "Hard",
        stage: "Harvest",
        stageOrder: 7,
        cropTypes: ["Cotton"],
        requiresProof: true
    },
];

const schemes = [
    // ── NATIONAL SCHEMES ──────────────────────────────
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

    // ── MAHARASHTRA SCHEMES ───────────────────────────
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

    // ── KERALA SCHEMES ────────────────────────────────
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

    // ── PUNJAB SCHEMES ────────────────────────────────
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

    // ── UTTAR PRADESH SCHEMES ─────────────────────────
    {
        title: "UP Mukhyamantri Krishak Durghatna Kalyan Yojana",
        description: "Accident compensation scheme for farmers and farm workers in Uttar Pradesh providing up to Rs. 5 lakh on accidental death.",
        eligibility: ["UP farmers and farm workers", "Age 18-70 years", "Registered landowner or tenant farmer"],
        state: "Uttar Pradesh",
        link: "https://upagripardarshi.gov.in/",
        category: "insurance"
    },

    // ── GUJARAT SCHEMES ───────────────────────────────
    {
        title: "Mukhyamantri Bagayat Vikas Mission",
        description: "Gujarat scheme to develop horticulture clusters with subsidy on seeds, fertilizers and market infrastructure for fruit and vegetable farmers.",
        eligibility: ["Gujarat farmers", "Engaged in horticulture farming", "Minimum 0.5 acres dedicated to horticulture"],
        state: "Gujarat",
        link: "https://agri.gujarat.gov.in/",
        category: "horticulture"
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

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding...");

        // Tasks use upsert instead of delete+insert so existing _ids are
        // preserved — UserCropTask rows reference these _ids, and deleting
        // Tasks would break all existing user progress chains.
        await Scheme.deleteMany();
        await Quiz.deleteMany();
        console.log("Old data cleared.");

        for (const task of tasks) {
            await Task.updateOne(
                { title: task.title, cropTypes: task.cropTypes },
                { $set: task },
                { upsert: true }
            );
        }
        await Scheme.insertMany(schemes);
        await Quiz.insertMany(quizzes);

        console.log(`✅ Data successfully seeded! (${schemes.length} schemes added)`);
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

importData();
