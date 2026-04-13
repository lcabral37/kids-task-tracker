import { Child, TaskTemplate, TaskOccurrence, SyncData } from '../store/taskStore';

// Configure the backend URL - can be overridden
let BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const setBackendUrl = (url: string) => {
    BACKEND_URL = url;
};

export const getBackendUrl = () => BACKEND_URL;

// API error handling
class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new ApiError(response.status, error.error || response.statusText);
    }
    return response.json();
};

// Children API
export const childrenApi = {
    list: async (): Promise<Child[]> => {
        const response = await fetch(`${BACKEND_URL}/api/children`);
        return handleResponse(response);
    },

    create: async (child: Omit<Child, 'id' | 'manualAdjustment'>): Promise<Child> => {
        const response = await fetch(`${BACKEND_URL}/api/children`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(child),
        });
        return handleResponse(response);
    },

    get: async (id: string): Promise<Child> => {
        const response = await fetch(`${BACKEND_URL}/api/children/${id}`);
        return handleResponse(response);
    },

    update: async (id: string, updates: Partial<Child>): Promise<Child> => {
        const response = await fetch(`${BACKEND_URL}/api/children/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${BACKEND_URL}/api/children/${id}`, {
            method: 'DELETE',
        });
        await handleResponse(response);
    },

    verifyPin: async (id: string, pin: string): Promise<boolean> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/children/${id}/verify-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
            });
            const result = await handleResponse(response);
            return result.verified;
        } catch (error) {
            return false;
        }
    },
};

// Task Templates API
export const taskTemplatesApi = {
    list: async (): Promise<TaskTemplate[]> => {
        const response = await fetch(`${BACKEND_URL}/api/task-templates`);
        return handleResponse(response);
    },

    listByType: async (type: 'earning' | 'spending'): Promise<TaskTemplate[]> => {
        const response = await fetch(`${BACKEND_URL}/api/task-templates/type/${type}`);
        return handleResponse(response);
    },

    create: async (template: Omit<TaskTemplate, 'id' | 'order'>): Promise<TaskTemplate> => {
        const response = await fetch(`${BACKEND_URL}/api/task-templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(template),
        });
        return handleResponse(response);
    },

    update: async (id: string, updates: Partial<TaskTemplate>): Promise<TaskTemplate> => {
        const response = await fetch(`${BACKEND_URL}/api/task-templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${BACKEND_URL}/api/task-templates/${id}`, {
            method: 'DELETE',
        });
        await handleResponse(response);
    },

    reorder: async (type: 'earning' | 'spending', orderedIds: string[]): Promise<void> => {
        const response = await fetch(`${BACKEND_URL}/api/task-templates/reorder/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderedIds }),
        });
        await handleResponse(response);
    },
};

// Task Occurrences API
export const occurrencesApi = {
    listForDate: async (childId: string, date: string): Promise<TaskOccurrence[]> => {
        const response = await fetch(`${BACKEND_URL}/api/occurrences/${childId}/${date}`);
        return handleResponse(response);
    },

    listForChild: async (childId: string): Promise<TaskOccurrence[]> => {
        const response = await fetch(`${BACKEND_URL}/api/occurrences/${childId}`);
        return handleResponse(response);
    },

    create: async (occurrence: Omit<TaskOccurrence, 'id'>): Promise<TaskOccurrence> => {
        const response = await fetch(`${BACKEND_URL}/api/occurrences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(occurrence),
        });
        return handleResponse(response);
    },

    update: async (id: string, completionCount: number): Promise<TaskOccurrence> => {
        const response = await fetch(`${BACKEND_URL}/api/occurrences/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completionCount }),
        });
        return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${BACKEND_URL}/api/occurrences/${id}`, {
            method: 'DELETE',
        });
        await handleResponse(response);
    },
};

// Sync API - Main sync endpoint
export const syncApi = {
    // Push local data to backend
    push: async (childId: string, data: SyncData): Promise<SyncData> => {
        const response = await fetch(`${BACKEND_URL}/api/sync/${childId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data }),
        });
        return handleResponse(response);
    },

    // Pull data from backend
    pull: async (childId: string): Promise<SyncData> => {
        const response = await fetch(`${BACKEND_URL}/api/sync/${childId}`);
        return handleResponse(response);
    },

    // Check if backend is available
    isAvailable: async (): Promise<boolean> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000), // 2 second timeout
            });
            return response.ok;
        } catch {
            return false;
        }
    },
};

// Helper to check backend connectivity
export const checkBackendConnectivity = async (): Promise<boolean> => {
    try {
        return await syncApi.isAvailable();
    } catch {
        return false;
    }
};
