import { Task, TaskPriority } from '@/types/task'

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is tomorrow
 */
function isTomorrow(date: Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  )
}

/**
 * Check if a date is in the past
 */
function isPast(date: Date): boolean {
  return date < new Date()
}

/**
 * Format date as Mon DD, YYYY
 */
function formatDate(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  const today = new Date()
  const isCurrentYear = year === today.getFullYear()
  return isCurrentYear ? `${month} ${day}` : `${month} ${day}, ${year}`
}

interface TaskItemProps {
  task: Task
  onTaskClick?: (task: Task) => void
  onStatusChange?: (taskId: string, status: Task['status']) => void
  onDelete?: (taskId: string) => void
}

/**
 * Gets the priority badge styling based on priority level
 */
function getPriorityStyles(priority: TaskPriority): {
  bgColor: string
  textColor: string
  label: string
} {
  const styles = {
    low: {
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-700 dark:text-blue-200',
      label: 'Low',
    },
    medium: {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-700 dark:text-yellow-200',
      label: 'Medium',
    },
    high: {
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-700 dark:text-orange-200',
      label: 'High',
    },
    urgent: {
      bgColor: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-700 dark:text-red-200',
      label: 'Urgent',
    },
  }
  return styles[priority]
}

/**
 * Formats the due date into a readable string with relative date context
 */
function formatDueDate(dueDate: Date | undefined | null): string | null {
  if (!dueDate) return null

  const date = dueDate instanceof Date ? dueDate : new Date(dueDate)

  if (isToday(date)) {
    return 'Today'
  }
  if (isTomorrow(date)) {
    return 'Tomorrow'
  }
  if (isPast(date)) {
    return `Overdue: ${formatDate(date)}`
  }
  return formatDate(date)
}

/**
 * Gets styling for due date based on whether it's overdue
 */
function getDueDateStyles(dueDate: Date | undefined | null): string {
  if (!dueDate) return 'text-gray-500 dark:text-gray-400'

  const date = dueDate instanceof Date ? dueDate : new Date(dueDate)

  if (isPast(date) && !isToday(date)) {
    return 'text-red-600 dark:text-red-400 font-semibold'
  }
  if (isToday(date)) {
    return 'text-orange-600 dark:text-orange-400 font-semibold'
  }
  return 'text-gray-600 dark:text-gray-400'
}

/**
 * TaskItem Component
 * Displays a single task with title, due date, and priority indicator
 * Supports task interaction (completion toggle, delete, click)
 */
export function TaskItem({ task, onTaskClick, onStatusChange, onDelete }: TaskItemProps) {
  const priorityStyles = getPriorityStyles(task.priority)
  const formattedDueDate = formatDueDate(task.dueDate)
  const dueDateClasses = getDueDateStyles(task.dueDate)
  const isCompleted = task.status === 'completed'
  const isArchived = task.status === 'archived'

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = isCompleted ? 'pending' : 'completed'
    onStatusChange?.(task.id, newStatus as Task['status'])
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(task.id)
  }

  return (
    <div
      onClick={() => onTaskClick?.(task)}
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-all duration-200 ${
        isArchived
          ? 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 opacity-60'
          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700'
      } ${onTaskClick ? 'cursor-pointer' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
          isCompleted
            ? 'border-green-500 bg-green-500 dark:border-green-600 dark:bg-green-600'
            : 'border-gray-300 hover:border-green-400 dark:border-gray-600 dark:hover:border-green-500'
        }`}
        aria-label={`Mark task ${isCompleted ? 'incomplete' : 'complete'}`}
      >
        {isCompleted && (
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className={`truncate text-sm font-medium leading-tight transition-all ${
            isCompleted
              ? 'line-through text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && !isCompleted && (
          <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-400">
            {task.description}
          </p>
        )}

        {/* Due Date and Priority Row */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {formattedDueDate && (
            <span className={`text-xs ${dueDateClasses}`}>{formattedDueDate}</span>
          )}

          {/* Priority Badge */}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles.bgColor} ${priorityStyles.textColor}`}
          >
            {priorityStyles.label}
          </span>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleDelete}
          className="rounded p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
          aria-label="Delete task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
