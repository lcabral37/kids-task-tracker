import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import DateNavigator from './DateNavigator';
import TaskEditPanel from './TaskEditPanel';

export default function ActivitiesView() {
    const store = useTaskStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const activeChildId = store.activeChildId;
    if (!activeChildId) {
        return <div className="p-4 text-gray-500">Please select a child first</div>;
    }

    // Get all spending templates and their occurrences for the selected date
    const templates = store.getTaskTemplates('spending');
    const occurrences = store.getOccurrencesForDate(activeChildId, selectedDate);
    const occurrenceMap = new Map(occurrences.map((o) => [o.templateId, o]));

    const dailySpending = store.getChildDailySpending(activeChildId, selectedDate);
    const balance = store.getChildBalance(activeChildId);

    const handleEditActivity = (templateId: string) => {
        setEditingId(templateId);
        setIsEditModalOpen(true);
    };

    const handleAddActivity = () => {
        setEditingId(null);
        setIsEditModalOpen(true);
    };

    const handleIncrement = (templateId: string) => {
        const balance = store.getChildBalance(activeChildId);
        const template = templates.find((t) => t.id === templateId);

        if (balance < (template?.amount || 0)) {
            alert(`Not enough balance. Need ${template?.amount}, have ${balance}`);
            return;
        }

        store.incrementOccurrence(templateId, activeChildId, selectedDate);
    };

    const handleDecrement = (templateId: string) => {
        store.decrementOccurrence(templateId, activeChildId, selectedDate);
    };

    const handleDeleteActivity = (templateId: string) => {
        if (confirm('Delete this activity?')) {
            store.removeTaskTemplate(templateId);
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900">Activities (Spending)</h2>
                <p className="text-sm text-purple-700">Today spent: {dailySpending}</p>
                <p className="text-sm text-purple-700">Available balance: {balance}</p>
            </div>

            <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

            <div className="space-y-2">
                {templates.length === 0 ? (
                    <p className="text-gray-500 p-4">No activities yet</p>
                ) : (
                    templates.map((template) => {
                        const occurrence = occurrenceMap.get(template.id);
                        const count = occurrence?.completionCount || 0;
                        const spent = count * template.amount;

                        return (
                            <div
                                key={template.id}
                                className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {template.icon && <span className="text-xl">{template.icon}</span>}
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{template.title}</h3>
                                            {template.description && (
                                                <p className="text-xs text-gray-500">{template.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {template.amount} each × {count} = {spent}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDecrement(template.id)}
                                        className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center font-semibold">{count}</span>
                                    <button
                                        onClick={() => handleIncrement(template.id)}
                                        className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => handleEditActivity(template.id)}
                                        className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteActivity(template.id)}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button
                onClick={handleAddActivity}
                className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
                + Add Activity
            </button>

            {isEditModalOpen && (
                <TaskEditPanel
                    editingTemplateId={editingId}
                    taskType="spending"
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
}
