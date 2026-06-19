import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── 1. All supported language codes ──────────────────────────────────────────
export type LangCode = 'en' | 'hi' | 'ml' | 'ta' | 'te' | 'kn' | 'bn' | 'mr' | 'gu' | 'pa';

// ── 2. Shape of a translation file ───────────────────────────────────────────
export type Translations = {
  // COMMON
  common: {
    continue: string;
    back: string;
    skip: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    close: string;
    search: string;
    all: string;
    yes: string;
    no: string;
    required: string;
    optional: string;
  };

  // ✅ TABS (bottom navigation)
  tabs: {
    dashboard: string;
    tasks: string;
    learn: string;
    community: string;
  };

  // SPLASH
  splash: {
    tagline: string;
    smartTasks: string;
    earnXP: string;
    connect: string;
  };

  // LANGUAGE SCREEN
  language: {
    welcome: string;
    selectLanguage: string;
    choosePrompt: string;
  };

  // AUTH SCREEN
  auth: {
    appSubtitle: string;
    login: string;
    signUp: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    state: string;
    statePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    loginButton: string;
    signUpButton: string;
    disclaimer: string;
    otpSentSuccess: string;
    allFieldsRequired: string;
    invalidPhone: string;
    otpSendFailed: string;
    unexpectedError: string;
    sessionExpired: string;
  };

  // FARM PROFILE
  farmProfile: {
    title: string;
    stepOf: string;
    skip: string;
    skipConfirmTitle: string;
    skipConfirmMessage: string;
    skipStay: string;
    skipConfirm: string;
    stepLocation: string;
    stepCrops: string;
    stepGoals: string;
    step1Title: string;
    step1Sub: string;
    gpsCoords: string;
    gpsPlaceholder: string;
    gpsHint: string;
    panchayat: string;
    panchayatPlaceholder: string;
    district: string;
    districtPlaceholder: string;
    stateName: string;
    statePlaceholder: string;
    farmSize: string;
    farmSizePlaceholder: string;
    step2Title: string;
    step2Sub: string;
    primaryCrops: string;
    cropsPlaceholder: string;
    cropsHint: string;
    soilType: string;
    waterSource: string;
    currentSeason: string;
    seasonAutoDetected: string;
    step3Title: string;
    step3Sub: string;
    farmingGoals: string;
    goalsHint: string;
    skillLevel: string;
    previousCrop: string;
    previousCropPlaceholder: string;
    previousCropHint: string;
    back: string;
    continue: string;
    completeSetup: string;
    enterPanchayat: string;
    enterFarmSize: string;
    selectCrop: string;
    selectSoil: string;
    selectWater: string;
    selectGoal: string;
    selectSkill: string;
    selectCropsTitle: string;
    searchCrop: string;
    noCropsFound: string;
    confirmSelected: string;
    seasonKharif: string;
    seasonRabi: string;
    seasonZaid: string;
  };

  // QUIZ
  quiz: {
    title: string;
    subtitle: string;
    welcomeTitle: string;
    welcomeText: string;
    selectCategory: string;
    questions: string;
    back: string;
    backToCategories: string;
    previous: string;
    checkAnswer: string;
    next: string;
    finish: string;
    complete: string;
    percentComplete: string;
    correct: string;
    incorrect: string;
    retakeQuiz: string;
    backToLearning: string;
    congratulations: string;
    keepLearning: string;
    scoredOutOf: string;
    excellentWork: string;
    goodEffort: string;
    quizSummary: string;
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    notAnswered: string;
    loading: string;
  };

  // SCHEMES
  schemes: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noSchemesTitle: string;
    noSchemesSubtitle: string;
    support: string;
    department: string;
    eligibility: string;
    applyNow: string;
    active: string;
  };

  // ✅ TASKS (expanded — was only back: string before)
  tasks: {
    back: string;
    weeklyMissions: string;
    tasksDone: string;
    xpEarned: string;
    fetchingMissions: string;
    noTasksToday: string;
    markDone: string;
    completed: string;
    requiresPhoto: string;
    all: string;
    today: string;
  };

  // ✅ COMMUNITY
  community: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    feed: string;
    challenges: string;
    leaderboard: string;
    trendingNow: string;
    successStory: string;
    joinChallenge: string;
    notifyMe: string;
    loadingFeed: string;
    createPost: string;
    sharePlaceholder: string;
    post: string;
    failedPost: string;
    networkError: string;
  };

  // ✅ DASHBOARD
  dashboard: {
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    missionProgress: string;
    smartInsights: string;
    farmHealth: string;
    yourTools: string;
    tasks: string;
    dailyMissions: string;
    submitProof: string;
    uploadImages: string;
    rewards: string;
    unlockBadges: string;
    virtualFarm: string;
    cropStatus: string;
    learningHub: string;
    watchLearn: string;
    community: string;
    askExperts: string;
    govSchemes: string;
    findSubsidies: string;
    soilHealthy: string;
    waterEfficient: string;
    pestLowRisk: string;
    sunGood: string;
    cropHealthStable: string;
    waterUsageBetter: string;
    newRewards: string;
    goodForIrrigation: string;
    farmingScore: string;
    streakDays: string;
    xpBonus: string;
    xpToday: string;
    xpToLevel: string;
    pending: string;
    fieldPhotos: string;
    overview: string;
    live: string;
    eligible: string;
    new: string;
  };

  // ✅ LEARNING HUB
  learningHub: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    featuredLabel: string;
    featuredTitle: string;
    featuredSub: string;
    startCourse: string;
    courseCompletion: string;
    weeklyGoal: string;
    all: string;
    simulations: string;
    videos: string;
    quizzes: string;
    miniGames: string;
    quizCenter: string;
    takeFullQuiz: string;
    quizSub: string;
    availableGames: string;
    cropRotationGame: string;
    cropRotationSub: string;
    farmDayGame: string;
    farmDaySub: string;
    backToHub: string;
    loadingVideo: string;
    videoCompleted: string;
    simulationComingSoon: string;
    simulationText: string;
  };
  // Add this section to Translations type
farmData: {
  soilAlluvial: string; soilAlluvialDesc: string;
  soilBlack: string; soilBlackDesc: string;
  soilRed: string; soilRedDesc: string;
  soilLaterite: string; soilLateriteDesc: string;
  soilLoamy: string; soilLoamyDesc: string;
  soilClay: string; soilClayDesc: string;
  soilSandy: string; soilSandyDesc: string;
  soilMountain: string; soilMountainDesc: string;
  waterAbundant: string; waterBorewell: string;
  waterRainfed: string; waterDrip: string; waterLimited: string;
  goalProfit: string; goalOrganic: string; goalQuick: string;
  goalLowEffort: string; goalWater: string; goalExport: string;
  skillBeginner: string; skillBeginnerDesc: string;
  skillIntermediate: string; skillIntermediateDesc: string;
  skillAdvanced: string; skillAdvancedDesc: string;
  skillExpert: string; skillExpertDesc: string;
};
crops: {
  rice: string; wheat: string; maize: string; jowar: string; bajra: string; ragi: string;
  cotton: string; sugarcane: string; groundnut: string; soybean: string; sunflower: string;
  mustard: string; turmeric: string; ginger: string; onion: string; potato: string;
  tomato: string; chilli: string; brinjal: string; cabbage: string; cauliflower: string;
  peas: string; chickpea: string; pigeonPea: string; blackGram: string; greenGram: string;
  lentil: string; banana: string; mango: string; grapes: string; pomegranate: string;
  guava: string; papaya: string; coconut: string; arecanut: string; cashew: string;
  tea: string; coffee: string;
};
};

// ── 3. Context type ───────────────────────────────────────────────────────────
type LanguageContextType = {
  lang: LangCode;
  t: Translations;
  setLanguage: (code: LangCode) => Promise<void>;
};

// ── 4. Lazy translation loader (offline — bundled files) ──────────────────────
const loadTranslations = (code: LangCode): Translations => {
  switch (code) {
    case 'hi': return require('../translations/hi.json');
    case 'ml': return require('../translations/ml.json');
    case 'ta': return require('../translations/ta.json');
    case 'te': return require('../translations/te.json');
    case 'kn': return require('../translations/kn.json');
    case 'bn': return require('../translations/bn.json');
    case 'mr': return require('../translations/mr.json');
    case 'gu': return require('../translations/gu.json');
    case 'pa': return require('../translations/pa.json');
    default:   return require('../translations/en.json');
  }
};

// ── 5. Create context ─────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextType | null>(null);

// ── 6. Provider component ─────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LangCode>('en');
  const [t, setT] = useState<Translations>(loadTranslations('en'));

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('app_language');
        if (saved) {
          const code = saved as LangCode;
          setLang(code);
          setT(loadTranslations(code));
        }
      } catch {}
    })();
  }, []);

  const setLanguage = async (code: LangCode) => {
    try {
      await AsyncStorage.setItem('app_language', code);
    } catch {}
    setLang(code);
    setT(loadTranslations(code));
  };

  return (
    <LanguageContext.Provider value={{ lang, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── 7. Hook for easy use in any screen ───────────────────────────────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}