type RefreshFunction = () => Promise<void>;

class RefreshEngine {

    private refreshUserFn?: RefreshFunction;
    private refreshTasksFn?: RefreshFunction;

    registerUserRefresh(fn: RefreshFunction) {
        this.refreshUserFn = fn;
    }

    registerTaskRefresh(fn: RefreshFunction) {
        this.refreshTasksFn = fn;
    }

    async refreshUser() {
        if (this.refreshUserFn) {
            await this.refreshUserFn();
        }
    }

    async refreshTasks() {
        if (this.refreshTasksFn) {
            await this.refreshTasksFn();
        }
    }

    async refreshAll() {

        await Promise.all([
            this.refreshUser(),
            this.refreshTasks(),
        ]);

    }
}

export const refreshEngine = new RefreshEngine();