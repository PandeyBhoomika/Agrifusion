
![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)

# 🌾 AgriFusion

**Gamified Sustainable Farming Platform for Indian Farmers**

A full-stack mobile application that helps Indian farmers adopt sustainable agricultural practices through a personalised dashboard, gamified learning, community engagement, and access to government schemes — built to make precision farming accessible to everyone.

[Quick Start](#-quick-start) • [Features](#-features) • [Architecture](#️-system-architecture) • [Project Structure](#-project-structure) • [API Reference](#-api-reference) • [Tech Stack](#-tech-stack) • [Environment Variables](#-environment-variables)

---

## ✨ Features

| Category | Feature | Description |
|---|---|---|
| 🌤️ **Smart Dashboard** | Live Weather Integration | Real-time weather from WeatherAPI with an agricultural suitability score |
| 🎮 **Gamification** | XP, Coins & Badges | Farmers earn Green Coins, XP points, and unlock badges for sustainable actions |
| 📚 **Learning Hub** | Video Modules & Quizzes | Categorised farming tutorials, simulations, and knowledge quizzes with progress tracking |
| 👥 **Community** | Social Feed & Challenges | Farmers share tips, post success stories, and join sustainable farming challenges |
| 🏆 **Rewards System** | Ranks, Tiers & Boosters | Silver/Gold tier progression, XP boosters, streak shields, and spin tokens |
| 🌱 **Farm Profile** | Personalised Setup | Soil type, water availability, farming goals, and skill level for tailored recommendations |
| 📋 **Government Schemes** | Kerala & National Schemes | Browse active schemes (Karshaka Samridhi, Subhiksha Keralam, etc.) with eligibility and links |
| 🔐 **Auth with OTP** | Email OTP Verification | Secure registration and login with email-based OTP, JWT sessions, and bcrypt password hashing |
| 🌍 **Multi-language** | Language Selection | Onboarding language picker to support regional preferences |
| ✅ **Proof Submission** | Task Validation | Farmers submit proof of completed sustainable tasks for verification and reward |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Runtime for both backend and Expo CLI |
| **npm** | 9+ | Package management |
| **MongoDB** | 7.0+ | User data and OTP storage |
| **Expo CLI** | Latest | Mobile app development and bundling |
| **WeatherAPI Key** | — | Live weather data ([Get one free →](https://www.weatherapi.com)) |

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AgriFusion.git
cd AgriFusion
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install
```

### 3. Configure Backend Environment

Create a `.env` file inside the `backend/` directory:

```env
# ━━━ REQUIRED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONGO_URI=mongodb://localhost:27017/agrifusion
PORT=4000
JWT_SECRET=your_jwt_secret_here

# ━━━ EMAIL (for OTP) ━━━━━━━━━━━━━━━━━━━━━━━━
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Start the Backend

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API server starts at **http://localhost:4000**

| URL | Description |
|---|---|
| `http://localhost:4000/api/health` | Server health check |
| `http://localhost:4000/api/auth/send-otp` | Send OTP to email |
| `http://localhost:4000/api/auth/verify-otp` | Verify OTP |
| `http://localhost:4000/api/auth/login` | User login |

### 5. Mobile App (Diya) Setup

Open a **new terminal**:

```bash
cd Diya

# Install dependencies
npm install
```

### 6. Configure App Environment

Create a `.env` file inside the `Diya/` directory:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000          # Android emulator
# EXPO_PUBLIC_API_URL=http://localhost:4000        # iOS simulator / web
EXPO_PUBLIC_WEATHER_API_KEY=your_weatherapi_key_here
```

### 7. Start the App

```bash
# Start Expo development server
npx expo start

# Open on Android emulator
npx expo start --android

# Open on iOS simulator
npx expo start --ios

# Open in browser
npx expo start --web
```

---

## 🏗️ System Architecture

AgriFusion uses a **decoupled client-server architecture** with a React Native mobile frontend and a Node.js/Express REST backend:

```
┌──────────────────────────────────────────────────────────────┐
│            MOBILE APP  —  React Native (Expo Router)         │
│  Dashboard │ Learning Hub │ Community │ Rewards │ Farm Setup │
└──────────────────────┬───────────────────────────────────────┘
                       │  REST / fetch
┌──────────────────────▼───────────────────────────────────────┐
│               Node.js + Express Backend (Port 4000)          │
│                                                              │
│   ┌────────────────────────────────────────────────────┐    │
│   │                  Route Handlers                    │    │
│   │  auth.routes.js  │  user.routes.js                 │    │
│   └────────────────────────────────────────────────────┘    │
│                                                              │
│   auth.controller.js  │  user.controller.js                 │
│   auth.js (JWT middleware)                                   │
└────────────┬─────────────────────────────────────────────────┘
             │
┌────────────▼─────────────┐     ┌─────────────────────────────┐
│        MongoDB           │     │     WeatherAPI (External)   │
│  users / otps            │     │  Real-time weather + AQI    │
└──────────────────────────┘     └─────────────────────────────┘
```

---

## 📁 Project Structure

```
AgriFusion/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app setup, MongoDB connection, route mounting
│   │   ├── index.js                # Server entry point
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # /send-otp, /verify-otp, /login
│   │   │   └── user.routes.js      # User profile endpoints
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # OTP generation, email dispatch, JWT issuance
│   │   │   └── user.controller.js  # Profile read/update logic
│   │   ├── models/
│   │   │   ├── User.js             # Mongoose user schema (email, name, state, bcrypt)
│   │   │   └── Otp.js              # OTP document schema with TTL
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT verification middleware
│   │   └── data/
│   │       └── store.js            # In-memory data helpers
│   └── package.json
│
└── Diya/                           # React Native mobile app (Expo)
    ├── app/
    │   ├── _layout.tsx             # Root layout with Expo Router
    │   ├── index.tsx               # App entry — redirects to splash/auth
    │   ├── splash.tsx              # Animated splash screen
    │   ├── auth.tsx                # Auth flow controller
    │   ├── language.tsx            # Language selection screen
    │   ├── otp-verification.tsx    # OTP input and verification screen
    │   ├── farm-profile.tsx        # Farm setup (soil, water, goals, skill level)
    │   ├── quiz.tsx                # Full quiz engine with categories and scoring
    │   ├── tasks-view.tsx          # Task list view
    │   ├── (tabs)/
    │   │   ├── _layout.tsx         # Tab navigator (Dashboard, Tasks, Learn, Community)
    │   │   ├── dashboard.tsx       # Personalised dashboard with live weather
    │   │   ├── learninghub.tsx     # Video modules, simulations, quizzes
    │   │   ├── communitydashboard.tsx  # Social feed, challenges, leaderboard
    │   │   ├── proof-submission.tsx    # Task proof upload
    │   │   ├── tasks.tsx           # Tasks tab screen
    │   │   ├── login.tsx           # Login screen
    │   │   └── virtualfarm.tsx     # Virtual farm tab
    │   └── rewards/
    │       └── index.tsx           # Rewards hub (XP, coins, badges, roadmap, boosters)
    ├── services/
    │   ├── api.ts                  # Base fetch wrapper (login, register, health)
    │   ├── authService.ts          # Auth API calls (OTP, verify, login)
    │   ├── quizService.ts          # Quiz fetch and submission
    │   ├── schemeService.ts        # Kerala & national government scheme data
    │   ├── stateService.ts         # Indian states data helper
    │   └── videoService.ts         # Video module fetch and progress tracking
    ├── data/
    │   ├── mockData.ts             # Indian states list and dev fallback data
    │   ├── quizMockData.ts         # Soil health, water, pest quiz questions
    │   └── videoMockData.ts        # Video module mock data
    ├── assets/
    │   ├── icons/                  # Badge and coin icons
    │   ├── images/                 # App icon, splash, android adaptive icons
    │   ├── lottie/                 # Badge glow, confetti, XP ring animations
    │   └── rewards/                # Reward chest and sparkle animations
    ├── app.json                    # Expo config (name, scheme, Android/iOS settings)
    └── package.json
```

---

## 📡 API Reference

All endpoints served at `http://localhost:4000`.

### Auth Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Send OTP to the provided email address |
| `POST` | `/api/auth/verify-otp` | Verify the OTP and create/confirm the user account |
| `POST` | `/api/auth/login` | Log in with email and password; returns JWT |

### User Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/profile` | Get the authenticated user's profile (JWT required) |
| `PUT` | `/api/user/profile` | Update profile fields (name, state, farm details) |

### Quiz & Video Endpoints *(served externally / mock)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/quiz/all` | Returns all quiz categories |
| `GET` | `/api/quiz/:categoryId` | Returns a single quiz category |
| `POST` | `/api/quiz/:categoryId/submit` | Submit answers; returns score and points |
| `GET` | `/api/videos` | Returns all video modules |
| `GET` | `/api/videos/category/:category` | Returns videos by category |
| `POST` | `/api/videos/:videoId/progress` | Update watch progress for a video |
| `GET` | `/api/videos/search?q=query` | Search videos by keyword |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ status: "ok", message: "Backend running 🚜" }` |

---

## 🔧 Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| **Express** | 4.18 | HTTP server and REST routing |
| **Mongoose** | 7.3 | MongoDB ODM — User and OTP models |
| **bcryptjs** | 2.4 | Password hashing with salt rounds |
| **jsonwebtoken** | 9.0 | JWT issuance and verification |
| **nodemailer** | 6.9 | Email dispatch for OTP delivery |
| **dotenv** | 16.0 | Environment variable management |
| **cors** | 2.8 | Cross-origin request handling |
| **nodemon** | 2.0 | Dev auto-reload |

### Mobile App (Diya)

| Package | Version | Purpose |
|---|---|---|
| **React Native** | Expo SDK | Cross-platform mobile framework |
| **Expo Router** | Latest | File-based navigation with typed routes |
| **TypeScript** | 5.0 | Static typing across all screens and services |
| **expo-linear-gradient** | — | Gradient backgrounds and card styling |
| **expo-location** | — | GPS coordinates for weather lookup |
| **react-native-webview** | — | Embedded YouTube video playback |
| **react-native-reanimated** | — | Smooth badge and rewards animations |
| **WeatherAPI** | External | Real-time weather and agricultural scoring |
| **Lottie (JSON)** | — | Badge unlock, confetti, XP ring animations |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ Yes | MongoDB connection string |
| `PORT` | No (default: 4000) | Port the Express server listens on |
| `JWT_SECRET` | ✅ Yes | Secret key for signing JWT tokens |
| `EMAIL_USER` | ✅ Yes | Gmail address used to send OTPs |
| `EMAIL_PASS` | ✅ Yes | Gmail app password for nodemailer |

### Mobile App (`Diya/.env`)

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ Yes | Base URL of the backend (e.g. `http://10.0.2.2:4000` for Android emulator) |
| `EXPO_PUBLIC_WEATHER_API_KEY` | ✅ Yes | WeatherAPI key for live weather data |

---

## 🗒️ Usage Guide

1. **Register** — Enter your email, receive an OTP, verify, and set a password
2. **Set up your farm** — Select soil type, water availability, skill level, and farming goals
3. **Dashboard** — View personalised weather data, today's tasks, and an agricultural suitability score
4. **Learn** — Browse video modules and simulations, take quizzes, and earn XP and Green Coins
5. **Community** — Post updates, browse the feed, join challenges, and climb the leaderboard
6. **Rewards** — Track your XP roadmap, unlock badges, activate boosters, and redeem coins
7. **Schemes** — Browse active government schemes with eligibility criteria and application links
8. **Submit Proof** — Upload proof of completed sustainable farming tasks to earn verified rewards

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📜 License

This project is for educational and portfolio purposes.

---

Built with ❤️ using **React Native**, **Expo**, **Node.js**, **MongoDB**, and **WeatherAPI**
