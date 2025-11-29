import { Task } from '@/types/task'
import { TaskItem } from './TaskItem'
import { useMemo } from 'react'

interface TaskListDisplayProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onStatusChange?: (taskId: string, status: Task['status']) => void
  onDelete?: (taskId: string) => void
  /** Filter tasks by status (defaults to showing all non-archived) */
  filterStatus?: Task['status'] | 'all'
  /** Sort tasks by priority or due date */
  sortBy?: 'priority' | 'dueDate' | 'createdAt' | 'none'
  /** Group tasks by status or priority */
  groupBy?: 'status' | 'priority' | 'none'
  emptyMessage?: string
}

/**
 * Gets priority numeric value for sorting (higher = more urgent)
 */
function getPriorityValue(priority: Task['priority']): number {
  const values = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  }
  return values[priority]
}

/**
 * Gets group label for tasks
 */
function getGroupLabel(groupBy: 'status' | 'priority' | 'none', groupKey: string): string {
  if (groupBy === 'status') {
    const labels = {
      pending: 'To Do',
      completed: 'Completed',
      archived: 'Archived',
    }
    return labels[groupKey as Task['status']] || groupKey
  }

  if (groupBy === 'priority') {
    const labels = {
      urgent: '🔴 Urgent',
      high: '🟠 High',
      medium: '🟡 Medium',
      low: '🔵 Low',
    }
    return labels[groupKey as Task['priority']] || groupKey
  }

  return groupKey
}

/**
 * TaskListDisplay Component
 * Renders a list of tasks with support for filtering, sorting, and grouping
 * Displays title, due date, and priority indicators for each task
 */
export function TaskListDisplay({
  tasks,
  onTaskClick,
  onStatusChange,
  onDelete,
  filterStatus = 'all',
  sortBy = 'priority',
  groupBy = 'none',
  emptyMessage = 'No tasks to display',
}: TaskListDisplayProps) {
  // Filter tasks based on status
  const filteredTasks = useMemo(() => {
    if (filterStatus === 'all') {
      return tasks.filter(task => task.status !== 'archived')
    }
    return tasks.filter(task => task.status === filterStatus)
  }, [tasks, filterStatus])

  // Sort and group tasks
  const groupedTasks = useMemo(() => {
    const sortedTasks = [...filteredTasks]

    // Apply sorting
    if (sortBy === 'priority') {
      sortedTasks.sort((a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority))
    } else if (sortBy === 'dueDate') {
      sortedTasks.sort((a, b) => {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        return aDate - bDate
      })
    } else if (sortBy === 'createdAt') {
      sortedTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    // Apply grouping
    if (groupBy === 'none') {
      return { ungrouped: sortedTasks }
    }

    const grouped: Record<string, Task[]> = {}
    sortedTasks.forEach(task => {
      const key = groupBy === 'status' ? task.status : task.priority
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(task)
    })

    return grouped
  }, [filteredTasks, sortBy, groupBy])

  // Get the order of groups for consistent display
  const groupOrder = useMemo(() => {
    if (groupBy === 'status') {
      return ['pending', 'completed']
    }
    if (groupBy === 'priority') {
      return ['urgent', 'high', 'medium', 'low']
    }
    return ['ungrouped']
  }, [groupBy])

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-12 dark:border-gray-700 dark:bg-gray-900">
        <svg
          className="mb-4 h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groupOrder.map(groupKey => {
        const tasksInGroup = groupedTasks[groupKey]
        if (!tasksInGroup || tasksInGroup.length === 0) return null

        return (
          <div key={groupKey}>
            {/* Group Header */}
            {groupBy !== 'none' && (
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {getGroupLabel(groupBy, groupKey)}
                </h3>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {tasksInGroup.length}
                </span>
              </div>
            )}

            {/* Task List */}
            <div className="space-y-2">
              {tasksInGroup.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
