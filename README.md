<div align="center">

# 🌾 AgriFusion

### Empowering Farmers Through Technology

**A gamified React Native app that helps Indian farmers adopt sustainable farming practices through smart task management, AI-powered insights, and community-driven learning.**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-black?logo=expo)](https://expo.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)](https://mongodb.com)
[![SIH 2025](https://img.shields.io/badge/SIH-2025-orange)](https://sih.gov.in)

</div>

---

## 📱 About AgriFusion

AgriFusion is a mobile-first platform built for **Smart India Hackathon 2025** that bridges the gap between traditional farming and modern technology. By gamifying sustainable agriculture, it motivates farmers to adopt eco-friendly practices through XP points, green coins, badges, and weekly mission challenges — all while providing real-time weather data, government scheme discovery, and peer-to-peer community learning.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌤️ **Smart Dashboard** | Live weather integration via WeatherAPI with agricultural suitability score, farm health snapshot, and XP progress tracking |
| ✅ **Weekly Tasks** | Gamified sustainable farming missions with difficulty levels, XP/coin rewards, and proof submission |
| 📸 **Proof Submission** | Camera, GPS location, and audio recording to validate completed farming tasks |
| 🏆 **Rewards & Gamification** | XP points, Green Coins, badges, level progression (Eco Farmer tiers), and streak tracking |
| 📚 **Learning Hub** | Categorised farming video tutorials with search, filters, and progress tracking |
| 🧠 **Quiz System** | Knowledge quizzes by category with real-time scoring and XP rewards |
| 👥 **Community** | Social feed for farmers to share tips, success stories, and join challenges with like & comment support |
| 🌱 **Virtual Farm** | Interactive 10×8 crop grid with health indicators, AI-powered crop tips, and visual farm management |
| 🏛️ **Government Schemes** | Discover active central and state-level schemes (PM-KISAN, Karshaka Samridhi, Subhiksha Keralam etc.) with eligibility and application links |
| 🔐 **Secure Auth** | Email OTP verification, JWT sessions, and bcrypt password hashing |
| 🌍 **Multi-language** | Language selection screen supporting 10 Indian regional languages |
| 🎮 **Mini Games** | Crop Rotation and Farm Day simulation games for learning through play |
| 👨‍🌾 **Farm Profile Setup** | Personalised 3-step onboarding with GPS location detection, primary crop selection, soil type, water source, farming goals, and skill level |

---

## 🏗️ Project Structure

```
Agrifusion/
├── Diya/                          # React Native Frontend (Expo)
│   ├── app/
│   │   ├── (tabs)/                # Bottom tab screens
│   │   │   ├── dashboard.tsx      # Smart dashboard with live weather
│   │   │   ├── tasks.tsx          # Weekly farming missions
│   │   │   ├── learninghub.tsx    # Video learning center
│   │   │   ├── communitydashboard.tsx  # Social feed
│   │   │   ├── virtualfarm.tsx    # Interactive farm grid
│   │   │   └── proof-submission.tsx   # Camera + GPS proof upload
│   │   ├── games/                 # Mini games
│   │   │   ├── index.tsx          # Games menu
│   │   │   ├── crop-rotation.tsx  # Crop rotation game
│   │   │   └── farm-day.tsx       # Farm simulation game
│   │   ├── splash.tsx             # Animated splash screen
│   │   ├── language.tsx           # Language selection
│   │   ├── auth.tsx               # Login / Sign up
│   │   ├── otp-verification.tsx   # 6-box OTP input
│   │   ├── farm-profile.tsx       # 3-step farm onboarding
│   │   ├── rewards/index.tsx      # XP, coins & badges
│   │   ├── quiz.tsx               # Quiz system
│   │   └── schemes.tsx            # Government schemes browser
│   ├── services/                  # API service layer
│   │   ├── authService.ts
│   │   ├── videoService.ts
│   │   ├── quizService.ts
│   │   ├── schemeService.ts
│   │   └── profileService.ts
│   ├── data/                      # Mock data fallbacks
│   └── assets/                    # Images, icons, Lottie animations
│
└── backend/                       # Node.js + Express Backend
    └── src/
        ├── app.js                 # Express server entry
        ├── models/                # 7 Mongoose models
        ├── controllers/           # 8 feature controllers
        ├── routes/                # 8 route groups
        ├── middleware/            # JWT auth middleware
        └── seeder.js              # Database seed script
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.81.5 | Mobile app framework |
| Expo SDK | 54 | Development platform |
| expo-router | v6 | File-based navigation |
| TypeScript | — | Type safety |
| react-native-reanimated | 4.1.1 | Smooth animations |
| expo-linear-gradient | 15.0.7 | Gradient backgrounds |
| expo-location | 19.0.8 | GPS & reverse geocoding |
| expo-image-picker | 17.0.9 | Camera & gallery access |
| expo-av | 16.0.8 | Audio recording |
| @expo/vector-icons | 15.0.3 | Icon library |
| AsyncStorage | 2.2.0 | Local storage |
| react-native-svg | 15.12.1 | SVG graphics |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js + Express | 4.18.2 | REST API server |
| MongoDB + Mongoose | 7.3.1 | Database & ODM |
| JSON Web Token | 9.0.0 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Nodemailer | 6.9.3 | OTP email delivery |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

---

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Then edit .env with your values (see Environment Variables section below)

# 4. Start the server
npm run dev
```

You should see:
```
🚀 Server running on port 4000
✅ MongoDB connected
```

**Seed the database with sample data:**
```bash
node src/seeder.js
# You will see: ✅ Data Imported!
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd Diya

# 2. Install dependencies
npm install

# 3. Create environment file
# Create a file called .env in the Diya/ folder:
```

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:4000/api
EXPO_PUBLIC_WEATHER_API_KEY=your_weatherapi_key
```

> **Find your computer IP:** Run `ipconfig` in Windows CMD → look for **IPv4 Address** (e.g. `192.168.1.45`)

```bash
# 4. Start Expo
npx expo start --clear

# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Scan QR code with Expo Go app on your physical phone
```

---

## 🔑 Environment Variables

### `backend/.env`

```env
MONGO_URI=mongodb://127.0.0.1:27017/agrifusion
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password
JWT_SECRET=your_random_secret_key_here
OTP_EXPIRY_MINUTES=5
PORT=4000
```

> ⚠️ **Never commit `.env` to GitHub.** It is already listed in `.gitignore`.

### `Diya/.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000/api
EXPO_PUBLIC_WEATHER_API_KEY=your_weatherapi_com_key
```

---

## 📡 API Reference

**Base URL:** `http://localhost:4000/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | Send OTP to email |
| POST | `/auth/verify-otp` | Verify OTP → returns JWT |
| POST | `/auth/login` | Login with email + password |

### User Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/user/profile` | ✅ | Save / update farm profile |
| GET | `/user/profile` | ✅ | Get user profile + XP/level |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all weekly tasks |
| POST | `/tasks` | Create a new task |
| POST | `/tasks/:id/complete` | Mark task done → awards XP + coins |

### Proof Submission
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/proofs/submit` | Submit proof for a task |
| GET | `/proofs/pending` | Get all pending proofs (admin) |
| PATCH | `/proofs/:id/review` | Approve / reject proof (admin) |

### Learning Hub
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/videos` | Get all active video modules |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quiz` | Get all quizzes |
| POST | `/quiz/:id/submit` | Submit quiz answers → awards XP |

### Community
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/community` | Get community feed |
| POST | `/community` | Create a new post |
| POST | `/community/:id/like` | Toggle like on a post |
| POST | `/community/:id/comment` | Add comment to a post |

### Government Schemes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schemes` | Get all schemes |
| GET | `/schemes?state=Kerala` | Filter schemes by state |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/states` | List of Indian states |

---

## 📲 App Flow

```
App Launch
    │
    ▼
Splash Screen (3.8s animated)
    │
    ▼
Language Selection (10 Indian languages)
    │
    ▼
Login / Sign Up
    │
    ▼
OTP Verification (6-box email OTP)
    │
    ├── New User ──► Farm Profile Setup (3 steps)
    │                     │
    │                     ▼
    └── Returning User ──► Dashboard
                              │
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
                 Tasks    Learn Hub   Community
                    │
                    ▼
            Proof Submission
```

---

## 🗄️ Database Models

| Model | Key Fields |
|-------|-----------|
| **User** | email, fullName, profile{primaryCrops, farmSize, soilType, region, farmingGoals, skillLevel}, xp, level, greenCoins, streakDays, badges |
| **Task** | title, description, category, xpReward, coinReward, dueDate, isCompleted, requiresProof, difficulty |
| **Proof** | userId, taskId, proofUrl, status (Pending/Approved/Rejected), xpAwarded |
| **Quiz** | title, category, questions[], options[], correctAnswerIndex, xpReward |
| **Scheme** | title, description, eligibility[], state, applicationLink, isActive |
| **Post** | userId, content, imageUrl, likes[], comments[] |
| **Video** | title, description, category, url, thumbnail, duration, isActive |
| **Otp** | email, code, createdAt (TTL auto-delete) |

---

## 📁 Key Scripts

```bash
# Backend
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
node src/seeder.js   # Seed database with sample data

# Frontend
npx expo start       # Start Expo development server
npx expo start --clear   # Start with cleared cache (use after config changes)
```

---

## 🌍 Supported Languages

The language selection screen supports:

| Language | Code | Language | Code |
|----------|------|----------|------|
| English | en | Kannada | kn |
| Hindi | hi | Bengali | bn |
| Malayalam | ml | Marathi | mr |
| Tamil | ta | Gujarati | gu |
| Telugu | te | Punjabi | pa |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'feat: add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is built for **Smart India Hackathon 2025** and is open for educational use.

---

## 👩‍💻 Team

Built with 💚 for Indian farmers.

> **AgriFusion** — *Where Technology Meets the Soil*

---

<div align="center">

**[GitHub Repository](https://github.com/PandeyBhoomika/Agrifusion)**

</div>
