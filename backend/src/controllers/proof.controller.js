import Proof from '../models/Proof.js';
import Task from '../models/Task.js';
import User from '../models/User.js'; // Assuming you are converting User.js to ES modules too

// Submit proof for a task
export const submitProof = async (req, res) => {
    try {
        const { userId, taskId, proofUrl } = req.body;

        const newProof = await Proof.create({
            userId,
            taskId,
            proofUrl,
        });

        res.status(201).json({ success: true, data: newProof });
    } catch (error) {
        console.error('Error submitting proof:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get all pending proofs (for Admin dashboard)
export const getPendingProofs = async (req, res) => {
    try {
        const proofs = await Proof.find({ status: 'Pending' })
            .populate('userId', 'fullName email') // Assuming you want basic user info
            .populate('taskId', 'title xpReward coinReward');

        res.status(200).json({ success: true, count: proofs.length, data: proofs });
    } catch (error) {
        console.error('Error fetching proofs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Review proof (Admin only - updates user XP/Coins if approved)
export const reviewProof = async (req, res) => {
    try {
        const { status, feedback } = req.body; // status must be 'Approved' or 'Rejected'
        const proofId = req.params.id;

        const proof = await Proof.findById(proofId).populate('taskId');

        if (!proof) {
            return res.status(404).json({ success: false, message: 'Proof not found' });
        }

        proof.status = status;
        proof.feedback = feedback || '';

        // If approved, award XP and Coins to the user
        if (status === 'Approved') {
            const task = proof.taskId;
            proof.xpAwarded = task.xpReward;
            proof.coinsAwarded = task.coinReward;

            // Find user and update their stats
            await User.findByIdAndUpdate(
                proof.userId,
                {
                    $inc: { xp: task.xpReward, greenCoins: task.coinReward }
                }
            );
        }

        await proof.save();
        res.status(200).json({ success: true, data: proof });

    } catch (error) {
        console.error('Error reviewing proof:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};