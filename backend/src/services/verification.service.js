import Proof from "../models/Proof.js";

/**
 * ============================================================
 * VERIFICATION SERVICE
 * ============================================================
 *
 * ONLY responsible for:
 * - Approving proofs
 * - Rejecting proofs
 * - AI verification (future)
 *
 * It DOES NOT:
 * - Award XP
 * - Award Coins
 * - Update Missions
 * - Update Dashboard
 * - Update Community
 *
 * Those responsibilities belong to the Activity Engine.
 *
 * ============================================================
 */

/**
 * Approve a submitted proof.
 */
export const approveProof = async (proofId, reviewerId = null) => {
  const proof = await Proof.findById(proofId);

  if (!proof) {
    throw new Error("Proof not found.");
  }

  if (proof.status === "Approved") {
    return {
      success: false,
      message: "Proof has already been approved.",
    };
  }

  proof.status = "Approved";
  proof.reviewedAt = new Date();

  if (reviewerId) {
    proof.reviewedBy = reviewerId;
  }

  await proof.save();

  return {
    success: true,
    proof,
  };
};

/**
 * Reject a submitted proof.
 */
export const rejectProof = async (
  proofId,
  feedback = "",
  reviewerId = null
) => {
  const proof = await Proof.findById(proofId);

  if (!proof) {
    throw new Error("Proof not found.");
  }

  if (proof.status === "Rejected") {
    return {
      success: false,
      message: "Proof has already been rejected.",
    };
  }

  proof.status = "Rejected";
  proof.feedback = feedback;
  proof.reviewedAt = new Date();

  if (reviewerId) {
    proof.reviewedBy = reviewerId;
  }

  await proof.save();

  return {
    success: true,
    proof,
  };
};

/**
 * Placeholder for future AI Verification.
 */
export const verifyWithAI = async (proofId) => {
  return {
    success: false,
    message: "AI verification is not implemented yet.",
    proofId,
  };
};