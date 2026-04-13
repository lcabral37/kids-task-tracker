import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import os from 'os';
import { initDatabase, closeDatabase } from './database.js';
import * as service from './service.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Routes

// Health check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Children endpoints
app.get('/api/children', async (req: Request, res: Response) => {
    try {
        const children = await service.getAllChildren();
        res.json(children);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.post('/api/children', async (req: Request, res: Response) => {
    try {
        const child = await service.createChild(req.body);
        res.status(201).json(child);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

app.get('/api/children/:id', async (req: Request, res: Response) => {
    try {
        const child = await service.getChild(req.params.id);
        if (!child) {
            res.status(404).json({ error: 'Child not found' });
            return;
        }
        res.json(child);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.put('/api/children/:id', async (req: Request, res: Response) => {
    try {
        await service.updateChild(req.params.id, req.body);
        const child = await service.getChild(req.params.id);
        res.json(child);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

app.delete('/api/children/:id', async (req: Request, res: Response) => {
    try {
        await service.deleteChild(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

// Task Templates endpoints
app.get('/api/task-templates', async (req: Request, res: Response) => {
    try {
        const templates = await service.getAllTaskTemplates();
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.get('/api/task-templates/type/:type', async (req: Request, res: Response) => {
    try {
        const templates = await service.getTaskTemplatesByType(req.params.type as 'earning' | 'spending');
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.post('/api/task-templates', async (req: Request, res: Response) => {
    try {
        const template = await service.createTaskTemplate(req.body);
        res.status(201).json(template);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

app.put('/api/task-templates/:id', async (req: Request, res: Response) => {
    try {
        await service.updateTaskTemplate(req.params.id, req.body);
        const template = await service.getTaskTemplate(req.params.id);
        res.json(template);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

app.delete('/api/task-templates/:id', async (req: Request, res: Response) => {
    try {
        await service.deleteTaskTemplate(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

app.post('/api/task-templates/reorder/:type', async (req: Request, res: Response) => {
    try {
        const { orderedIds } = req.body;
        await service.reorderTaskTemplates(req.params.type as 'earning' | 'spending', orderedIds);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

// Task Occurrences endpoints
app.get('/api/occurrences/:childId/:date', async (req: Request, res: Response) => {
    try {
        const occurrences = await service.getOccurrencesForDate(req.params.childId, req.params.date);
        res.json(occurrences);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.get('/api/occurrences/:childId', async (req: Request, res: Response) => {
    try {
        const occurrences = await service.getOccurrencesForChild(req.params.childId);
        res.json(occurrences);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.post('/api/occurrences', async (req: Request, res: Response) => {
    try {
        const occurrence = await service.createTaskOccurrence(req.body);
        res.status(201).json(occurrence);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

app.put('/api/occurrences/:id', async (req: Request, res: Response) => {
    try {
        const { completionCount } = req.body;
        await service.updateTaskOccurrence(req.params.id, completionCount);
        const occurrence = await service.getTaskOccurrence(req.params.id);
        res.json(occurrence);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

app.delete('/api/occurrences/:id', async (req: Request, res: Response) => {
    try {
        await service.deleteTaskOccurrence(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

// Sync endpoint - Main data sync
app.post('/api/sync/:childId', async (req: Request, res: Response) => {
    try {
        const { childId } = req.params;
        const { data } = req.body;

        // Bulk upsert all data (including child creation/update)
        if (data) {
            await service.bulkUpsertData(data);
        }

        // Update sync log
        await service.updateSyncLog(childId);

        // Return full sync data
        const syncData = await service.getSyncData(childId);
        res.json(syncData);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

// Get sync data for a child
app.get('/api/sync/:childId', async (req: Request, res: Response) => {
    try {
        const { childId } = req.params;

        // Verify child exists
        const child = await service.getChild(childId);
        if (!child) {
            res.status(404).json({ error: 'Child not found' });
            return;
        }

        const syncData = await service.getSyncData(childId);
        res.json(syncData);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// PIN verification endpoint
app.post('/api/children/:id/verify-pin', async (req: Request, res: Response) => {
    try {
        const { pin } = req.body;
        const child = await service.getChild(req.params.id);

        if (!child) {
            res.status(404).json({ error: 'Child not found' });
            return;
        }

        if (!child.pin) {
            res.json({ verified: true, message: 'No PIN set' });
            return;
        }

        if (pin === child.pin) {
            res.json({ verified: true });
        } else {
            res.status(401).json({ verified: false, error: 'Invalid PIN' });
        }
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Start server
const startServer = async () => {
    try {
        console.log('🚀 Initializing database...');
        await initDatabase();
        console.log('✅ Database initialized');

        app.listen(PORT, '0.0.0.0', () => {
            // Get external IP
            const interfaces = os.networkInterfaces();
            let externalIp = 'localhost';
            
            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    // Skip internal and non-IPv4 addresses
                    if (iface.family === 'IPv4' && !iface.internal) {
                        externalIp = iface.address;
                        break;
                    }
                }
            }

            console.log(`\n🎯 Kids Task Tracker Server running`);
            console.log(`   Local:    http://localhost:${PORT}`);
            console.log(`   External: http://${externalIp}:${PORT}`);
            console.log(`📍 API endpoints:`);
            console.log(`   GET  /api/health - Health check`);
            console.log(`   GET  /api/children - List all children`);
            console.log(`   POST /api/sync/:childId - Sync child data`);
            console.log(`   POST /api/children/:id/verify-pin - Verify child PIN\n`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

startServer();
