import { useState } from 'react'
import { Task, TaskStatus } from '@/types/task'
import { TaskListDisplay, TaskDetailModal } from '@/components'
import { useLocalStorage } from '@/hooks/useLocalStorage'

/**
 * Sample tasks for demonstration
 * These are used as initial values only if localStorage is empty
 */
function generateSampleTasks(): Task[] {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  return [
    {
      id: '1',
      title: 'Complete project proposal',
      description: 'Write and submit the Q1 product proposal to stakeholders',
      priority: 'urgent',
      status: 'pending',
      dueDate: tomorrow,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      tags: ['work', 'urgent'],
    },
    {
      id: '2',
      title: 'Review pull requests',
      description: 'Check and approve pending PRs from the team',
      priority: 'high',
      status: 'pending',
      dueDate: now,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      tags: ['code-review'],
    },
    {
      id: '3',
      title: 'Update documentation',
      priority: 'medium',
      status: 'pending',
      dueDate: nextWeek,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      tags: ['documentation'],
    },
    {
      id: '4',
      title: 'Schedule team standup',
      priority: 'low',
      status: 'completed',
      completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: '5',
      title: 'Fix critical bug',
      description: 'Address the authentication issue in production',
      priority: 'urgent',
      status: 'pending',
      dueDate: yesterday,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      tags: ['bug', 'critical'],
    },
    {
      id: '6',
      title: 'Prepare presentation slides',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      tags: ['presentation', 'work'],
    },
    {
      id: '7',
      title: 'Buy groceries',
      priority: 'low',
      status: 'pending',
      dueDate: tomorrow,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      tags: ['personal'],
    },
  ]
}

/**
 * Home Page
 * Demonstrates the TaskListDisplay component with various configurations
 * Tasks are persisted to localStorage and will be restored on page refresh
 */
export default function Home() {
  const [tasks, setTasks] = useLocalStorage('nimbustodo_tasks', generateSampleTasks())
  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('priority')
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'none'>('status')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date() : null,
            }
          : task
      )
    )
  }

  const handleDelete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
  }

  const handleModalSave = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    )
    setSelectedTask(updatedTask)
  }

  const handleModalDelete = (taskId: string) => {
    handleDelete(taskId)
    handleModalClose()
  }

  const handleModalStatusChange = (taskId: string, newStatus: TaskStatus) => {
    handleStatusChange(taskId, newStatus)
    // Update selected task if it's the one being modified
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">NimbusTodo</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Your tasks at a glance</p>
        </div>

        {/* Controls */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Filter Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as Task['status'] | 'all')}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'priority' | 'dueDate' | 'createdAt')}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="createdAt">Recently Created</option>
            </select>
          </div>

          {/* Group Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group by
            </label>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as 'status' | 'priority' | 'none')}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tasks.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Task List Display */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <TaskListDisplay
            tasks={tasks}
            filterStatus={filterStatus}
            sortBy={sortBy}
            groupBy={groupBy}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            emptyMessage="No tasks to display. Create one to get started!"
          />
        </div>

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onStatusChange={handleModalStatusChange}
        />
      </div>
    </div>
  )
}
