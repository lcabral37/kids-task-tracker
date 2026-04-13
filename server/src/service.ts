import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll, Child, TaskTemplate, TaskOccurrence, SyncData, TaskType } from './database.js';

// Children operations
export const createChild = async (child: Omit<Child, 'id'>): Promise<Child> => {
    const id = uuidv4();
    await dbRun(
        `INSERT INTO children (id, name, age, pin, manualAdjustment) VALUES (?, ?, ?, ?, ?)`,
        [id, child.name, child.age, child.pin || null, child.manualAdjustment || 0]
    );
    return { id, ...child, manualAdjustment: child.manualAdjustment || 0 };
};

export const getChild = async (id: string): Promise<Child | undefined> => {
    return dbGet<Child>(`SELECT * FROM children WHERE id = ?`, [id]);
};

export const getAllChildren = async (): Promise<Child[]> => {
    return dbAll<Child>(`SELECT * FROM children ORDER BY createdAt ASC`);
};

export const updateChild = async (id: string, updates: Partial<Child>): Promise<void> => {
    const fields: string[] = [];
    const values: any[] = [];

    if ('name' in updates) {
        fields.push('name = ?');
        values.push(updates.name);
    }
    if ('age' in updates) {
        fields.push('age = ?');
        values.push(updates.age);
    }
    if ('pin' in updates) {
        fields.push('pin = ?');
        values.push(updates.pin || null);
    }
    if ('manualAdjustment' in updates) {
        fields.push('manualAdjustment = ?');
        values.push(updates.manualAdjustment);
    }

    if (fields.length === 0) return;

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await dbRun(
        `UPDATE children SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
};

export const deleteChild = async (id: string): Promise<void> => {
    await dbRun(`DELETE FROM children WHERE id = ?`, [id]);
};

// Task Templates operations
export const createTaskTemplate = async (template: Omit<TaskTemplate, 'id' | 'order'>): Promise<TaskTemplate> => {
    const id = uuidv4();
    // Get max order for this type
    const result = await dbGet<{ maxOrder: number; }>(
        `SELECT MAX("order") as maxOrder FROM taskTemplates WHERE type = ?`,
        [template.type]
    );
    const order = (result?.maxOrder ?? -1) + 1;

    await dbRun(
        `INSERT INTO taskTemplates (id, title, description, amount, type, icon, "order") VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, template.title, template.description || null, template.amount, template.type, template.icon || null, order]
    );

    return { id, ...template, order };
};

export const getTaskTemplate = async (id: string): Promise<TaskTemplate | undefined> => {
    return dbGet<TaskTemplate>(`SELECT * FROM taskTemplates WHERE id = ?`, [id]);
};

export const getTaskTemplatesByType = async (type: TaskType): Promise<TaskTemplate[]> => {
    return dbAll<TaskTemplate>(
        `SELECT * FROM taskTemplates WHERE type = ? ORDER BY "order" ASC`,
        [type]
    );
};

export const getAllTaskTemplates = async (): Promise<TaskTemplate[]> => {
    return dbAll<TaskTemplate>(`SELECT * FROM taskTemplates ORDER BY type, "order" ASC`);
};

export const updateTaskTemplate = async (id: string, updates: Partial<TaskTemplate>): Promise<void> => {
    const fields: string[] = [];
    const values: any[] = [];

    if ('title' in updates) {
        fields.push('title = ?');
        values.push(updates.title);
    }
    if ('description' in updates) {
        fields.push('description = ?');
        values.push(updates.description || null);
    }
    if ('amount' in updates) {
        fields.push('amount = ?');
        values.push(updates.amount);
    }
    if ('icon' in updates) {
        fields.push('icon = ?');
        values.push(updates.icon || null);
    }
    if ('order' in updates) {
        fields.push('"order" = ?');
        values.push(updates.order);
    }

    if (fields.length === 0) return;

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await dbRun(
        `UPDATE taskTemplates SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
};

export const deleteTaskTemplate = async (id: string): Promise<void> => {
    await dbRun(`DELETE FROM taskTemplates WHERE id = ?`, [id]);
};

export const reorderTaskTemplates = async (type: TaskType, orderedIds: string[]): Promise<void> => {
    for (let i = 0; i < orderedIds.length; i++) {
        await dbRun(
            `UPDATE taskTemplates SET "order" = ? WHERE id = ? AND type = ?`,
            [i, orderedIds[i], type]
        );
    }
};

// Task Occurrences operations
export const createTaskOccurrence = async (occurrence: Omit<TaskOccurrence, 'id'>): Promise<TaskOccurrence> => {
    const id = uuidv4();
    await dbRun(
        `INSERT OR REPLACE INTO taskOccurrences (id, templateId, childId, date, completionCount) VALUES (?, ?, ?, ?, ?)`,
        [id, occurrence.templateId, occurrence.childId, occurrence.date, occurrence.completionCount || 0]
    );

    return { id, ...occurrence };
};

export const getTaskOccurrence = async (id: string): Promise<TaskOccurrence | undefined> => {
    return dbGet<TaskOccurrence>(`SELECT * FROM taskOccurrences WHERE id = ?`, [id]);
};

export const getOccurrencesForDate = async (childId: string, date: string): Promise<TaskOccurrence[]> => {
    return dbAll<TaskOccurrence>(
        `SELECT * FROM taskOccurrences WHERE childId = ? AND date = ?`,
        [childId, date]
    );
};

export const getOccurrencesForChild = async (childId: string): Promise<TaskOccurrence[]> => {
    return dbAll<TaskOccurrence>(
        `SELECT * FROM taskOccurrences WHERE childId = ? ORDER BY date DESC`,
        [childId]
    );
};

export const updateTaskOccurrence = async (id: string, completionCount: number): Promise<void> => {
    await dbRun(
        `UPDATE taskOccurrences SET completionCount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [completionCount, id]
    );
};

export const deleteTaskOccurrence = async (id: string): Promise<void> => {
    await dbRun(`DELETE FROM taskOccurrences WHERE id = ?`, [id]);
};

// Sync operations
export const getSyncData = async (childId: string): Promise<SyncData> => {
    const children = await getAllChildren();
    const taskTemplates = await getAllTaskTemplates();
    const occurrences = await getOccurrencesForChild(childId);

    return {
        children,
        taskTemplates,
        occurrences,
        version: 3,
    };
};

export const updateSyncLog = async (childId: string): Promise<void> => {
    const existing = await dbGet(`SELECT * FROM syncLog WHERE childId = ?`, [childId]);
    if (existing) {
        await dbRun(`UPDATE syncLog SET lastSyncAt = CURRENT_TIMESTAMP WHERE childId = ?`, [childId]);
    } else {
        const id = uuidv4();
        await dbRun(
            `INSERT INTO syncLog (id, childId) VALUES (?, ?)`,
            [id, childId]
        );
    }
};

export const bulkUpsertData = async (data: SyncData): Promise<void> => {
    // Upsert children
    for (const child of data.children) {
        const existing = await getChild(child.id);
        if (existing) {
            await updateChild(child.id, child);
        } else {
            await createChild(child);
        }
    }

    // Upsert task templates
    for (const template of data.taskTemplates) {
        const existing = await getTaskTemplate(template.id);
        if (existing) {
            await updateTaskTemplate(template.id, template);
        } else {
            // Insert directly to preserve ID
            await dbRun(
                `INSERT OR REPLACE INTO taskTemplates (id, title, description, amount, type, icon, "order") VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [template.id, template.title, template.description || null, template.amount, template.type, template.icon || null, template.order]
            );
        }
    }

    // Upsert occurrences
    for (const occurrence of data.occurrences) {
        await dbRun(
            `INSERT OR REPLACE INTO taskOccurrences (id, templateId, childId, date, completionCount) VALUES (?, ?, ?, ?, ?)`,
            [occurrence.id, occurrence.templateId, occurrence.childId, occurrence.date, occurrence.completionCount]
        );
    }
};
