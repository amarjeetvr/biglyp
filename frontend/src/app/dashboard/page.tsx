'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { tasks, Task } from '@/lib/api';
import TaskList from '@/components/TaskList';
import CreateTaskModal from '@/components/CreateTaskModal';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'todo' | 'in-progress' | 'done'
  >('all');

  const loadTasks = async (filter?: string) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await tasks.list(
        filter && filter !== 'all' ? filter : undefined
      );
      setTaskList(data);
applyFilter(
  (filter || 'all') as 'todo' | 'in-progress' | 'done' | 'all',
  data
);    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load tasks'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = (
    filter: 'all' | 'todo' | 'in-progress' | 'done',
    data?: Task[]
  ) => {
    setActiveFilter(filter);
    const tasksToFilter = data || taskList;

    if (filter === 'all') {
      setFilteredTasks(tasksToFilter);
    } else {
      setFilteredTasks(
        tasksToFilter.filter((task) => task.status === filter)
      );
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleTaskCreated = async () => {
    setShowModal(false);
    await loadTasks();
  };

  const handleTaskDeleted = async () => {
    await loadTasks();
  };

  const handleTaskUpdated = async () => {
    await loadTasks();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Create Task Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
          >
            + Create Task
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          {(['all', 'todo', 'in-progress', 'done'] as const).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => applyFilter(filter)}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeFilter === filter
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter === 'in-progress'
                  ? 'In Progress'
                  : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Tasks Content */}
        {isLoading ? (
          <div className="text-center text-gray-600">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="text-lg">No tasks yet</p>
            <p className="text-sm">
              Create a new task to get started
            </p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onTaskDeleted={handleTaskDeleted}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </main>

      {/* Create Task Modal */}
      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
