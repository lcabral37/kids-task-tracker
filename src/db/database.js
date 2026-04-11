import Dexie from "dexie";
// Setup Dexie database
class KidsTaskTrackerDB extends Dexie {
    constructor() {
        super("KidsTaskTrackerDB");
        Object.defineProperty(this, "children", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tasks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dailyEarnings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "syncQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.version(1).stores({
            children: "++id",
            tasks: "++id,childId",
            dailyEarnings: "++id",
            syncQueue: "++id",
        });
    }
}
const db = new KidsTaskTrackerDB();
export default db;
