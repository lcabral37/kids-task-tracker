import React, { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';

const HistoryView: React.FC = () => {
    const store = useTaskStore();
    const activeChildId = store.activeChildId;

    const history = useMemo(() => {
        if (!activeChildId) return { dailyStats: {}, sortedDates: [] };

        const dailyStats: Record<string, { earned: number; spent: number; details: any[] }> = {};

        const childOccurrences = store.occurrences.filter((o) => o.childId === activeChildId);

        childOccurrences.forEach((occurrence) => {
            if (occurrence.completionCount > 0) {
                const template = store.taskTemplates.find((t) => t.id === occurrence.templateId);
                if (!template) return;

                if (!dailyStats[occurrence.date]) {
                    dailyStats[occurrence.date] = { earned: 0, spent: 0, details: [] };
                }

                const amount = template.amount * occurrence.completionCount;
                if (template.type === 'earning') {
                    dailyStats[occurrence.date].earned += amount;
                } else {
                    dailyStats[occurrence.date].spent += amount;
                }

                dailyStats[occurrence.date].details.push({
                    title: template.title,
                    type: template.type,
                    amount: amount,
                    count: occurrence.completionCount,
                });
            }
        });

        const sortedDates = Object.keys(dailyStats).sort().reverse();
        return { dailyStats, sortedDates };
    }, [store.occurrences, store.taskTemplates, activeChildId]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Transaction History</h2>

                {activeChildId === null ? (
                    <p className="text-gray-500 text-center py-8">Please select a child first</p>
                ) : history.sortedDates.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No transactions yet</p>
                ) : (
                    <div className="space-y-3">
                        {history.sortedDates.map((date) => {
                            const { earned, spent, details } = history.dailyStats[date];
                            const net = earned - spent;

                            return (
                                <div key={date} className="rounded border border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium text-gray-800">
                                            {new Date(date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </h3>
                                        <div className="text-right">
                                            <p
                                                className={`text-lg font-bold ${
                                                    net >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                            >
                                                {net >= 0 ? '+' : ''}
                                                {net}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                💰 {earned} • 💸 {spent}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-sm space-y-1 bg-gray-50 rounded p-2">
                                        {details.map((detail, idx) => (
                                            <div key={idx} className="flex justify-between">
                                                <span
                                                    className={
                                                        detail.type === 'earning'
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {detail.title} (×{detail.count})
                                                </span>
                                                <span className="font-medium">
                                                    {detail.type === 'earning' ? '+' : '-'}
                                                    {detail.amount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
export default HistoryView;
