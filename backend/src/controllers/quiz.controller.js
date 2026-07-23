// controllers/quiz.controller.js
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

// ─── GET all quizzes (/api/quiz/all) ──────────────────────────────────────
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true });

    const mapped = quizzes.map(q => ({
      id: q.category,
      _id: q._id,
      name: q.title,
      description: `Test your knowledge about ${q.title.toLowerCase()}`,
      icon: getCategoryIcon(q.category),
      xpReward: q.xpReward,
      coinReward: q.coinReward,
      questions: q.questions.map(qq => ({
        id: qq._id,
        question: qq.questionText,
        type: qq.options.length === 2 ? 'true-false' : 'multiple-choice',
        options: qq.options,
        correctAnswer: qq.correctAnswerIndex,
        explanation: '',
        points: Math.floor(q.xpReward / q.questions.length),
        category: q.category,
        difficulty: qq.difficulty || 'medium',
      })),
    }));

    res.status(200).json({ success: true, quizzes: mapped });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── GET quiz by category (/api/quiz/:categoryId) ─────────────────────────
export const getQuizByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const quiz = await Quiz.findOne({ category: categoryId, isActive: true });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const mapped = {
      id: quiz.category,
      _id: quiz._id,
      name: quiz.title,
      description: `Test your knowledge about ${quiz.title.toLowerCase()}`,
      icon: getCategoryIcon(quiz.category),
      xpReward: quiz.xpReward,
      coinReward: quiz.coinReward,
      questions: quiz.questions.map(qq => ({
        id: qq._id,
        question: qq.questionText,
        type: qq.options.length === 2 ? 'true-false' : 'multiple-choice',
        options: qq.options,
        correctAnswer: qq.correctAnswerIndex,
        explanation: '',
        points: Math.floor(quiz.xpReward / quiz.questions.length),
        category: quiz.category,
        difficulty: qq.difficulty || 'medium',
      })),
    };

    res.status(200).json({ success: true, quiz: mapped });
  } catch (error) {
    console.error('Error fetching quiz by category:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── SUBMIT quiz (/api/quiz/:id/submit) ───────────────────────────────────
export const submitQuiz = async (req, res) => {
  try {
    console.log('🎯 submitQuiz called - params:', req.params, '- body:', req.body); // ✅ DEBUG

    const userId = req.user.userId || req.user._id;
    const { passed, score, totalPoints, percentage, difficulty, categoryName } = req.body;
    const quizId = req.params.id;

    console.log('👤 userId:', userId, '| quizId:', quizId); // ✅ DEBUG

    // Try finding by MongoDB _id first, then by category string
    let quiz = null;
    try {
      quiz = await Quiz.findById(quizId);
    } catch (e) {
      quiz = null;
    }
    if (!quiz) {
      quiz = await Quiz.findOne({ category: quizId });
    }

    console.log('📚 quiz found:', quiz?.title || 'NOT FOUND'); // ✅ DEBUG

    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const xpEarned = passed ? quiz.xpReward : 0;
    const coinsEarned = passed ? quiz.coinReward : 0;

    const historyEntry = {
      quizId: quiz._id,
      category: quiz.category,
      categoryName: categoryName || quiz.title,
      difficulty: difficulty || 'medium',
      score: score || 0,
      totalPoints: totalPoints || 0,
      percentage: percentage || 0,
      passed: passed || false,
      xpEarned,
      coinsEarned,
      completedAt: new Date(),
    };

    console.log('📝 saving history entry:', historyEntry); // ✅ DEBUG

    if (passed) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { xp: xpEarned, greenCoins: coinsEarned },
          $push: { quizHistory: historyEntry },
        },
        { new: true }
      );
      console.log('✅ history saved for passed quiz, user:', updatedUser?.email); // ✅ DEBUG
      return res.status(200).json({
        success: true,
        message: `Quiz passed! Earned ${xpEarned} XP and ${coinsEarned} Green Coins.`,
        data: updatedUser,
      });
    }

    // Failed — still save history
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { quizHistory: historyEntry } },
      { new: true }
    );
    console.log('✅ history saved for failed quiz, user:', updatedUser?.email); // ✅ DEBUG

    res.status(200).json({
      success: true,
      message: 'Quiz completed! Keep practicing to earn rewards.',
    });
  } catch (error) {
    console.error('❌ Error submitting quiz:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── GET quiz history (/api/quiz/history) ─────────────────────────────────
export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    console.log('📋 getQuizHistory called for userId:', userId); // ✅ DEBUG

    const user = await User.findById(userId).select('quizHistory');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const history = [...(user.quizHistory || [])].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    console.log('📋 history count:', history.length); // ✅ DEBUG
    res.json({ success: true, data: history, history: history });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── Helper ───────────────────────────────────────────────────────────────
function getCategoryIcon(category) {
  const icons = {
    'soil-health': '🌱',
    'crop-management': '🌾',
    'irrigation': '💧',
    'pest-control': '🐛',
    'sustainable-farming': '♻️',
  };
  return icons[category] || '📚';
}
