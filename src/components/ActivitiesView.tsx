import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTaskStore } from '../store/taskStore';
import DateNavigator from './DateNavigator';
import TaskEditPanel from './TaskEditPanel';
import DraggableTaskItem from './DraggableTaskItem';

export default function ActivitiesView() {
    const store = useTaskStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const orderedIds = templates.map((t) => t.id);
            const oldIndex = orderedIds.indexOf(active.id as string);
            const newIndex = orderedIds.indexOf(over.id as string);
            const newOrder = arrayMove(orderedIds, oldIndex, newIndex);
            store.reorderTemplates('spending', newOrder);
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

            {templates.length === 0 ? (
                <p className="text-gray-500 p-4">No activities yet</p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={templates.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {templates.map((template) => {
                                const occurrence = occurrenceMap.get(template.id);
                                const count = occurrence?.completionCount || 0;
                                const spent = count * template.amount;

                                return (
                                    <DraggableTaskItem
                                        key={template.id}
                                        id={template.id}
                                        template={template}
                                        count={count}
                                        earned={spent}
                                        onIncrement={() => handleIncrement(template.id)}
                                        onDecrement={() => handleDecrement(template.id)}
                                        onEdit={() => handleEditActivity(template.id)}
                                        onDelete={() => handleDeleteActivity(template.id)}
                                    />
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

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
