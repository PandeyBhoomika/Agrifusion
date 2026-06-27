import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./models/Task.js";
import Scheme from "./models/Scheme.js";
import Quiz from "./models/Quiz.js";
import Video from "./models/Video.js";

dotenv.config();

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

// ─────────────────────────────────────────────────────────────────────────────
// REPLACE THE URLs BELOW with real YouTube links you find yourself.
// How to find working videos:
//   1. Go to youtube.com
//   2. Search the topic shown in the comment
//   3. Open any video, copy its URL
//   4. Paste it below
//
// Make sure the video is:
//   ✅ Public (not unlisted)
//   ✅ NOT age-restricted
//   ✅ NOT "Made for Kids"
//   ✅ Has embedding allowed (most do)
// ─────────────────────────────────────────────────────────────────────────────

const videos = [
    video(
        'Sustainable Crop Rotation',
        'Learn the fundamentals of crop rotation for improved soil health and higher yields.',
        'crop-rotation',
        'https://youtu.be/vkYEmC5xDDE',
        '8 min', 'beginner', 'Dr. Rajesh Kumar', 120
    ),
    video(
        'Smart Irrigation Techniques',
        'Master modern irrigation methods including drip and sprinkler systems.',
        'irrigation',
        'https://youtu.be/Ulf8E1XnhgI?si=kcKeWtqh2zQNXCt-',
        '12 min', 'intermediate', 'Dr. Priya Sharma', 150
    ),
    video(
        'Organic Pest Management',
        'Natural and eco-friendly methods to protect your crops from pests using companion planting and neem-based sprays.',
        'pest-control',
        'https://youtu.be/-K80djZC8y0?si=jk_Wi3gvTW2q8PGC',
        '15 min', 'intermediate', 'Prof. Amit Patel', 180
    ),
    video(
        'Soil Testing & Analysis',
        'Understanding soil composition and nutrient levels. Learn how to collect samples and read test results.',
        'soil-health',
        'https://youtu.be/L6EtmGMJflI?si=jeh8d6-NKan4hgSn',
        '10 min', 'beginner', 'Dr. Sunita Verma', 130
    ),
    video(
        'Seasonal Crop Planning',
        'Plan your crops according to Kharif, Rabi, and Zaid seasons.',
        'crop-management',
        'https://youtu.be/d-5jeEgP1BM?si=rFzzjR35EC-zYWsL',
        '14 min', 'intermediate', 'Mr. Ravi Thakur', 160
    ),
    video(
        'Water Conservation Methods',
        'Save water with rainwater harvesting, farm ponds, and efficient storage techniques.',
        'water-management',
        'https://youtu.be/gJmY3dzg3Gk?si=54gGQCPLpyQ7kdz3',
        '11 min', 'beginner', 'Dr. Meera Singh', 140
    ),
    video(
        'Advanced Fertilizer Application',
        'NPK ratios, micronutrients, and precision fertilizer application.',
        'soil-health',
        'https://youtu.be/JHXKiUUMdL8?si=yhx6uLjWXK61SvFp',
        '16 min', 'advanced', 'Prof. Anil Desai', 200
    ),
    video(
        'Climate-Smart Agriculture',
        'Adapt your farming practices to changing climate conditions.',
        'sustainability',
        'https://youtu.be/_92sTa6Ge5I?si=gZb9tbRCnjIC7tUa',
        '13 min', 'advanced', 'Dr. Kavita Joshi', 190
    ),
    video(
        'Integrated Farming Systems',
        'Combine crop cultivation with livestock, fishery, or horticulture for higher income.',
        'crop-management',
        'https://youtu.be/tIqvxD7ao74?si=XPmdBhfCxxORCKgg',
        '18 min', 'intermediate', 'Dr. Suresh Nair', 175
    ),
    video(
        'Post-Harvest Storage Techniques',
        'Reduce post-harvest losses with proper storage, drying, and grading techniques.',
        'post-harvest',
        'https://youtu.be/CaieNzMxO4M?si=b1uMDaq98c4rE8lL',
        '9 min', 'beginner', 'Ms. Anita Rao', 110
    ),
    video(
        'Vermicomposting at Home',
        'Turn farm waste into rich organic manure using earthworms.',
        'organic-farming',
        'https://youtu.be/zKnacCj7lXw?si=9TlUbeZFLG5kba0E',
        '7 min', 'beginner', 'Mr. Prakash Iyer', 100
    ),
    video(
        'Greenhouse Farming Basics',
        'Introduction to protected cultivation — polyhouse setup, ventilation, and temperature control.',
        'crop-management',
        'https://youtu.be/RTMIyPiqTYE?si=olGp83xBChfP8neW',
        '20 min', 'advanced', 'Dr. Ramesh Gupta', 220
    ),
];

// ─── Validation — warns you about any unfilled placeholders before seeding ────
const unfilled = videos.filter(v => v.youtubeId === 'REPLACE_ME' || !v.youtubeId || v.videoUrl.includes('REPLACE_ME'));
if (unfilled.length > 0) {
    console.warn(`\n⚠️  ${unfilled.length} video(s) still have placeholder URLs:`);
    unfilled.forEach(v => console.warn(`   ❌ ${v.title}`));
    console.warn('\n   Open seeder.js, find the REPLACE_ME entries above, and paste real YouTube URLs.\n');
}

const tasks = [
    { title: "Test Soil pH", description: "Use a pH testing kit on 3 different sections of your farm.", xpReward: 100, coinReward: 20, category: "Soil Health", difficulty: "Easy" },
    { title: "Install Drip Irrigation", description: "Set up a basic drip irrigation line for at least one crop row to save water.", xpReward: 300, coinReward: 50, category: "Water Conservation", difficulty: "Hard" },
];

const quizzes = [
    {
        title: "Soil Health Basics", category: "Soil Health", xpReward: 150, coinReward: 25,
        questions: [
            { questionText: "What is the ideal soil pH for most vegetables?", options: ["4.0 - 5.0", "6.0 - 7.0", "8.0 - 9.0", "10+"], correctAnswerIndex: 1 },
            { questionText: "Which nutrient is responsible for green, leafy growth?", options: ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)", "Calcium"], correctAnswerIndex: 0 }
        ]
    }
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding...");

        await Task.deleteMany();
        await Quiz.deleteMany();
        await Video.deleteMany();
        console.log("Old data cleared.");

        await Task.insertMany(tasks);
        await Quiz.insertMany(quizzes);
        await Video.insertMany(videos);

        const filled = videos.filter(v => !v.videoUrl.includes('REPLACE_ME'));
        const skipped = videos.filter(v => v.videoUrl.includes('REPLACE_ME'));

        console.log(`\n✅ Seeded successfully!`);
        console.log(`   📹 ${filled.length} videos with real URLs`);
        if (skipped.length) console.log(`   ⚠️  ${skipped.length} videos still need real URLs`);
        filled.forEach(v => console.log(`      ✅ ${v.title} [${v.youtubeId}]`));
        skipped.forEach(v => console.log(`      ❌ ${v.title} [needs URL]`));
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

importData();
