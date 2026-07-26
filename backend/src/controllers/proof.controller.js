import { processActivity } from "../engines/activity.engine.js";
import Proof from "../models/Proof.js";

// ============================================================
// Submit Proof
// ============================================================

export const submitProof = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId, location } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "A valid logged-in user is required.",
      });
    }

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "taskId is required.",
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
          capturedAt: loc.time
            ? new Date(loc.time)
            : new Date(),
        };
      } catch (err) {
        console.warn("Invalid location JSON");
      }
    }

    // Create Proof
    const newProof = await Proof.create({
      userId,
      taskId,
      proofUrl: `/uploads/proofs/${photoFile.filename}`,
      audioUrl: audioFile
        ? `/uploads/proofs/${audioFile.filename}`
        : "",
      location: parsedLocation,
    });

    // Temporary: Auto approve until AI/Admin verification is added
    await processActivity("TASK_PROOF_APPROVED", {
      proofId: newProof._id,
    });

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

// ============================================================
// Get Pending Proofs
// ============================================================

export const getPendingProofs = async (req, res) => {
  try {
    const proofs = await Proof.find({
      status: "Pending",
    })
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

// ============================================================
// Review Proof (Future Admin Panel)
// ============================================================

export const reviewProof = async (req, res) => {
  try {

    const { status, feedback } = req.body;

    const proof = await Proof.findById(req.params.id);

    if (!proof) {
      return res.status(404).json({
        success: false,
        message: "Proof not found",
      });
    }

    if (status === "Approved") {

      await processActivity("TASK_PROOF_APPROVED", {
        proofId: proof._id,
      });

    } else {

      proof.status = "Rejected";
      proof.feedback = feedback || "";

      await proof.save();

    }

    return res.status(200).json({
      success: true,
      data: proof,
    });

  } catch (error) {
    console.error("Error reviewing proof:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};