import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { fetchAllQuizzes, fetchQuizByCategory } from '../services/quizService';
import { QuizQuestion, QuizCategory } from '../data/quizMockData';
import { useLanguage } from '../context/LanguageContext';

const initialQuizCategories: QuizCategory[] = [
  {
    id: 'soil-health',
    name: 'Soil Health',
    description: 'Test your knowledge about soil management and health',
    icon: '🌱',
    questions: [
      { id: 'sh-q1', question: 'What is the ideal pH range for most crops?', type: 'multiple-choice', options: ['5.0-5.5', '6.0-7.0', '7.5-8.5', '8.0-9.0'], correctAnswer: 1, explanation: 'Most crops prefer a pH range of 6.0–7.0 as it allows optimal nutrient availability.', points: 25, category: 'soil-health' },
      { id: 'sh-q2', question: 'Organic matter helps soil retain water.', type: 'true-false', options: ['True', 'False'], correctAnswer: 0, explanation: 'True — organic matter improves water retention capacity of soil.', points: 20, category: 'soil-health' },
      { id: 'sh-q3', question: 'Which nutrient is represented by "N" in NPK fertilizer?', type: 'multiple-choice', options: ['Nickel', 'Nitrogen', 'Neon', 'Sodium'], correctAnswer: 1, explanation: 'N stands for Nitrogen, which is essential for leafy green growth.', points: 25, category: 'soil-health' },
      { id: 'sh-q4', question: 'Earthworms are harmful to soil health.', type: 'true-false', options: ['True', 'False'], correctAnswer: 1, explanation: 'False — earthworms are beneficial as they aerate soil and add nutrients.', points: 20, category: 'soil-health' },
    ],
  },
  {
    id: 'crop-management',
    name: 'Crop Management',
    description: 'Learn about effective crop cultivation techniques',
    icon: '🌾',
    questions: [
      { id: 'cm-q1', question: 'What is crop rotation?', type: 'multiple-choice', options: ['Planting the same crop repeatedly', 'Alternating different crops in sequence', 'Rotating crops during harvest', 'Moving crops to different fields'], correctAnswer: 1, explanation: 'Crop rotation involves alternating different crops in sequence to improve soil health.', points: 30, category: 'crop-management' },
      { id: 'cm-q2', question: 'Monoculture farming increases pest resistance.', type: 'true-false', options: ['True', 'False'], correctAnswer: 1, explanation: 'False — monoculture actually increases pest vulnerability and reduces biodiversity.', points: 25, category: 'crop-management' },
      { id: 'cm-q3', question: 'When is the best time to plant rice in most regions?', type: 'multiple-choice', options: ['Winter', 'Summer', 'Monsoon season', 'Autumn'], correctAnswer: 2, explanation: 'Rice is typically planted during monsoon season when water is abundant.', points: 25, category: 'crop-management' },
    ],
  },
  {
    id: 'irrigation',
    name: 'Irrigation & Water',
    description: 'Master water management and irrigation techniques',
    icon: '💧',
    questions: [
      { id: 'ir-q1', question: 'Which irrigation method is most water-efficient?', type: 'multiple-choice', options: ['Flood irrigation', 'Sprinkler irrigation', 'Drip irrigation', 'Furrow irrigation'], correctAnswer: 2, explanation: 'Drip irrigation is the most water-efficient method, delivering water directly to plant roots.', points: 30, category: 'irrigation' },
      { id: 'ir-q2', question: 'Early morning is the best time to irrigate crops.', type: 'true-false', options: ['True', 'False'], correctAnswer: 0, explanation: 'True — early morning irrigation reduces water loss through evaporation.', points: 20, category: 'irrigation' },
      { id: 'ir-q3', question: 'What percentage of water should soil retain for optimal crop growth?', type: 'multiple-choice', options: ['10-20%', '30-50%', '60-80%', '90-100%'], correctAnswer: 1, explanation: 'Soil should retain 30-50% water for optimal crop growth and root development.', points: 25, category: 'irrigation' },
    ],
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Learn organic and sustainable pest management',
    icon: '🐛',
    questions: [
      { id: 'pc-q1', question: 'What is integrated pest management (IPM)?', type: 'multiple-choice', options: ['Using only chemical pesticides', 'Combining multiple pest control strategies', 'Ignoring pests completely', 'Using only organic pesticides'], correctAnswer: 1, explanation: 'IPM combines biological, cultural, and chemical methods for sustainable pest control.', points: 30, category: 'pest-control' },
      { id: 'pc-q2', question: 'Neem oil is an effective organic pesticide.', type: 'true-false', options: ['True', 'False'], correctAnswer: 0, explanation: 'True — neem oil is a natural pesticide effective against many common pests.', points: 20, category: 'pest-control' },
      { id: 'pc-q3', question: 'Which of these is a beneficial insect for pest control?', type: 'multiple-choice', options: ['Aphid', 'Ladybug', 'Locust', 'Whitefly'], correctAnswer: 1, explanation: 'Ladybugs are beneficial insects that eat aphids and other harmful pests.', points: 25, category: 'pest-control' },
    ],
  },
];

export default function Quiz() {
  const router = useRouter();
  // ✅ Get translations
  const { t } = useLanguage();

  const [quizCategories, setQuizCategories] = useState<QuizCategory[]>(initialQuizCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
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

  const handleCategorySelect = useCallback(async (category: QuizCategory) => {
    setIsLoading(true);
    const freshQuizData = await fetchQuizByCategory(category.id);
    if (freshQuizData) setSelectedCategory(freshQuizData);
    else setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizComplete(false);
    setScore(0);
    setShowExplanation(false);
    setIsLoading(false);
  }, []);

  const handleAnswerSelect = useCallback((questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedCategory) return;
    if (showExplanation) {
      setShowExplanation(false);
      if (currentQuestionIndex < selectedCategory.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        handleSubmitQuiz();
      }
    } else {
      setShowExplanation(true);
    }
  }, [selectedCategory, currentQuestionIndex, showExplanation]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  }, [currentQuestionIndex]);

  const handleSubmitQuiz = useCallback(() => {
    if (!selectedCategory) return;
    let totalScore = 0;
    selectedCategory.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        totalScore += question.points;
      }
    });
    setScore(totalScore);
    setQuizComplete(true);
  }, [selectedCategory, selectedAnswers]);

  const handleRestartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizComplete(false);
    setScore(0);
    setShowExplanation(false);
  }, []);

  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizComplete(false);
    setScore(0);
    setShowExplanation(false);
  }, []);

  const getProgress = () => {
    if (!selectedCategory) return 0;
    return ((currentQuestionIndex + 1) / selectedCategory.questions.length) * 100;
  };

  const currentQuestion = selectedCategory?.questions[currentQuestionIndex];
  const isAnswerSelected = currentQuestion ? selectedAnswers[currentQuestion.id] !== undefined : false;

  const getTotalPossibleScore = () => {
    if (!selectedCategory) return 0;
    return selectedCategory.questions.reduce((sum, q) => sum + q.points, 0);
  };

  // ── Quiz Complete Screen ───────────────────────────────────────────────────
  if (quizComplete && selectedCategory) {
    const totalPossible = getTotalPossibleScore();
    const percentage = (score / totalPossible) * 100;
    const passed = percentage >= 70;

    return (
      <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToCategories} style={styles.headerButton}>
              {/* ✅ Translated */}
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
              {/* ✅ Translated result title */}
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
              {/* ✅ Translated result message */}
              <Text style={styles.resultMessage}>
                {passed ? t.quiz.excellentWork : t.quiz.goodEffort}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t.quiz.quizSummary}</Text>
              {selectedCategory.questions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                return (
                  <View key={question.id} style={styles.summaryItem}>
                    <View style={styles.summaryHeader}>
                      {/* ✅ Translated question label */}
                      <Text style={styles.summaryQuestionNumber}>
                        {t.quiz.question} {index + 1}
                      </Text>
                      <View style={[styles.badge, isCorrect ? styles.correctBadge : styles.incorrectBadge]}>
                        <Text style={styles.badgeText}>
                          {isCorrect ? t.quiz.correct : t.quiz.incorrect}
                        </Text>
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

  // ── Quiz Question Screen ───────────────────────────────────────────────────
  if (selectedCategory && currentQuestion) {
    const userAnswer = selectedAnswers[currentQuestion.id];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    return (
      <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToCategories} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>{t.quiz.back}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle}>{selectedCategory.name}</Text>
              <Text style={styles.headerSub}>
                {t.quiz.question} {currentQuestionIndex + 1} / {selectedCategory.questions.length}
              </Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${getProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(getProgress())}{t.quiz.percentComplete}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.categoryBadge}>{currentQuestion.category}</Text>
                <Text style={styles.pointsBadge}>+{currentQuestion.points} pts</Text>
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
                  {/* ✅ Translated correct/incorrect label */}
                  <Text style={styles.explanationTitle}>
                    {isCorrect ? t.quiz.correct : t.quiz.incorrect}
                  </Text>
                  <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
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
                style={[styles.navButton, styles.nextButton, !isAnswerSelected && !showExplanation && styles.navButtonDisabled]}
                onPress={handleNext}
                disabled={!isAnswerSelected && !showExplanation}
              >
                <Text style={[styles.navButtonText, styles.nextButtonText]}>
                  {showExplanation
                    ? currentQuestionIndex === selectedCategory.questions.length - 1
                      ? t.quiz.finish
                      : t.quiz.next
                    : t.quiz.checkAnswer}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Category Selection Screen ─────────────────────────────────────────────
  return (
    <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{t.quiz.back}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            {/* ✅ Translated header */}
            <Text style={styles.headerTitle}>{t.quiz.title}</Text>
            <Text style={styles.headerSub}>{t.quiz.subtitle}</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>{t.quiz.welcomeTitle}</Text>
            <Text style={styles.introText}>{t.quiz.welcomeText}</Text>
          </View>

          {/* ✅ Translated section title */}
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
                      {/* ✅ Translated questions count */}
                      <Text style={styles.categoryMetaText}>
                        {category.questions.length} {t.quiz.questions}
                      </Text>
                      <Text style={styles.categoryPoints}>+{totalPoints} pts</Text>
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
  headerButtonText: { color: '#10B981', fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 3, fontWeight: '500' },
  content: { padding: 20, paddingBottom: 40 },
  introCard: { backgroundColor: '#DBEAFE', padding: 20, borderRadius: 16, marginBottom: 28, borderWidth: 2, borderColor: '#93C5FD', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  introTitle: { fontSize: 20, fontWeight: '800', color: '#1E3A8A', marginBottom: 10, letterSpacing: -0.3 },
  introText: { fontSize: 15, color: '#1E40AF', lineHeight: 22, fontWeight: '500' },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 18, letterSpacing: -0.5 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, marginBottom: 14, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  categoryIcon: { width: 64, height: 64, backgroundColor: '#F0FDF4', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 2, borderColor: '#D1FAE5' },
  categoryIconText: { fontSize: 32 },
  categoryContent: { flex: 1 },
  categoryTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 5, letterSpacing: -0.2 },
  categoryDescription: { fontSize: 14, color: '#6B7280', marginBottom: 10, lineHeight: 19 },
  categoryMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryMetaText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  categoryPoints: { fontSize: 14, fontWeight: '800', color: '#10B981' },
  categoryArrow: { fontSize: 24, color: '#10B981', marginLeft: 10, fontWeight: 'bold' },
  progressContainer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  progressBarTrack: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: 10, backgroundColor: '#10B981', borderRadius: 5 },
  progressText: { fontSize: 13, color: '#6B7280', marginTop: 8, textAlign: 'center', fontWeight: '600' },
  questionCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, marginBottom: 24, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  categoryBadge: { fontSize: 13, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, fontWeight: '700' },
  pointsBadge: { fontSize: 14, color: '#10B981', fontWeight: '800', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  questionText: { fontSize: 19, fontWeight: '700', color: '#111827', marginBottom: 22, lineHeight: 28, letterSpacing: -0.3 },
  optionsContainer: { gap: 14 },
  optionButton: { backgroundColor: '#F9FAFB', padding: 18, borderRadius: 14, borderWidth: 2.5, borderColor: '#E5E7EB' },
  optionButtonSelected: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  optionButtonCorrect: { backgroundColor: '#D1FAE5', borderColor: '#10B981', shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  optionButtonIncorrect: { backgroundColor: '#FEE2E2', borderColor: '#EF4444', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
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
  explanationTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10, color: '#111827', letterSpacing: -0.2 },
  explanationText: { fontSize: 15, color: '#374151', lineHeight: 22, fontWeight: '500' },
  navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  navButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  navButtonDisabled: { opacity: 0.4 },
  nextButton: { backgroundColor: '#10B981', borderColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  navButtonText: { fontSize: 17, fontWeight: '700', color: '#374151' },
  navButtonTextDisabled: { color: '#9CA3AF' },
  nextButtonText: { color: '#FFFFFF' },
  resultCard: { backgroundColor: '#FFFFFF', padding: 28, borderRadius: 18, alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  resultEmoji: { fontSize: 72, marginBottom: 20 },
  resultTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 10, letterSpacing: -0.5 },
  resultSubtitle: { fontSize: 17, color: '#6B7280', marginBottom: 24, fontWeight: '600' },
  percentageContainer: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 4, borderColor: '#93C5FD', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  percentageText: { fontSize: 40, fontWeight: '900', color: '#1E40AF', letterSpacing: -1 },
  resultMessage: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  summaryCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  summaryTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 18, letterSpacing: -0.3 },
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
  primaryButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 14, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  secondaryButton: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 14, borderWidth: 2, borderColor: '#D1D5DB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  secondaryButtonText: { color: '#374151', fontSize: 17, fontWeight: '700' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  loadingText: { marginTop: 16, fontSize: 15, color: '#6B7280', fontWeight: '600' },
});