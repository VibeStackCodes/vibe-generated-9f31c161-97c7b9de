import { useState, useEffect, useCallback } from 'react'
import { Task } from '@/types/task'

/**
 * Custom hook for persisting tasks to localStorage
 * Handles serialization of Date objects and provides sync across tabs
 */
export function useLocalStorage(key: string, initialValue: Task[] = []) {
  const [storedValue, setStoredValue] = useState<Task[]>(() => {
    try {
      // Get from local storage by key
      if (typeof window === 'undefined') {
        return initialValue
      }
      const item = window.localStorage.getItem(key)
      if (item) {
        // Parse and reconstruct Date objects
        const parsed = JSON.parse(item)
        return parsed.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
        }))
      }
      return initialValue
    } catch (error) {
      console.warn(`Error reading from localStorage (${key}):`, error)
      return initialValue
    }
  })

  /**
   * Custom setter that also persists to localStorage
   */
  const setValue = useCallback(
    (value: Task[] | ((val: Task[]) => Task[])) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error writing to localStorage (${key}):`, error)
      }
    },
    [key, storedValue]
  )

  /**
   * Listen for storage changes from other tabs/windows
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          const reconstructed = parsed.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : null,
          }))
          setStoredValue(reconstructed)
        } catch (error) {
          console.warn(`Error parsing storage update from another tab (${key}):`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue] as const
}
