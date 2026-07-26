import { appEngine } from "./app.engine";

/**
 * =====================================================
 * FRONTEND ACTIVITY ENGINE
 * =====================================================
 */

class ActivityEngine {

    async process(activity: string, payload?: any) {

        switch (activity) {

            case "TASK_PROOF_APPROVED":

                await appEngine.taskApproved();

                break;

            case "LOGIN_SUCCESS":

                await appEngine.loginSuccess();

                break;

            default:

                console.log("Unknown activity", activity);

        }

    }

}

export const activityEngine =
    new ActivityEngine();