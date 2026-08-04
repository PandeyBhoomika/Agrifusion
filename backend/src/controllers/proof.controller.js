import { processActivity } from "../engines/activity.engine.js";
import Proof from "../models/Proof.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import UserCropTask from "../models/UserCropTask.js";

export const submitProof = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { taskId, location, userCropTaskId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "A valid logged-in user is required.",
      });
    }

    if (!taskId && !userCropTaskId) {
      return res.status(400).json({
        success: false,
        message: "taskId or userCropTaskId is required.",
      });
    }

    const photoFile = req.files?.photo?.[0];
    if (!photoFile) {
      return res.status(400).json({
        success: false,
        message: "A photo is required as proof.",
      });
    }

    const audioFile = req.files?.audio?.[0];

    let parsedLocation = {};
    if (location) {
      try {
        const loc = JSON.parse(location);
        parsedLocation = {
          lat: loc.lat,
          lon: loc.lon,
          capturedAt: loc.time ? new Date(loc.time) : new Date(),
        };
      } catch (err) {
        console.warn("Invalid location JSON");
      }
    }

    const newProof = await Proof.create({
      userId,
      taskId: taskId || null,
      userCropTaskId: userCropTaskId || null,
      proofUrl: `/uploads/proofs/${photoFile.filename}`,
      audioUrl: audioFile ? `/uploads/proofs/${audioFile.filename}` : "",
      location: parsedLocation,
    });

    if (userCropTaskId) {
      const row = await UserCropTask.findById(userCropTaskId).populate("taskId");
      if (row && row.userId.toString() === userId.toString() && row.status !== "approved") {
        row.status = "approved";
        row.completedAt = new Date();
        row.proofId = newProof._id;
        await row.save();

        await User.findByIdAndUpdate(userId, {
          $inc: {
            xp: row.taskId?.xpReward || 0,
            greenCoins: row.taskId?.coinReward || 0,
          },
        });

        newProof.status = "Approved";
        newProof.xpAwarded = row.taskId?.xpReward || 0;
        newProof.coinsAwarded = row.taskId?.coinReward || 0;
        await newProof.save();
      }
    } else if (taskId) {
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

          newProof.status = "Approved";
          newProof.xpAwarded = task.xpReward || 0;
          newProof.coinsAwarded = task.coinReward || 0;
          await newProof.save();
        }
      }
    }

    await processActivity("TASK_PROOF_APPROVED", { proofId: newProof._id });

    return res.status(201).json({
      success: true,
      message: "Proof submitted successfully.",
      data: newProof,
    });
  } catch (error) {
    console.error("Error submitting proof:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getPendingProofs = async (req, res) => {
  try {
    const proofs = await Proof.find({ status: "Pending" })
      .populate("userId", "fullName email")
      .populate("taskId", "title xpReward coinReward");

    return res.status(200).json({
      success: true,
      count: proofs.length,
      data: proofs,
    });
  } catch (error) {
    console.error("Error fetching proofs:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const reviewProof = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const proofId = req.params.id;

    const proof = await Proof.findById(proofId).populate("taskId");
    if (!proof) {
      return res.status(404).json({
        success: false,
        message: "Proof not found",
      });
    }

    proof.status = status;
    proof.feedback = feedback || "";

    if (status === "Approved") {
      const task = proof.taskId;
      proof.xpAwarded = task?.xpReward || 0;
      proof.coinsAwarded = task?.coinReward || 0;
      await User.findByIdAndUpdate(proof.userId, {
        $inc: { xp: task?.xpReward || 0, greenCoins: task?.coinReward || 0 },
      });
      await processActivity("TASK_PROOF_APPROVED", { proofId: proof._id });
    }

    await proof.save();
    return res.status(200).json({ success: true, data: proof });
  } catch (error) {
    console.error("Error reviewing proof:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};