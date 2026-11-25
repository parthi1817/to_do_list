import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Sparkles } from 'lucide-react';
import type { Priority, Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => Promise<boolean>;
  initialData?: Todo | null;
  mode: 'create' | 'edit';
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setPriority(initialData.priority);
      setDueDate(initialData.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      // Default to today or empty
      setDueDate('');
    }
    setValidationError(null);
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please enter a task title');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const success = await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const priorityOptions: { value: Priority; label: string; activeClasses: string; inactiveClasses: string }[] = [
    {
      value: 'low',
      label: 'Low',
      activeClasses: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      inactiveClasses: 'bg-[#1C1F2E] text-gray-400 border-transparent hover:border-gray-700',
    },
    {
      value: 'medium',
      label: 'Medium',
      activeClasses: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      inactiveClasses: 'bg-[#1C1F2E] text-gray-400 border-transparent hover:border-gray-700',
    },
    {
      value: 'high',
      label: 'High',
      activeClasses: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
      inactiveClasses: 'bg-[#1C1F2E] text-gray-400 border-transparent hover:border-gray-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#141622] border border-purple-500/20 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at bottom left, rgba(131, 56, 236, 0.22) 0%, rgba(20, 22, 34, 0) 65%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {mode === 'create' ? 'Create New Task' : 'Edit Task'}
              </h3>
              <p className="text-xs text-gray-400">
                {mode === 'create'
                  ? 'Add a new task to your Supabase PostgreSQL database'
                  : 'Update task properties and sync with database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Finalize system architecture & APIs"
              autoFocus
              className="w-full px-3.5 py-2.5 bg-[#1C1F2E] border border-gray-700/70 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Description <span className="text-gray-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add key deliverables, notes, or links..."
              className="w-full px-3.5 py-2.5 bg-[#1C1F2E] border border-gray-700/70 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all resize-none"
            />
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Flag className="w-3.5 h-3.5 text-gray-400" />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      priority === opt.value ? opt.activeClasses : opt.inactiveClasses
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#1C1F2E] border border-gray-700/70 focus:border-purple-500 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all scheme-dark cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Create Task' : 'Save Changes'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
