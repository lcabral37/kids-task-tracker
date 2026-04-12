import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { TaskTemplate } from "../store/taskStore";

interface DraggableTaskItemProps {
  id: string;
  template: TaskTemplate;
  count: number;
  earned: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  id,
  template,
  count,
  earned,
  onIncrement,
  onDecrement,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div
        className="flex items-center gap-2 flex-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical
          size={18}
          className="text-gray-400 cursor-grab active:cursor-grabbing"
        />
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
            {template.amount} each × {count} = {earned}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          −
        </button>
        <span className="w-8 text-center font-semibold">{count}</span>
        <button
          onClick={onIncrement}
          className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
        >
          +
        </button>
        <button
          onClick={onEdit}
          className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DraggableTaskItem;
