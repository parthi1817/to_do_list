import React, { useState } from 'react';
import {
  Check,
  Edit2,
  Trash2,
  Plus,
  Clock,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Todo, Priority } from '../types/todo';
import { formatDate, isDateOverdue } from '../lib/utils';

interface RightColumnProps {
  todos: Todo[];
  loading: boolean;
  onToggleTodo: (id: string) => Promise<boolean>;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (todo: Todo) => void;
  onCreateTask: () => void;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export const RightColumn: React.FC<RightColumnProps> = ({
  todos,
  loading,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onCreateTask,
  selectedDate,
  onSelectDate,
}) => {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Generate 7-day strip (Monday to Sunday) for current week
  const weekDays = React.useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = d.toDateString() === now.toDateString();

      return {
        name: dayName,
        number: d.getDate(),
        date: dateStr,
        isToday,
      };
    });
  }, []);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    await onToggleTodo(id);
    setTogglingId(null);
  };

  const priorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Low
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col space-y-5 flex-1 min-w-0">
      {/* Top Card: Live CRUD Task Feed */}
      <div className="bento-card p-6 flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400">
                Live Feed
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Schedule & Tasks
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">
                {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
              </span>
              {selectedDate && (
                <button
                  onClick={() => onSelectDate(null)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-800/50 hover:bg-purple-900 transition-colors"
                >
                  Clear date
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Week Date Selector Strip */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-5 border-b border-gray-800/70 scrollbar-none">
            {weekDays.map((d) => {
              const isSelected = selectedDate === d.date;
              return (
                <button
                  key={d.date}
                  onClick={() => onSelectDate(isSelected ? null : d.date)}
                  className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl min-w-[54px] transition-all border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400/50 shadow-lg shadow-purple-600/40 scale-105'
                      : d.isToday
                      ? 'bg-[#1D2030] text-purple-300 border-purple-500/30 hover:border-purple-500/60'
                      : 'bg-[#151724] text-gray-400 border-gray-800/80 hover:text-gray-200 hover:bg-[#1B1E2D]'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {d.name}
                  </span>
                  <span className="text-base font-bold mt-0.5">{d.number}</span>
                  {d.isToday && (
                    <span
                      className={`w-1 h-1 rounded-full mt-1 ${
                        isSelected ? 'bg-white' : 'bg-purple-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scrollable To-Do Task Cards List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {loading ? (
              // Skeletons
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="p-4 rounded-2xl bg-[#161826] border border-gray-800/80 animate-pulse space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-1/3 bg-gray-800 rounded" />
                      <div className="h-4 w-16 bg-gray-800 rounded" />
                    </div>
                    <div className="h-3 w-3/4 bg-gray-800/60 rounded" />
                    <div className="flex items-center space-x-2 pt-2">
                      <div className="h-3 w-20 bg-gray-800 rounded" />
                      <div className="h-3 w-16 bg-gray-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : todos.length === 0 ? (
              // Empty State
              <div className="py-12 px-4 text-center rounded-2xl bg-[#141623]/80 border border-dashed border-gray-800 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">No tasks found</h4>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  {selectedDate
                    ? 'No tasks scheduled for this date. Select another day or create a new task.'
                    : 'Your task list is clear! Click the button below to add your first task to Supabase.'}
                </p>
                <button
                  onClick={onCreateTask}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>
            ) : (
              // Live Task List
              todos.map((todo) => {
                const overdue = isDateOverdue(todo.due_date, todo.is_completed);

                return (
                  <div
                    key={todo.id}
                    className={`group p-4 rounded-2xl border transition-all duration-200 relative ${
                      todo.is_completed
                        ? 'bg-[#131520]/80 border-gray-800/60 opacity-75'
                        : 'bg-[#181A27] hover:bg-[#1C1F2E] border-gray-800/90 hover:border-purple-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-3">
                      {/* Left: Checkbox & Info */}
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* Custom Checkbox */}
                        <button
                          onClick={() => handleToggle(todo.id)}
                          disabled={togglingId === todo.id}
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                            todo.is_completed
                              ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                              : 'border-gray-600 hover:border-purple-400 bg-transparent'
                          }`}
                          aria-label={
                            todo.is_completed ? 'Mark as active' : 'Mark as completed'
                          }
                        >
                          {todo.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-sm font-semibold tracking-tight transition-all truncate ${
                              todo.is_completed
                                ? 'line-through text-gray-500'
                                : 'text-gray-100 group-hover:text-purple-200'
                            }`}
                          >
                            {todo.title}
                          </h4>
                          {todo.description && (
                            <p
                              className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                                todo.is_completed ? 'text-gray-600' : 'text-gray-400'
                              }`}
                            >
                              {todo.description}
                            </p>
                          )}

                          {/* Meta Badges Row */}
                          <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-1">
                            {/* Priority Badge */}
                            {priorityBadge(todo.priority)}

                            {/* Due Date Badge */}
                            {todo.due_date && (
                              <span
                                className={`flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                  overdue
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold'
                                    : 'bg-[#131520] text-gray-400 border-gray-800'
                                }`}
                              >
                                {overdue ? (
                                  <AlertCircle className="w-3 h-3 text-rose-400" />
                                ) : (
                                  <Clock className="w-3 h-3 text-gray-500" />
                                )}
                                <span>{overdue ? 'Overdue: ' : ''}{formatDate(todo.due_date)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons (Edit & Delete) */}
                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => onEditTodo(todo)}
                          title="Edit task"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-purple-900/30 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTodo(todo)}
                          title="Delete task"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-900/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Full-width Lavender + Create Activity / + Create Task button at the bottom */}
        <div className="pt-5 border-t border-gray-800/80 mt-5">
          <button
            onClick={onCreateTask}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Task</span>
          </button>
        </div>
      </div>

      {/* Bottom-Right Card (replacing "Sapphire UI") */}
      <div
        className="bento-card p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #241442 0%, #151726 60%, #10121C 100%)',
          borderColor: 'rgba(168, 85, 247, 0.3)',
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-md">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Supabase Connected
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white tracking-tight mt-0.5">
                TaskFlow CRUD — Supabase + React
              </h3>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-purple-200/80 leading-relaxed font-normal">
          Connected directly to PostgreSQL <code className="text-purple-300 font-mono bg-black/30 px-1 py-0.5 rounded">public.todos</code>. Full CRUD operations with optimistic state sync and rollback protection.
        </p>

        <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>PostgreSQL 15</span>
          </span>
          <span className="text-purple-300/80 font-medium">
            React 18 • TypeScript • Tailwind
          </span>
        </div>
      </div>
    </div>
  );
};
