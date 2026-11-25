import { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { LeftColumn } from './components/LeftColumn';
import { MiddleColumn } from './components/MiddleColumn';
import { RightColumn } from './components/RightColumn';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer } from './components/Toast';
import type { Todo, CreateTodoInput, UpdateTodoInput } from './types/todo';

export function App() {
  const {
    todos,
    allTodos,
    loading,
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
    createTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    removeToast,
    metrics,
    weeklyHeatmap,
  } = useTodos();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle create submission
  const handleCreateSubmit = async (data: CreateTodoInput | UpdateTodoInput) => {
    return await createTodo(data as CreateTodoInput);
  };

  // Handle edit submission
  const handleEditSubmit = async (data: CreateTodoInput | UpdateTodoInput) => {
    if (!editingTodo) return false;
    return await updateTodo(editingTodo.id, data as UpdateTodoInput);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deletingTodo) return false;
    setIsDeleting(true);
    const success = await deleteTodo(deletingTodo.id);
    setIsDeleting(false);
    if (success) {
      setDeletingTodo(null);
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-[#0B0D13] text-[#F3EFFF] flex flex-col items-center justify-start py-6 px-3 sm:px-6 lg:px-8 relative selection:bg-purple-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Main 3-Column Bento Grid Container */}
      <main className="w-full max-w-[1500px] flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Left Column (Analytics & Interactive Task Board) */}
        <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0 flex">
          <LeftColumn
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            metrics={metrics}
            weeklyHeatmap={weeklyHeatmap}
          />
        </div>

        {/* Middle Column (Slim Vertical Navigation Rail) */}
        <div className="flex">
          <MiddleColumn
            viewFilter={viewFilter}
            onViewFilterChange={setViewFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            onQuickAdd={() => setIsCreateOpen(true)}
            allTodos={allTodos}
          />
        </div>

        {/* Right Column (Live CRUD Task Feed & Brand Card) */}
        <div className="flex flex-1 min-w-0">
          <RightColumn
            todos={todos}
            loading={loading}
            onToggleTodo={toggleTodo}
            onEditTodo={(todo) => setEditingTodo(todo)}
            onDeleteTodo={(todo) => setDeletingTodo(todo)}
            onCreateTask={() => setIsCreateOpen(true)}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      </main>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        mode="create"
      />

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={!!editingTodo}
        initialData={editingTodo}
        onClose={() => setEditingTodo(null)}
        onSubmit={handleEditSubmit}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTodo}
        todo={deletingTodo}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
