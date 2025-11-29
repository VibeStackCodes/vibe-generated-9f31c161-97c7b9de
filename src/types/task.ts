/**
 * Task type definitions for the NimbusTodo application
 */

/**
 * Priority levels for tasks
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Task status enum
 */
export type TaskStatus = 'pending' | 'completed' | 'archived'

/**
 * Core Task interface
 * Represents a single todo task with all necessary metadata
 */
export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date | null
  priority: TaskPriority
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
  completedAt?: Date | null
  tags?: string[]
  listId?: string
}

/**
 * Task creation payload (without auto-generated fields)
 */
export interface TaskInput {
  title: string
  description?: string
  dueDate?: Date | null
  priority: TaskPriority
  status?: TaskStatus
  tags?: string[]
  listId?: string
}
