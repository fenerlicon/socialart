export type TodoPriority = 'high' | 'medium' | 'low'
export type TodoCategory = 'meeting' | 'ad_campaign' | 'presentation' | 'personal_note' | 'general'

export interface PersonalTodo {
  id: string
  employeeId: string
  title: string
  notes?: string
  dueDate?: string
  priority: TodoPriority
  category: TodoCategory
  isCompleted: boolean
  completedAt?: string
  createdAt: string
  updatedAt?: string
}
