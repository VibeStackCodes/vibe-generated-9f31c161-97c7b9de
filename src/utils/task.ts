import { Task, TaskPriority } from '@/types/task'

/**
 * Get priority numeric value for sorting (higher = more urgent)
 */
export function getPriorityValue(priority: TaskPriority): number {
  const values: Record<TaskPriority, number> = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  }
  return values[priority]
}

/**
 * Sort tasks by priority (highest first)
 */
export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority))
}

/**
 * Sort tasks by due date (earliest first)
 */
export function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
    return aDate - bDate
  })
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'completed' || task.status === 'archived') {
    return false
  }
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < now
}

/**
 * Check if a task is due today
 */
export function isTaskDueToday(task: Task): boolean {
  if (!task.dueDate) return false
  const today = new Date()
  const dueDate = new Date(task.dueDate)
  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a task is due tomorrow
 */
export function isTaskDueTomorrow(task: Task): boolean {
  if (!task.dueDate) return false
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dueDate = new Date(task.dueDate)
  return (
    dueDate.getDate() === tomorrow.getDate() &&
    dueDate.getMonth() === tomorrow.getMonth() &&
    dueDate.getFullYear() === tomorrow.getFullYear()
  )
}

/**
 * Get all high-priority tasks that need immediate attention
 */
export function getUrgentTasks(tasks: Task[]): Task[] {
  return tasks.filter(
    task =>
      (task.priority === 'urgent' || task.priority === 'high') &&
      task.status !== 'completed' &&
      task.status !== 'archived'
  )
}

/**
 * Get statistics about a list of tasks
 */
export interface TaskStats {
  total: number
  pending: number
  completed: number
  archived: number
  overdue: number
  dueToday: number
  byPriority: Record<TaskPriority, number>
}

export function getTaskStats(tasks: Task[]): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    pending: 0,
    completed: 0,
    archived: 0,
    overdue: 0,
    dueToday: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
  }

  tasks.forEach(task => {
    // Count by status
    stats[task.status]++

    // Count by priority
    stats.byPriority[task.priority]++

    // Count overdue
    if (isTaskOverdue(task)) {
      stats.overdue++
    }

    // Count due today
    if (isTaskDueToday(task)) {
      stats.dueToday++
    }
  })

  return stats
}

/**
 * Filter tasks by search query (searches title and description)
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  const lowerQuery = query.toLowerCase()
  return tasks.filter(
    task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      (task.description && task.description.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Group tasks by a specific field
 */
export function groupTasks<K extends keyof Task>(
  tasks: Task[],
  groupBy: K
): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {}

  tasks.forEach(task => {
    const key = String(task[groupBy])
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(task)
  })

  return grouped
}
