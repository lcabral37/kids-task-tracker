// syncService.ts

/**
 * SyncService is responsible for managing the offline action queue.
 */
class SyncService {
    private actionQueue: Function[];

    constructor() {
        this.actionQueue = [];
    }

    /**
     * Add an action to the queue.
     * @param action The action to be added to the queue.
     */
    addAction(action: Function) {
        this.actionQueue.push(action);
    }

    /**
     * Execute all actions in the queue.
     */
    executeActions() {
        while (this.actionQueue.length) {
            const action = this.actionQueue.shift();
            if (action) {
                action();
            }
        }
    }

    /**
     * Clear the action queue.
     */
    clearQueue() {
        this.actionQueue = [];
    }
}

export default SyncService;
