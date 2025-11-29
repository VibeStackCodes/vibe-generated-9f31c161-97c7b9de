import { useState } from 'react'
import { Task, TaskPriority, TaskInput } from '@/types/task'

interface TaskFormProps {
  onSubmit: (task: TaskInput) => void
  initialTask?: Task
  isEditing?: boolean
}

/**
 * TaskForm Component
 * Form for creating or editing tasks with all fields
 * Includes validation and user-friendly inputs
 */
export function TaskForm({ onSubmit, initialTask, isEditing = false }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '')
  const [description, setDescription] = useState(initialTask?.description || '')
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
  )
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'medium')
  const [tags, setTags] = useState<string[]>(initialTask?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const taskInput: TaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      tags: tags.length > 0 ? tags : undefined,
    }

    onSubmit(taskInput)

    // Reset form
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('medium')
    setTags([])
    setNewTag('')
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
    >
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Task Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter task title"
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
            errors.title
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Due Date */}
      <div>
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Due Date
        </label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Priority */}
      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={e => setPriority(e.target.value as TaskPriority)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tags
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="tags"
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="Add tag"
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map(tag => (
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

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
