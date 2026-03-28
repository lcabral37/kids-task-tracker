import Dexie, { Table } from 'dexie';

// Define TypeScript interfaces
interface Child {
    id?: number; // optional primary key 
    name: string;
    age: number;
}

interface Task {
    id?: number; // optional primary key 
    title: string;
    description: string;
    isCompleted: boolean;
    childId: number; // Foreign key to Child
}

interface DailyEarnings {
    id?: number; // optional primary key 
    date: string;
    amount: number;
}

interface SyncQueue {
    id?: number; // optional primary key 
    entity: string;
    action: string;
    payload: object;
}

// Setup Dexie database
class KidsTaskTrackerDB extends Dexie {
    children!: Table<Child>;
    tasks!: Table<Task>;
    dailyEarnings!: Table<DailyEarnings>;
    syncQueue!: Table<SyncQueue>;

    constructor() {
        super('KidsTaskTrackerDB');
        this.version(1).stores({
            children: '++id',
            tasks: '++id,childId',
            dailyEarnings: '++id',
            syncQueue: '++id'
        });
    }
}

const db = new KidsTaskTrackerDB();

export default db;