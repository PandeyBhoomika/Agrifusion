import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

// Get all active quizzes
export const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isActive: true });
        // In a real app, you might want to exclude the `correctAnswerIndex` here 
        // so users can't cheat by looking at the network tab!
        res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Submit quiz and award XP / Coins
export const submitQuiz = async (req, res) => {
    try {
        // The frontend sends the user's ID and whether they passed
        const userId = req.user.userId;     // from the verified token, not the client
        const { passed } = req.body;
        const quizId = req.params.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        if (passed) {
            // Award XP and Coins to the user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $inc: { xp: quiz.xpReward, greenCoins: quiz.coinReward } },
                { new: true } // Return the updated user document
            );

            return res.status(200).json({
                success: true,
                message: `Quiz passed! Earned ${quiz.xpReward} XP and ${quiz.coinReward} Green Coins.`,
                data: updatedUser
            });
        }

        // If they didn't pass, no rewards
        res.status(200).json({
            success: true,
            message: 'Quiz completed but score was not high enough for rewards. Try again!'
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};