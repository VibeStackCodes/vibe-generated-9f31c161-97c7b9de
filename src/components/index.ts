/**
 * NimbusTodo Components
 *
 * This module exports all reusable UI components for the task management system.
 *
 * Key Components:
 * - TaskItem: Displays a single task with checkbox, title, due date, and priority badge
 * - TaskListDisplay: Container component for displaying multiple tasks with filtering,
 *   sorting, and grouping capabilities
 * - ErrorBoundary: Error handling wrapper for React components
 *
 * Features:
 * - Complete task display with title, description, due date, and priority indicators
 * - Color-coded priority badges (Low: Blue, Medium: Yellow, High: Orange, Urgent: Red)
 * - Smart date formatting (Today, Tomorrow, Overdue, or formatted date)
 * - Task status management (pending, completed, archived)
 * - Responsive design with Tailwind CSS
 * - Dark mode support
 * - Filtering by status
 * - Sorting by priority, due date, or creation date
 * - Grouping by status or priority
 * - Tag display for task categorization
 * - Hover actions (delete button)
 * - Empty state with helpful message
 *
 * Usage Example:
 *
 * ```tsx
 * import { TaskListDisplay } from '@/components/TaskListDisplay'
 * import type { Task } from '@/types/task'
 *
 * function MyApp() {
 *   const tasks: Task[] = [
 *     {
 *       id: '1',
 *       title: 'Complete project',
 *       priority: 'high',
 *       status: 'pending',
 *       dueDate: new Date('2024-12-31'),
 *       createdAt: new Date(),
 *       updatedAt: new Date(),
 *     }
 *   ]
 *
 *   return (
 *     <TaskListDisplay
 *       tasks={tasks}
 *       filterStatus="all"
 *       sortBy="priority"
 *       groupBy="status"
 *       onStatusChange={(id, status) => console.log(id, status)}
 *       onDelete={(id) => console.log('Delete', id)}
 *       onTaskClick={(task) => console.log('Click', task)}
 *     />
 *   )
 * }
 * ```
 *
 * Styling:
 * - Built with Tailwind CSS for utility-first styling
 * - Supports light and dark modes (dark: prefix)
 * - Uses semantic HTML with proper ARIA labels
 * - Responsive design with mobile-first approach
 *
 * Type Safety:
 * - Full TypeScript support with strict type checking
 * - Proper type definitions in @/types/task
 * - No 'any' types used
 */

export { TaskItem } from './TaskItem'
export { TaskListDisplay } from './TaskListDisplay'
export { TaskForm } from './TaskForm'
export { TaskDetailModal } from './TaskDetailModal'
export { ErrorBoundary } from './error-boundary'
export { VibeStackBadge } from './vibestack-badge'
