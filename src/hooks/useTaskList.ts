import { useState, useCallback } from 'react'
import { Task, TaskInput, TaskStatus } from '@/types/task'

/**
 * Custom hook for managing a list of tasks
 * Provides CRUD operations and state management for tasks
 */
export function useTaskList(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  /**
   * Add a new task
   */
  const addTask = useCallback((input: TaskInput) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status || 'pending',
      tags: input.tags,
      listId: input.listId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks(prev => [newTask, ...prev])
    return newTask
  }, [])

  /**
   * Update an existing task
   */
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updatedAt: new Date(),
            }
          : task
      )
    )
  }, [])

  /**
   * Delete a task
   */
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  /**
   * Update task status
   */
  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              status,
              completedAt: status === 'completed' ? new Date() : null,
              updatedAt: new Date(),
            }
          : task
      )
    )
  }, [])

  /**
   * Get tasks filtered by status
   */
  const getTasksByStatus = useCallback(
    (status: TaskStatus | 'all') => {
      if (status === 'all') {
        return tasks.filter(t => t.status !== 'archived')
      }
      return tasks.filter(t => t.status === status)
    },
    [tasks]
  )

  /**
   * Get tasks by priority
   */
  const getTasksByPriority = useCallback(
    (priority: Task['priority']) => {
      return tasks.filter(t => t.priority === priority)
    },
    [tasks]
  )

  /**
   * Get overdue tasks
   */
  const getOverdueTasks = useCallback(() => {
    const now = new Date()
    return tasks.filter(
      t =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status !== 'completed' &&
        t.status !== 'archived'
    )
  }, [tasks])

  /**
   * Get tasks due today
   */
  const getDueToday = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter(t => {
      if (!t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate.getTime() === today.getTime() && t.status !== 'completed'
    })
  }, [tasks])

  /**
   * Clear completed tasks (archive them)
   */
  const clearCompleted = useCallback(() => {
    setTasks(prev =>
      prev.map(task => (task.status === 'completed' ? { ...task, status: 'archived' } : task))
    )
  }, [])

  return {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
    getDueToday,
    clearCompleted,
  }
}
