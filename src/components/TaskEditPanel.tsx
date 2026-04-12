import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';

interface TaskEditPanelProps {
    onClose: () => void;
    taskType: 'earning' | 'spending';
    editingTemplateId: string | null;
}

const EMOJI_ICONS = [
    '📚', '🧹', '🍽️', '🧼', '🛏️', '👕', '🎮', '🎨', '🏃', '⚽',
    '🚴', '🏊', '🧘', '📖', '✏️', '🎵', '🎸', '🎤', '💻', '🖥️',
    '📱', '⏰', '🌟', '💪', '🤝', '🙏', '😊', '🎯', '🔧', '🛠️',
    '🌳', '🌻', '🍎', '🥗', '🍕', '🍪', '🧁', '🍇', '🥕', '🥔',
    '🎁', '🎊', '🎉', '🏆', '🥇', '🎖️', '⭐', '💎', '🔑', '🏠',
];

const TaskEditPanel: React.FC<TaskEditPanelProps> = ({
    onClose,
    taskType,
    editingTemplateId,
}) => {
    const store = useTaskStore();
    const editingTemplate = editingTemplateId ? store.taskTemplates.find((t) => t.id === editingTemplateId) : null;

    const [formData, setFormData] = useState(
        editingTemplate || {
            id: `task_${Date.now()}`,
            title: '',
            description: '',
            amount: 1,
            icon: '⭐',
            type: taskType,
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Please enter a title');
            return;
        }

        if (editingTemplate) {
            store.updateTaskTemplate(editingTemplate.id, {
                title: formData.title,
                description: formData.description,
                amount: formData.amount,
                icon: formData.icon,
            });
        } else {
            store.addTaskTemplate({
                id: `task_${Date.now()}`,
                title: formData.title,
                description: formData.description,
                amount: formData.amount,
                type: taskType,
                icon: formData.icon,
                order: 0, // Will be set by addTaskTemplate based on template count
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {editingTemplate ? 'Edit' : 'Add New'} {taskType === 'earning' ? 'Task' : 'Activity'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Icon Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                        <div className="grid grid-cols-8 gap-2 mb-3">
                            {EMOJI_ICONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: emoji })}
                                    className={`p-2 text-2xl rounded transition ${
                                        formData.icon === emoji
                                            ? 'bg-blue-200 ring-2 ring-blue-500'
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="Or paste an emoji"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Task name"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add details (optional)"
                            rows={3}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {taskType === 'earning' ? 'Reward Amount' : 'Cost'}{' '}
                            {taskType === 'earning' ? '💰' : '💸'}
                        </label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.valueAsNumber })}
                            placeholder="0"
                            min="0"
                            step="0.5"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium flex items-center justify-center gap-2 transition"
                        >
                            <Save size={18} /> Save
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskEditPanel;
