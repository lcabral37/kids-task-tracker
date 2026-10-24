import db, { type SyncQueue } from "../db/database";

export type SyncEntry = Omit<SyncQueue, "id">;

// Entries live in the syncQueue table, so changes made offline survive a reload. They're sent
// oldest first and each is removed only once it was sent; a failure stops the flush and keeps
// the rest, so a later change is never applied before an earlier one.
class SyncService {
	async addAction(entry: SyncEntry): Promise<void> {
		await db.syncQueue.add(entry);
	}

	async executeActions(
		send: (entry: SyncEntry) => Promise<void>,
	): Promise<number> {
		let sent = 0;
		for (const { id, ...entry } of await db.syncQueue.orderBy("id").toArray()) {
			try {
				await send(entry);
			} catch (error) {
				console.error("Sync stopped; will retry later:", error);
				break;
			}
			await db.syncQueue.delete(id as number);
			sent++;
		}
		return sent;
	}

	async clearQueue(): Promise<void> {
		await db.syncQueue.clear();
	}
}

export default SyncService;
