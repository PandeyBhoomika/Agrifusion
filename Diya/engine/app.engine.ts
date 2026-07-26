import { userService } from "../services/userService";
import { taskService } from "../services/taskService";

/**
 * =====================================================
 * AGRIFUSION APP ENGINE
 * =====================================================
 *
 * Coordinates frontend state.
 *
 * It NEVER stores data.
 *
 * It only tells contexts when to refresh.
 *
 * =====================================================
 */

class AppEngine {

    /**
     * App Startup
     */

    async initialize() {

        console.log("Initializing Agrifusion...");

    }

    /**
     * Called after login
     */

    async loginSuccess() {

        console.log("Login Success");

        await this.refreshApplication();

    }

    /**
     * Called after proof approval
     */

    async taskApproved() {

        console.log("Task Approved");

        await this.refreshApplication();

    }

    /**
     * Refresh everything
     */

    async refreshApplication() {

        console.log("Refreshing application...");

    }

}

export const appEngine = new AppEngine();