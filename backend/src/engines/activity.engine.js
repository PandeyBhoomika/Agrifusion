import { approveProof } from "../services/verification.service.js";
import { completeTask } from "../services/reward.service.js";
import { updateMissionProgress } from "../services/mission.service.js";


import { createTaskActivity } from "../services/community.service.js";
import { refreshRecommendations } from "../services/learning.service.js";
import { updateLeaderboard } from "../services/leaderboard.service.js";
import { sendTaskApprovedNotification } from "../services/notification.service.js";

/**
 * ====================================================
 * AGRIFUSION ACTIVITY ENGINE
 * ====================================================
 */

async function processApprovedProof(payload) {

    const { proofId } = payload;

    // STEP 1
    const verification =
        await approveProof(proofId);

    const userId =
        verification.proof.userId;

    const taskId =
        verification.proof.taskId;

    // STEP 2
    const rewards =
        await completeTask(
            userId,
            taskId
        );

    // STEP 3
    const mission =
        await updateMissionProgress(
            userId,
            taskId
        );

    // STEP 4
    
    // STEP 5

   await Promise.all([
    createTaskActivity(
        userId,
        verification.proof
    ),

    updateLeaderboard(userId),

    sendTaskApprovedNotification(
        userId,
        verification.proof
    ),
]);

    // STEP 6

   //

    // STEP 7

    await updateLeaderboard(
        userId
    );

    // STEP 8

    await sendTaskApprovedNotification(
        userId,
        verification.proof
    );

    return {

        success: true,

        verification,

        rewards,

        mission,

        

    };

}

/**
 * ====================================================
 * EVENT REGISTRY
 * ====================================================
 */

const handlers = {

    TASK_PROOF_APPROVED:
        processApprovedProof,

};

export const processActivity = async (

    activity,

    payload

) => {

    const handler = handlers[activity];

    if (!handler) {

        throw new Error(

            `Unknown Activity ${activity}`

        );

    }

    return await handler(payload);

};