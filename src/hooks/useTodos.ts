import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Todo, CreateTodoInput, UpdateTodoInput, StatusFilter, PriorityFilter, ViewFilter } from '../types/todo';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Toast helper
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch todos from Supabase
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTodos(data || []);
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      const msg = err.message || 'Failed to fetch tasks from Supabase';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Initial load and real-time subscription
  useEffect(() => {
    fetchTodos();

    // Subscribe to realtime changes on 'todos' table
    const channel = supabase
      .channel('todos_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTodo = payload.new as Todo;
            setTodos((prev) => {
              if (prev.some((t) => t.id === newTodo.id)) return prev;
              return [newTodo, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Todo;
            setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setTodos((prev) => prev.filter((t) => t.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodos]);

  // CREATE Todo with optimistic UI & rollback
  const createTodo = useCallback(
    async (input: CreateTodoInput): Promise<boolean> => {
      if (!input.title.trim()) {
        addToast('Title is required', 'error');
        return false;
      }

      const tempId = crypto.randomUUID();
      const now = new Date().toISOString();
      const optimisticTodo: Todo = {
        id: tempId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        priority: input.priority || 'medium',
        due_date: input.due_date || null,
        is_completed: false,
        created_at: now,
        updated_at: now,
      };

      // Optimistic update
      setTodos((prev) => [optimisticTodo, ...prev]);

      try {
        const { data, error: insertError } = await supabase
          .from('todos')
          .insert([
            {
              title: optimisticTodo.title,
              description: optimisticTodo.description,
              priority: optimisticTodo.priority,
              due_date: optimisticTodo.due_date,
              is_completed: false,
            },
          ])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Replace optimistic entry with server row
        if (data) {
          setTodos((prev) => prev.map((t) => (t.id === tempId ? (data as Todo) : t)));
        }

        addToast('Task created successfully', 'success');
        return true;
      } catch (err: any) {
        console.error('Error creating todo:', err);
        // Rollback
        setTodos((prev) => prev.filter((t) => t.id !== tempId));
        addToast(`Failed to create task: ${err.message || 'Unknown error'}`, 'error');
        return false;
      }
    },
    [addToast]
  );

  // TOGGLE is_completed with optimistic UI & rollback
  const toggleTodo = useCallback(
    async (id: string): Promise<boolean> => {
      const original = todos.find((t) => t.id === id);
      if (!original) return false;

      const updatedStatus = !original.is_completed;
      const updatedTimestamp = new Date().toISOString();

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, is_completed: updatedStatus, updated_at: updatedTimestamp }
            : t
        )
      );

      try {
        const { error: updateError } = await supabase
          .from('todos')
          .update({
            is_completed: updatedStatus,
            updated_at: updatedTimestamp,
          })
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }

        addToast(
          updatedStatus ? 'Task marked as completed' : 'Task marked as active',
          'success'
        );
        return true;
      } catch (err: any) {
        console.error('Error toggling todo:', err);
        // Rollback
        setTodos((prev) => prev.map((t) => (t.id === id ? original : t)));
        addToast(`Failed to update task: ${err.message || 'Unknown error'}`, 'error');
        return false;
      }
    },
    [todos, addToast]
  );

  // UPDATE Todo fields with optimistic UI & rollback
  const updateTodo = useCallback(
    async (id: string, input: UpdateTodoInput): Promise<boolean> => {
      const original = todos.find((t) => t.id === id);
      if (!original) return false;

      const now = new Date().toISOString();
      const updatedItem: Todo = {
        ...original,
        ...input,
        updated_at: now,
      };

      // Optimistic update
      setTodos((prev) => prev.map((t) => (t.id === id ? updatedItem : t)));

      try {
        const payload: Record<string, any> = {
          updated_at: now,
        };
        if (input.title !== undefined) payload.title = input.title.trim();
        if (input.description !== undefined) payload.description = input.description ? input.description.trim() : null;
        if (input.priority !== undefined) payload.priority = input.priority;
        if (input.due_date !== undefined) payload.due_date = input.due_date;
        if (input.is_completed !== undefined) payload.is_completed = input.is_completed;

        const { error: updateError } = await supabase
          .from('todos')
          .update(payload)
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }

        addToast('Task updated successfully', 'success');
        return true;
      } catch (err: any) {
        console.error('Error updating todo:', err);
        // Rollback
        setTodos((prev) => prev.map((t) => (t.id === id ? original : t)));
        addToast(`Failed to update task: ${err.message || 'Unknown error'}`, 'error');
        return false;
      }
    },
    [todos, addToast]
  );

  // DELETE Todo with optimistic UI & rollback
  const deleteTodo = useCallback(
    async (id: string): Promise<boolean> => {
      const originalIndex = todos.findIndex((t) => t.id === id);
      const original = todos[originalIndex];
      if (!original) return false;

      // Optimistic removal
      setTodos((prev) => prev.filter((t) => t.id !== id));

      try {
        const { error: deleteError } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);

        if (deleteError) {
          throw deleteError;
        }

        addToast('Task deleted successfully', 'success');
        return true;
      } catch (err: any) {
        console.error('Error deleting todo:', err);
        // Rollback
        setTodos((prev) => {
          const restored = [...prev];
          restored.splice(originalIndex, 0, original);
          return restored;
        });
        addToast(`Failed to delete task: ${err.message || 'Unknown error'}`, 'error');
        return false;
      }
    },
    [todos, addToast]
  );

  // Filtered todos based on active filters & search query
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Search query (title or description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(q);
        const matchesDesc = todo.description ? todo.description.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Status filter
      if (statusFilter === 'active' && todo.is_completed) return false;
      if (statusFilter === 'completed' && !todo.is_completed) return false;

      // Priority filter
      if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;

      // View rail filter
      if (viewFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        if (todo.due_date !== today) return false;
      } else if (viewFilter === 'completed') {
        if (!todo.is_completed) return false;
      } else if (viewFilter === 'high_priority') {
        if (todo.priority !== 'high') return false;
      }

      // Date strip filter
      if (selectedDate && todo.due_date !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [todos, searchQuery, statusFilter, priorityFilter, viewFilter, selectedDate]);

  // Live Metrics calculations
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.is_completed).length;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const highPriorityCount = todos.filter((t) => t.priority === 'high' && !t.is_completed).length;

  // Weekly Activity Heatmap Grid calculations (Current week Mon - Sun)
  const weeklyHeatmap = useMemo(() => {
    const now = new Date();
    // Find current Monday
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // For 7 days, generate grid cells (e.g. 4 rows of time/intensity or 4 slots per day)
    return days.map((dayName, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dateStr = d.toISOString().split('T')[0];

      // Count tasks completed or due on this date
      const completedOnDate = todos.filter((t) => {
        if (t.is_completed && t.updated_at) {
          return t.updated_at.split('T')[0] === dateStr;
        }
        return false;
      }).length;

      const createdOnDate = todos.filter((t) => t.created_at?.split('T')[0] === dateStr).length;

      // Total activity weight
      const activityScore = completedOnDate * 2 + createdOnDate;

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (activityScore >= 6) intensity = 4; // Best
      else if (activityScore >= 4) intensity = 3; // High
      else if (activityScore >= 2) intensity = 2; // Medium
      else if (activityScore >= 1) intensity = 1; // Low

      return {
        day: dayName,
        date: dateStr,
        dayNumber: d.getDate(),
        isToday: d.toDateString() === now.toDateString(),
        completedCount: completedOnDate,
        activityScore,
        intensity,
      };
    });
  }, [todos]);

  return {
    todos: filteredTodos,
    allTodos: todos,
    loading,
    error,
    toasts,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    viewFilter,
    setViewFilter,
    selectedDate,
    setSelectedDate,
    // Operations
    fetchTodos,
    createTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    removeToast,
    addToast,
    // Metrics
    metrics: {
      totalCount,
      completedCount,
      pendingCount,
      completionRate,
      highPriorityCount,
    },
    weeklyHeatmap,
  };
}
