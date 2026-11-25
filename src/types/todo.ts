export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null; // Format: 'YYYY-MM-DD'
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority: Priority;
  due_date?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  due_date?: string | null;
  is_completed?: boolean;
}

export type StatusFilter = 'all' | 'active' | 'completed';
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
export type ViewFilter = 'all' | 'today' | 'completed' | 'high_priority';
