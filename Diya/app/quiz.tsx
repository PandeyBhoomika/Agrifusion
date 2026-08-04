import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Platform, Animated, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllQuizzes, fetchQuizByCategory } from '../services/quizService';
import { QuizQuestion, QuizCategory } from '../data/quizMockData';
import { useLanguage } from '../context/LanguageContext';
import QuizHistory from '../components/QuizHistory';

// ─── Difficulty config ────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   emoji: '🌱', color: '#10B981', bg: '#D1FAE5', multiplier: 1,   description: 'Basic questions, no pressure' },
  medium: { label: 'Medium', emoji: '🌾', color: '#F59E0B', bg: '#FEF3C7', multiplier: 1.5, description: 'Moderate challenge' },
  hard:   { label: 'Hard',   emoji: '🔥', color: '#EF4444', bg: '#FEE2E2', multiplier: 2,   description: 'Maximum points, no hints' },
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function Quiz() {
  const router = useRouter();
  const { t } = useLanguage();

  const [quizCategories, setQuizCategories] = useState<QuizCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showStreakBurst, setShowStreakBurst] = useState(false);
  const streakAnim = useRef(new Animated.Value(0)).current;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const loadQuizzes = async () => {
      setIsLoading(true);
      const quizzes = await fetchAllQuizzes();
      setQuizCategories(quizzes);
      setIsLoading(false);
    };
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (selectedCategory && selectedDifficulty) {
      const filtered = selectedCategory.questions.filter(
        (q: any) => q.difficulty === selectedDifficulty
      );
      setFilteredQuestions(filtered);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizComplete(false);
      setScore(0);
      setShowExplanation(false);
      setStreak(0);
      setMaxStreak(0);
    }
  }, [selectedDifficulty, selectedCategory]);

  const triggerStreakBurst = () => {
    setShowStreakBurst(true);
    streakAnim.setValue(0);
    Animated.sequence([
      Animated.spring(streakAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 5 }),
      Animated.delay(800),
      Animated.timing(streakAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowStreakBurst(false));
  };

  const handleCategorySelect = useCallback(async (category: QuizCategory) => {
    setIsLoading(true);
    const freshQuizData = await fetchQuizByCategory(category.id);
    if (freshQuizData) setSelectedCategory(freshQuizData);
    else setSelectedCategory(category);
    setSelectedDifficulty(null);
    setFilteredQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizComplete(false);
    setScore(0);
    setShowExplanation(false);
    setStreak(0);
    setMaxStreak(0);
    setIsLoading(false);
  }, []);

  const handleAnswerSelect = useCallback((questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedCategory || !selectedDifficulty) return;
    if (showExplanation) {
      setShowExplanation(false);
      if (currentQuestionIndex < filteredQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        handleSubmitQuiz();
      }
    } else {
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      const userAnswer = selectedAnswers[currentQuestion.id];
      const isCorrect = userAnswer === currentQuestion.correctAnswer;

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        if (newStreak > 0 && newStreak % 3 === 0) triggerStreakBurst();
      } else {
        setStreak(0);
      }
      setShowExplanation(true);
    }
  }, [selectedCategory, currentQuestionIndex, showExplanation, selectedAnswers, streak, maxStreak, selectedDifficulty, filteredQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  }, [currentQuestionIndex]);

  const handleSubmitQuiz = useCallback(async () => {
    if (!selectedCategory || !selectedDifficulty) return;
    const multiplier = DIFFICULTY_CONFIG[selectedDifficulty].multiplier;
    let totalScore = 0;
    filteredQuestions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        totalScore += Math.round(question.points * multiplier);
      }
    });
    const totalPossible = filteredQuestions.reduce((sum, q) => sum + Math.round(q.points * multiplier), 0);
    const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
    const passed = percentage >= 70;

    setScore(totalScore);
    setQuizComplete(true);

    // Save to backend
    try {
      const token = await AsyncStorage.getItem('authToken');
      const categoryId = (selectedCategory as any)._id || selectedCategory.id;
await fetch(`${API_BASE_URL}/quiz/${categoryId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          passed,
          score: totalScore,
          totalPoints: totalPossible,
          percentage,
          difficulty: selectedDifficulty,
          categoryName: selectedCategory.name,
        }),
      });
    } catch (e) {
      console.warn('Failed to save quiz history:', e);
    }
  }, [selectedCategory, selectedAnswers, selectedDifficulty, filteredQuestions]);

  const handleRestartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizComplete(false);
    setScore(0);
    setShowExplanation(false);
    setStreak(0);
    setMaxStreak(0);
    setSelectedDifficulty(null);
    setFilteredQuestions([]);
  }, []);

  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setFilteredQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizComplete(false);
    setScore(0);
    setShowExplanation(false);
    setStreak(0);
    setMaxStreak(0);
  }, []);

  const getProgress = () => {
    if (!filteredQuestions.length) return 0;
    return ((currentQuestionIndex + 1) / filteredQuestions.length) * 100;
  };

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isAnswerSelected = currentQuestion ? selectedAnswers[currentQuestion.id] !== undefined : false;

  const getTotalPossibleScore = () => {
    if (!selectedDifficulty) return 0;
    const multiplier = DIFFICULTY_CONFIG[selectedDifficulty].multiplier;
    return filteredQuestions.reduce((sum, q) => sum + Math.round(q.points * multiplier), 0);
  };

  // ── HISTORY SCREEN ────────────────────────────────────────────────────────
  if (showHistory) {
    return (
      <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle}>📋 Quiz History</Text>
            </View>
            <View style={{ width: 70 }} />
          </View>
          <QuizHistory />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── DIFFICULTY SELECTION SCREEN ──────────────────────────────────────────
  if (selectedCategory && !selectedDifficulty) {
    return (
      <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToCategories} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle}>{selectedCategory.name}</Text>
              <Text style={styles.headerSub}>Choose your difficulty</Text>
            </View>
            <View style={{ width: 70 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.difficultyIntroCard}>
              <Text style={styles.difficultyIntroEmoji}>{selectedCategory.icon}</Text>
              <Text style={styles.difficultyIntroTitle}>{selectedCategory.name}</Text>
              <Text style={styles.difficultyIntroSub}>{selectedCategory.questions.length} questions total</Text>
            </View>

            <Text style={styles.sectionTitle}>Select Difficulty</Text>

            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => {
              const cfg = DIFFICULTY_CONFIG[level];
              const count = selectedCategory.questions.filter((q: any) => q.difficulty === level).length;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.difficultyCard, { borderColor: cfg.color }]}
                  onPress={() => setSelectedDifficulty(level)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.difficultyIconWrap, { backgroundColor: cfg.bg }]}>
                    <Text style={{ fontSize: 32 }}>{cfg.emoji}</Text>
                  </View>
                  <View style={styles.difficultyInfo}>
                    <Text style={[styles.difficultyLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    <Text style={styles.difficultyDesc}>{cfg.description}</Text>
                    <Text style={[styles.difficultyMultiplier, { color: cfg.color }]}>
                      {count} questions · {cfg.multiplier}x points
                    </Text>
                  </View>
                  <Text style={[styles.difficultyArrow, { color: cfg.color }]}>→</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── QUIZ COMPLETE SCREEN ─────────────────────────────────────────────────
  if (quizComplete && selectedCategory && selectedDifficulty) {
    const totalPossible = getTotalPossibleScore();
    const percentage = totalPossible > 0 ? (score / totalPossible) * 100 : 0;
    const passed = percentage >= 70;
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];

    return (
      <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToCategories} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{t.quiz.backToCategories}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle}>{t.quiz.complete}</Text>
            </View>
            <View style={{ width: 80 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>{passed ? '🎉' : '📚'}</Text>
              <Text style={styles.resultTitle}>
                {passed ? t.quiz.congratulations : t.quiz.keepLearning}
              </Text>
              <Text style={styles.resultSubtitle}>
                {t.quiz.scoredOutOf
                  .replace('{score}', String(score))
                  .replace('{total}', String(totalPossible))}
              </Text>
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
              </View>

              <View style={styles.resultBadgeRow}>
                <View style={[styles.resultBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={{ fontSize: 14 }}>{cfg.emoji}</Text>
                  <Text style={[styles.resultBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                {maxStreak >= 3 && (
                  <View style={styles.resultBadge}>
                    <Text style={{ fontSize: 14 }}>🔥</Text>
                    <Text style={styles.resultBadgeText}>Best streak: {maxStreak}</Text>
                  </View>
                )}
                <View style={[styles.resultBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={{ fontSize: 14 }}>⚡</Text>
                  <Text style={[styles.resultBadgeText, { color: '#1E40AF' }]}>{cfg.multiplier}x multiplier</Text>
                </View>
              </View>

              <Text style={styles.resultMessage}>
                {passed ? t.quiz.excellentWork : t.quiz.goodEffort}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t.quiz.quizSummary}</Text>
              {filteredQuestions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                return (
                  <View key={question.id} style={styles.summaryItem}>
                    <View style={styles.summaryHeader}>
                      <Text style={styles.summaryQuestionNumber}>{t.quiz.question} {index + 1}</Text>
                      <View style={[styles.badge, isCorrect ? styles.correctBadge : styles.incorrectBadge]}>
                        <Text style={styles.badgeText}>{isCorrect ? t.quiz.correct : t.quiz.incorrect}</Text>
                      </View>
                    </View>
                    <Text style={styles.summaryQuestionText}>{question.question}</Text>
                    <Text style={styles.summaryAnswer}>
                      {t.quiz.yourAnswer} {question.options[userAnswer] || t.quiz.notAnswered}
                    </Text>
                    {!isCorrect && (
                      <Text style={styles.summaryCorrect}>
                        {t.quiz.correctAnswer} {question.options[question.correctAnswer]}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleRestartQuiz}>
              <Text style={styles.primaryButtonText}>{t.quiz.retakeQuiz}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowHistory(true)}>
              <Text style={styles.secondaryButtonText}>📋 View History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToCategories}>
              <Text style={styles.secondaryButtonText}>{t.quiz.backToCategories}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>{t.quiz.backToLearning}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── QUIZ QUESTION SCREEN ─────────────────────────────────────────────────
  if (selectedCategory && currentQuestion && selectedDifficulty) {
    const userAnswer = selectedAnswers[currentQuestion.id];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    const pointsForQ = Math.round(currentQuestion.points * cfg.multiplier);

    return (
      <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          {showStreakBurst && (
            <Animated.View style={[styles.streakBurst, {
              opacity: streakAnim,
              transform: [{ scale: streakAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
            }]}>
              <Text style={styles.streakBurstText}>🔥 {streak} in a row!</Text>
            </Animated.View>
          )}

          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToCategories} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{t.quiz.back}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle}>{selectedCategory.name}</Text>
              <Text style={styles.headerSub}>
                {t.quiz.question} {currentQuestionIndex + 1} / {filteredQuestions.length}
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTopRow}>
              <View style={[styles.difficultyPill, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.difficultyPillText, { color: cfg.color }]}>{cfg.emoji} {cfg.label}</Text>
              </View>
              <Text style={styles.progressText}>{Math.round(getProgress())}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${getProgress()}%`, backgroundColor: cfg.color }]} />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.categoryBadge}>{currentQuestion.category}</Text>
                <Text style={[styles.pointsBadge, { color: cfg.color, backgroundColor: cfg.bg }]}>
                  +{pointsForQ} pts
                </Text>
              </View>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = userAnswer === index;
                  const showCorrect = showExplanation && index === currentQuestion.correctAnswer;
                  const showIncorrect = showExplanation && isSelected && !isCorrect;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        isSelected && !showExplanation && styles.optionButtonSelected,
                        showCorrect && styles.optionButtonCorrect,
                        showIncorrect && styles.optionButtonIncorrect,
                      ]}
                      onPress={() => !showExplanation && handleAnswerSelect(currentQuestion.id, index)}
                      disabled={showExplanation}
                    >
                      <View style={styles.optionContent}>
                        <View style={[
                          styles.optionRadio,
                          isSelected && !showExplanation && styles.optionRadioSelected,
                          showCorrect && styles.optionRadioCorrect,
                          showIncorrect && styles.optionRadioIncorrect,
                        ]}>
                          {showCorrect && <Text style={styles.radioIcon}>✓</Text>}
                          {showIncorrect && <Text style={styles.radioIcon}>✗</Text>}
                        </View>
                        <Text style={[
                          styles.optionText,
                          isSelected && !showExplanation && styles.optionTextSelected,
                          showCorrect && styles.optionTextCorrect,
                          showIncorrect && styles.optionTextIncorrect,
                        ]}>
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showExplanation && (
                <View style={[styles.explanationCard, isCorrect ? styles.correctCard : styles.incorrectCard]}>
                  <Text style={styles.explanationTitle}>
                    {isCorrect ? `✅ ${t.quiz.correct}` : `❌ ${t.quiz.incorrect}`}
                  </Text>
                  {selectedDifficulty !== 'hard' ? (
                    <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                  ) : (
                    <Text style={styles.explanationText}>No hints on Hard mode! 💪</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
                onPress={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
                  {t.quiz.previous}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.nextButton, { backgroundColor: cfg.color, borderColor: cfg.color }, !isAnswerSelected && !showExplanation && styles.navButtonDisabled]}
                onPress={handleNext}
                disabled={!isAnswerSelected && !showExplanation}
              >
                <Text style={[styles.navButtonText, styles.nextButtonText]}>
                  {showExplanation
                    ? currentQuestionIndex === filteredQuestions.length - 1 ? t.quiz.finish : t.quiz.next
                    : t.quiz.checkAnswer}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── CATEGORY SELECTION SCREEN ─────────────────────────────────────────────
  return (
    <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{t.quiz.back}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>{t.quiz.title}</Text>
            <Text style={styles.headerSub}>{t.quiz.subtitle}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.historyBtn}>
            <Text style={styles.historyBtnText}>📋 History</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>{t.quiz.welcomeTitle}</Text>
            <Text style={styles.introText}>{t.quiz.welcomeText}</Text>
          </View>

          <Text style={styles.sectionTitle}>{t.quiz.selectCategory}</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>{t.quiz.loading}</Text>
            </View>
          ) : (
            quizCategories.map((category) => {
              const totalPoints = category.questions.reduce((sum, q) => sum + q.points, 0);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategorySelect(category)}
                >
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryIconText}>{category.icon}</Text>
                  </View>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                    <View style={styles.categoryMeta}>
                      <Text style={styles.categoryMetaText}>{category.questions.length} {t.quiz.questions}</Text>
                      <Text style={styles.categoryPoints}>+{totalPoints} pts</Text>
                    </View>
                    <View style={styles.difficultyPreviewRow}>
                      {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => (
                        <View key={d} style={[styles.difficultyPreviewPill, { backgroundColor: DIFFICULTY_CONFIG[d].bg }]}>
                          <Text style={{ fontSize: 10, color: DIFFICULTY_CONFIG[d].color, fontWeight: '700' }}>
                            {DIFFICULTY_CONFIG[d].emoji} {DIFFICULTY_CONFIG[d].label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.categoryArrow}>→</Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: Platform.OS === 'android' ? 12 : 16, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  headerButton: { padding: 10, backgroundColor: '#ECFDF5', borderRadius: 10 },
  headerButtonText: { color: '#10B981', fontSize: 14, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  content: { padding: 20, paddingBottom: 40 },
  historyBtn: { padding: 10, backgroundColor: '#ECFDF5', borderRadius: 10 },
  historyBtnText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 2 },
  streakFire: { fontSize: 16 },
  streakNum: { fontSize: 16, fontWeight: '800', color: '#D97706' },
  streakBurst: { position: 'absolute', top: '40%', alignSelf: 'center', zIndex: 100, backgroundColor: '#1F2937', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, elevation: 20 },
  streakBurstText: { fontSize: 22, fontWeight: '900', color: '#FCD34D' },
  difficultyIntroCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#E5E7EB' },
  difficultyIntroEmoji: { fontSize: 48, marginBottom: 8 },
  difficultyIntroTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  difficultyIntroSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  difficultyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 2.5 },
  difficultyIconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  difficultyInfo: { flex: 1 },
  difficultyLabel: { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  difficultyDesc: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  difficultyMultiplier: { fontSize: 13, fontWeight: '700' },
  difficultyArrow: { fontSize: 22, fontWeight: 'bold', marginLeft: 8 },
  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  difficultyPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  difficultyPillText: { fontSize: 12, fontWeight: '700' },
  difficultyPreviewRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  difficultyPreviewPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  resultBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  resultBadgeText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  introCard: { backgroundColor: '#DBEAFE', padding: 20, borderRadius: 16, marginBottom: 28, borderWidth: 2, borderColor: '#93C5FD' },
  introTitle: { fontSize: 20, fontWeight: '800', color: '#1E3A8A', marginBottom: 10 },
  introText: { fontSize: 15, color: '#1E40AF', lineHeight: 22, fontWeight: '500' },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 18, letterSpacing: -0.5 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, marginBottom: 14, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  categoryIcon: { width: 64, height: 64, backgroundColor: '#F0FDF4', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 2, borderColor: '#D1FAE5' },
  categoryIconText: { fontSize: 32 },
  categoryContent: { flex: 1 },
  categoryTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 5 },
  categoryDescription: { fontSize: 14, color: '#6B7280', marginBottom: 8, lineHeight: 19 },
  categoryMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryMetaText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  categoryPoints: { fontSize: 14, fontWeight: '800', color: '#10B981' },
  categoryArrow: { fontSize: 24, color: '#10B981', marginLeft: 10, fontWeight: 'bold' },
  progressContainer: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  progressBarTrack: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: 10, backgroundColor: '#10B981', borderRadius: 5 },
  progressText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  questionCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, marginBottom: 24, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  categoryBadge: { fontSize: 13, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, fontWeight: '700' },
  pointsBadge: { fontSize: 14, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  questionText: { fontSize: 19, fontWeight: '700', color: '#111827', marginBottom: 22, lineHeight: 28 },
  optionsContainer: { gap: 14 },
  optionButton: { backgroundColor: '#F9FAFB', padding: 18, borderRadius: 14, borderWidth: 2.5, borderColor: '#E5E7EB' },
  optionButtonSelected: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  optionButtonCorrect: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  optionButtonIncorrect: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  optionContent: { flexDirection: 'row', alignItems: 'center' },
  optionRadio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2.5, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', marginRight: 14, alignItems: 'center', justifyContent: 'center' },
  optionRadioSelected: { borderColor: '#3B82F6', backgroundColor: '#3B82F6' },
  optionRadioCorrect: { borderColor: '#10B981', backgroundColor: '#10B981' },
  optionRadioIncorrect: { borderColor: '#EF4444', backgroundColor: '#EF4444' },
  radioIcon: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  optionText: { fontSize: 16, color: '#374151', flex: 1, fontWeight: '500', lineHeight: 22 },
  optionTextSelected: { color: '#1E40AF', fontWeight: '700' },
  optionTextCorrect: { color: '#065F46', fontWeight: '700' },
  optionTextIncorrect: { color: '#991B1B', fontWeight: '700' },
  explanationCard: { marginTop: 18, padding: 18, borderRadius: 12, borderLeftWidth: 5 },
  correctCard: { backgroundColor: '#ECFDF5', borderLeftColor: '#10B981' },
  incorrectCard: { backgroundColor: '#FEF2F2', borderLeftColor: '#EF4444' },
  explanationTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10, color: '#111827' },
  explanationText: { fontSize: 15, color: '#374151', lineHeight: 22, fontWeight: '500' },
  navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  navButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center' },
  navButtonDisabled: { opacity: 0.4 },
  nextButton: { backgroundColor: '#10B981', borderColor: '#10B981' },
  navButtonText: { fontSize: 17, fontWeight: '700', color: '#374151' },
  navButtonTextDisabled: { color: '#9CA3AF' },
  nextButtonText: { color: '#FFFFFF' },
  resultCard: { backgroundColor: '#FFFFFF', padding: 28, borderRadius: 18, alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#E5E7EB' },
  resultEmoji: { fontSize: 72, marginBottom: 20 },
  resultTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 10 },
  resultSubtitle: { fontSize: 17, color: '#6B7280', marginBottom: 24, fontWeight: '600' },
  percentageContainer: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 4, borderColor: '#93C5FD' },
  percentageText: { fontSize: 40, fontWeight: '900', color: '#1E40AF' },
  resultMessage: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  summaryCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 2, borderColor: '#E5E7EB' },
  summaryTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 18 },
  summaryItem: { marginBottom: 18, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryQuestionNumber: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  correctBadge: { backgroundColor: '#D1FAE5' },
  incorrectBadge: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  summaryQuestionText: { fontSize: 15, color: '#111827', marginBottom: 8, fontWeight: '600', lineHeight: 21 },
  summaryAnswer: { fontSize: 14, color: '#6B7280', marginBottom: 5, fontWeight: '500' },
  summaryCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700' },
  primaryButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 14 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 14, borderWidth: 2, borderColor: '#D1D5DB' },
  secondaryButtonText: { color: '#374151', fontSize: 17, fontWeight: '700' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  loadingText: { marginTop: 16, fontSize: 15, color: '#6B7280', fontWeight: '600' },
});
