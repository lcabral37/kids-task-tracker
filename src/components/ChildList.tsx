import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTaskStore, Child } from "../store/taskStore";

const ChildSelector: React.FC = () => {
  const { children, activeChildId, addChild, removeChild, setActiveChild } =
    useTaskStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", age: 10 });

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const newChild: Child = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        age: parseInt(formData.age.toString()),
      };
      addChild(newChild);
      setFormData({ name: "", age: 10 });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Children</h2>

      {children.length === 0 ? (
        <p className="text-gray-500 text-sm mb-4">No children added yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {children.map((child) => (
            <div
              key={child.id}
              className={`p-3 rounded border-2 cursor-pointer transition ${
                activeChildId === child.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                onClick={() => setActiveChild(child.id)}
                className="flex justify-between items-start"
              >
                <div>
                  <p className="font-medium">{child.name}</p>
                  <p className="text-sm text-gray-500">Age {child.age}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChild(child.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove child"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm ? (
        <form
          onSubmit={handleAddChild}
          className="bg-gray-50 p-4 rounded border"
        >
          <input
            type="text"
            placeholder="Child name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded mb-2"
            autoFocus
          />
          <input
            type="number"
            min="1"
            max="18"
            placeholder="Age"
            value={formData.age}
            onChange={(e) =>
              setFormData({ ...formData, age: e.target.valueAsNumber })
            }
            className="w-full px-3 py-2 border rounded mb-3"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-medium"
            >
              Add Child
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
        >
          <Plus size={18} /> Add Child
        </button>
      )}
    </div>
  );
};

export default ChildSelector;
