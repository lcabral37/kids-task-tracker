// syncService.ts
/**
 * SyncService is responsible for managing the offline action queue.
 */
class SyncService {
    constructor() {
        Object.defineProperty(this, "actionQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.actionQueue = [];
    }
    /**
     * Add an action to the queue.
     * @param action The action to be added to the queue.
     */
    addAction(action) {
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
