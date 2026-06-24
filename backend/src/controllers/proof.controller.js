import Proof from '../models/Proof.js';
import Task from '../models/Task.js';
import User from '../models/User.js'; // Assuming you are converting User.js to ES modules too

// Submit proof for a task
export const submitProof = async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId;
        const { taskId, location } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'A valid logged-in user is required to submit proof.' });
        }
        if (!taskId) {
            return res.status(400).json({ success: false, message: 'taskId is required.' });
        }
        const photoFile = req.files?.photo?.[0];
        if (!photoFile) {
            return res.status(400).json({ success: false, message: 'A photo is required as proof.' });
        }
        const audioFile = req.files?.audio?.[0];

        let parsedLocation = {};
        if (location) {
            try {
                const loc = JSON.parse(location);
                parsedLocation = { lat: loc.lat, lon: loc.lon, capturedAt: loc.time ? new Date(loc.time) : new Date() };
            } catch {}
        }

        const newProof = await Proof.create({
            userId,
            taskId,
            proofUrl: `/uploads/proofs/${photoFile.filename}`,
            audioUrl: audioFile ? `/uploads/proofs/${audioFile.filename}` : '',
            location: parsedLocation,
        });

        // ✅ Auto-approve for now (per project decision) — no manual review yet.
        // This grants XP/coins immediately and unlocks the next stage task.
        const task = await Task.findById(taskId);
        if (task) {
            const alreadyApproved = task.completedBy.some((entry) => entry.userId.toString() === userId.toString());
            if (!alreadyApproved) {
                task.completedBy.push({ userId, completedAt: new Date() });
                await task.save();

                await User.findByIdAndUpdate(userId, {
                    $inc: {
                        xp: task.xpReward || 0,
                        greenCoins: task.coinReward || 0,
                    },
                });

                newProof.status = 'Approved';
                newProof.xpAwarded = task.xpReward || 0;
                newProof.coinsAwarded = task.coinReward || 0;
                await newProof.save();
            }
        }

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