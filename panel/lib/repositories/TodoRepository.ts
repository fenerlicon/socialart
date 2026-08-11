import { PersonalTodo } from '@/features/todo/types/todo-types'
import { supabase } from '@/lib/supabase/client'

export const TodoRepository = {
  getStorageKey(employeeId: string): string {
    return `socialart_personal_todos_${employeeId}`
  },

  async getTodos(employeeId: string): Promise<PersonalTodo[]> {
    if (!employeeId) return []
    const key = this.getStorageKey(employeeId)

    // 1. Try reading from LocalStorage first for instant latency-free UI
    let localTodos: PersonalTodo[] = []
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        localTodos = JSON.parse(stored)
      }
    } catch (e) {
      console.warn('LocalStorage todo read notice:', e)
    }

    // 2. Try fetching from Supabase table if available
    try {
      const { data, error } = await supabase
        .from('personal_todos')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        const dbTodos: PersonalTodo[] = data.map((row: any) => ({
          id: row.id,
          employeeId: row.employee_id,
          title: row.title,
          notes: row.notes || undefined,
          dueDate: row.due_date || undefined,
          priority: row.priority || 'medium',
          category: row.category || 'general',
          isCompleted: row.is_completed ?? false,
          completedAt: row.completed_at || undefined,
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || undefined
        }))

        // Sync local storage with DB data
        try {
          localStorage.setItem(key, JSON.stringify(dbTodos))
        } catch (e) {}

        return dbTodos
      }
    } catch (e) {}

    return localTodos
  },

  async saveTodos(employeeId: string, todos: PersonalTodo[]): Promise<void> {
    if (!employeeId) return
    const key = this.getStorageKey(employeeId)

    // 1. Save to LocalStorage immediately
    try {
      localStorage.setItem(key, JSON.stringify(todos))
    } catch (e) {
      console.warn('LocalStorage todo save notice:', e)
    }

    // 2. Async sync to Supabase table if exists
    try {
      const rows = todos.map(t => ({
        id: t.id,
        employee_id: employeeId,
        title: t.title,
        notes: t.notes || null,
        due_date: t.dueDate || null,
        priority: t.priority,
        category: t.category,
        is_completed: t.isCompleted,
        completed_at: t.completedAt || null,
        created_at: t.createdAt
      }))

      await supabase.from('personal_todos').upsert(rows)
    } catch (e) {}
  },

  async deleteTodo(employeeId: string, todoId: string, remainingTodos: PersonalTodo[]): Promise<void> {
    if (!employeeId) return
    const key = this.getStorageKey(employeeId)

    // 1. Save remaining to LocalStorage
    try {
      localStorage.setItem(key, JSON.stringify(remainingTodos))
    } catch (e) {}

    // 2. Delete from Supabase
    try {
      await supabase.from('personal_todos').delete().eq('id', todoId).eq('employee_id', employeeId)
    } catch (e) {}
  }
}
