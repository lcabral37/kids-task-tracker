import React from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const TaskList: React.FC<{ tasks: Task[]; onTaskToggle: (id: number) => void }> = ({ tasks, onTaskToggle }) => {
  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onTaskToggle(task.id)}
            />
            {task.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
