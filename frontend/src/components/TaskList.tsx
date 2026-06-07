'use client';

import { useState } from 'react';
import { Task, tasks } from '@/lib/api';

interface TaskListProps {
  tasks: Task[];
  onTaskDeleted: () => void;
  onTaskUpdated: () => void;
}

export default function TaskList({
  tasks: taskList,
  onTaskDeleted,
  onTaskUpdated,
}: TaskListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      await tasks.delete(id);
      onTaskDeleted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete task'
      );
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: 'todo' | 'in-progress' | 'done'
  ) => {
    setUpdatingId(id);
    setError('');

    try {
      await tasks.update(id, { status: newStatus });
      onTaskUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update task'
      );
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {taskList.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {task.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(task.id)}
                disabled={deletingId === task.id}
                className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === task.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(
                      task.id,
                      e.target.value as 'todo' | 'in-progress' | 'done'
                    )
                  }
                  disabled={updatingId === task.id}
                  className={`px-3 py-1 rounded text-sm font-medium cursor-pointer ${getStatusColor(
                    task.status
                  )} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                {task.dueDate && (
                  <span className="text-sm text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <span className="text-xs text-gray-400">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
