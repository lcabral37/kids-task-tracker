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

export default function TasksView() {
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

    // Get all earning templates and their occurrences for the selected date
    const templates = store.getTaskTemplates('earning');
    const occurrences = store.getOccurrencesForDate(activeChildId, selectedDate);
    const occurrenceMap = new Map(occurrences.map((o) => [o.templateId, o]));

    const dailyEarnings = store.getChildDailyEarnings(activeChildId, selectedDate);
    const balance = store.getChildBalance(activeChildId);

    const handleEditTask = (templateId: string) => {
        setEditingId(templateId);
        setIsEditModalOpen(true);
    };

    const handleAddTask = () => {
        setEditingId(null);
        setIsEditModalOpen(true);
    };

    const handleIncrement = (templateId: string) => {
        store.incrementOccurrence(templateId, activeChildId, selectedDate);
    };

    const handleDecrement = (templateId: string) => {
        store.decrementOccurrence(templateId, activeChildId, selectedDate);
    };

    const handleDeleteTask = (templateId: string) => {
        if (confirm('Delete this task?')) {
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
            store.reorderTemplates('earning', newOrder);
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900">Earning Tasks</h2>
                <p className="text-sm text-blue-700">Today earned: {dailyEarnings}</p>
                <p className="text-sm text-blue-700">Current balance: {balance}</p>
            </div>

            <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

            {templates.length === 0 ? (
                <p className="text-gray-500 p-4">No tasks yet</p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={templates.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {templates.map((template) => {
                                const occurrence = occurrenceMap.get(template.id);
                                const count = occurrence?.completionCount || 0;
                                const earned = count * template.amount;

                                return (
                                    <DraggableTaskItem
                                        key={template.id}
                                        id={template.id}
                                        template={template}
                                        count={count}
                                        earned={earned}
                                        onIncrement={() => handleIncrement(template.id)}
                                        onDecrement={() => handleDecrement(template.id)}
                                        onEdit={() => handleEditTask(template.id)}
                                        onDelete={() => handleDeleteTask(template.id)}
                                    />
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <button
                onClick={handleAddTask}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                + Add Task
            </button>

            {isEditModalOpen && (
                <TaskEditPanel
                    editingTemplateId={editingId}
                    taskType="earning"
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
}
