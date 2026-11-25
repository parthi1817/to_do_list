import React from 'react';
import {
  Inbox,
  Calendar,
  CheckCircle2,
  Flame,
  Plus,
  Layers,
} from 'lucide-react';
import type { ViewFilter, PriorityFilter, Todo } from '../types/todo';

interface MiddleColumnProps {
  viewFilter: ViewFilter;
  onViewFilterChange: (view: ViewFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilterChange: (priority: PriorityFilter) => void;
  onQuickAdd: () => void;
  allTodos: Todo[];
}

export const MiddleColumn: React.FC<MiddleColumnProps> = ({
  viewFilter,
  onViewFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onQuickAdd,
  allTodos,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const viewItems = [
    {
      id: 'all' as ViewFilter,
      label: 'All Tasks',
      icon: Inbox,
      count: allTodos.length,
    },
    {
      id: 'today' as ViewFilter,
      label: 'Today',
      icon: Calendar,
      count: allTodos.filter((t) => t.due_date === todayStr).length,
    },
    {
      id: 'completed' as ViewFilter,
      label: 'Completed',
      icon: CheckCircle2,
      count: allTodos.filter((t) => t.is_completed).length,
    },
    {
      id: 'high_priority' as ViewFilter,
      label: 'High Priority',
      icon: Flame,
      count: allTodos.filter((t) => t.priority === 'high' && !t.is_completed).length,
    },
  ];

  const priorityItems = [
    {
      id: 'all' as PriorityFilter,
      label: 'All Priorities',
      dotColor: 'bg-gray-400',
      count: allTodos.length,
    },
    {
      id: 'high' as PriorityFilter,
      label: 'High',
      dotColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      count: allTodos.filter((t) => t.priority === 'high').length,
    },
    {
      id: 'medium' as PriorityFilter,
      label: 'Medium',
      dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      count: allTodos.filter((t) => t.priority === 'medium').length,
    },
    {
      id: 'low' as PriorityFilter,
      label: 'Low',
      dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      count: allTodos.filter((t) => t.priority === 'low').length,
    },
  ];

  return (
    <aside className="w-full lg:w-56 shrink-0 bento-card p-5 flex flex-col justify-between self-stretch">
      <div className="space-y-6">
        {/* Brand Header inside Rail */}
        <div className="flex items-center space-x-2.5 pb-4 border-b border-gray-800/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              TaskFlow
            </h1>
            <p className="text-[10px] text-purple-300/80 font-medium">
              Supabase CRUD
            </p>
          </div>
        </div>

        {/* Group: VIEWS */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block px-2 mb-2">
            Views
          </span>
          <nav className="space-y-1">
            {viewItems.map((item) => {
              const Icon = item.icon;
              const isActive = viewFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewFilterChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1D2C] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-purple-400' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-purple-500/30 text-purple-200 font-bold'
                        : 'bg-black/30 text-gray-400'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Group: PRIORITY FILTERS */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block px-2 mb-2">
            Priority Filters
          </span>
          <nav className="space-y-1">
            {priorityItems.map((item) => {
              const isActive = priorityFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPriorityFilterChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1D2C] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-purple-500/30 text-purple-200 font-bold'
                        : 'bg-black/30 text-gray-400'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Purple Pill Action Button at the Bottom */}
      <div className="pt-6 border-t border-gray-800/80">
        <button
          onClick={onQuickAdd}
          className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Quick Add</span>
        </button>
      </div>
    </aside>
  );
};
