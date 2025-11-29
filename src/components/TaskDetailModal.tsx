import { useState, useEffect } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/types/task'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
}

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
 * TaskDetailModal Component
 * Displays detailed task information in a modal with edit capabilities
 * Allows viewing, editing, and deleting tasks
 */
export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onStatusChange,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update editedTask when task changes
  useEffect(() => {
    if (task) {
      setEditedTask(task)
      setIsEditing(false)
      setErrors({})
    }
  }, [task, isOpen])

  if (!isOpen || !task) {
    return null
  }

  const displayTask = isEditing && editedTask ? editedTask : task
  const priorityStyles = getPriorityStyles(displayTask.priority)
  const formattedDueDate = formatDueDate(displayTask.dueDate)
  const isCompleted = displayTask.status === 'completed'

  const handleEditChange = <K extends keyof Task>(key: K, value: Task[K]) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, [key]: value })
      // Clear error for this field if it existed
      if (errors[key as string]) {
        setErrors({ ...errors, [key as string]: '' })
      }
    }
  }

  const handleAddTag = (newTag: string) => {
    if (editedTask && newTag.trim() && !editedTask.tags?.includes(newTag.trim())) {
      setEditedTask({
        ...editedTask,
        tags: [...(editedTask.tags || []), newTag.trim()],
      })
    }
  }

  const handleRemoveTag = (tag: string) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        tags: editedTask.tags?.filter(t => t !== tag),
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!editedTask?.title.trim()) {
      newErrors.title = 'Title is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm() || !editedTask) return

    onSave({
      ...editedTask,
      title: editedTask.title.trim(),
      description: editedTask.description?.trim() || undefined,
      updatedAt: new Date(),
    })

    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id)
      onClose()
    }
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (editedTask) {
      const updatedTask = {
        ...editedTask,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null,
        updatedAt: new Date(),
      }
      setEditedTask(updatedTask)
      onStatusChange?.(task.id, newStatus)
      // Update display immediately
      setIsEditing(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity dark:bg-opacity-70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask?.title || ''}
                  onChange={e => handleEditChange('title', e.target.value)}
                  className={`w-full text-lg font-bold focus:outline-none dark:bg-gray-800 ${
                    errors.title
                      ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                  placeholder="Task title"
                />
              ) : (
                <h2 className={`text-lg font-bold ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {displayTask.title}
                </h2>
              )}
              {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>}
            </div>

            <button
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Status
              </label>
              <div className="mt-2 flex gap-2">
                {(['pending', 'completed', 'archived'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      displayTask.status === status
                        ? status === 'pending'
                          ? 'bg-blue-600 text-white dark:bg-blue-700'
                          : status === 'completed'
                            ? 'bg-green-600 text-white dark:bg-green-700'
                            : 'bg-gray-600 text-white dark:bg-gray-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editedTask?.description || ''}
                  onChange={e => handleEditChange('description', e.target.value)}
                  placeholder="Enter task description (optional)"
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {displayTask.description || <span className="italic text-gray-500">No description</span>}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={displayTask.dueDate ? new Date(displayTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={e => handleEditChange('dueDate', e.target.value ? new Date(e.target.value) : null)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {formattedDueDate || <span className="italic text-gray-500">No due date</span>}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Priority
              </label>
              {isEditing ? (
                <select
                  value={editedTask?.priority || 'medium'}
                  onChange={e => handleEditChange('priority', e.target.value as TaskPriority)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${priorityStyles.bgColor} ${priorityStyles.textColor}`}
                  >
                    {priorityStyles.label}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Tags
              </label>
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="newTag"
                      placeholder="Add a tag"
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          handleAddTag(input.value)
                          input.value = ''
                        }
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('newTag') as HTMLInputElement
                        if (input) {
                          handleAddTag(input.value)
                          input.value = ''
                        }
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                  {editedTask?.tags && editedTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editedTask.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  {displayTask.tags && displayTask.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {displayTask.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="italic text-gray-500">No tags</span>
                  )}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Created
                  </p>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {displayTask.createdAt instanceof Date
                      ? displayTask.createdAt.toLocaleString()
                      : new Date(displayTask.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Updated
                  </p>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {displayTask.updatedAt instanceof Date
                      ? displayTask.updatedAt.toLocaleString()
                      : new Date(displayTask.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Delete
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
