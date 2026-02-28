import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '@/store/boardStore';
import { List, Task } from '@/types';
import { TaskCard } from './TaskCard';
import { ConfirmModal } from '../common/ConfirmModal';
import toast from 'react-hot-toast';
import './Board.scss';

interface ListColumnProps {
  list: List;
  tasks: Task[];
}

export const ListColumn = ({ list, tasks }: ListColumnProps) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);
  const { createTask, deleteList } = useBoardStore();
  const { setNodeRef } = useDroppable({ id: `list-${list._id}` });

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsAddingTask(true);
    try {
      await createTask({
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        listId: list._id,
        boardId: list.board,
      });
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setShowAddTask(false);
      toast.success('Task created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteList = async () => {
    setIsDeletingList(true);
    try {
      await deleteList(list._id);
      toast.success('List deleted successfully!');
      setShowDeleteModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete list');
    } finally {
      setIsDeletingList(false);
    }
  };

  return (
    <>
      <div className="list-column">
        <div className="list-header">
          <h3>{list.title}</h3>
          <button onClick={() => setShowDeleteModal(true)} className="delete-btn" title="Delete list">
            ×
          </button>
        </div>

      <SortableContext items={sortedTasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="task-list" ref={setNodeRef}>
          {sortedTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
          {sortedTasks.length === 0 && (
            <div className="task-list-empty">Drop tasks here</div>
          )}
        </div>
      </SortableContext>

      {showAddTask ? (
        <form onSubmit={handleAddTask} className="add-task-form">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title..."
            autoFocus
            required
          />
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={3}
          />
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="form-actions">
            <button type="submit" className="btn-primary-sm" disabled={isAddingTask}>
              {isAddingTask ? 'Adding...' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddTask(false);
                setTaskTitle('');
                setTaskDescription('');
                setTaskPriority('medium');
              }}
              className="btn-secondary-sm"
              disabled={isAddingTask}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowAddTask(true)} className="add-task-btn">
          + Add a card
        </button>
      )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete List"
        message={`Are you sure you want to delete "${list.title}" and all its tasks? This action cannot be undone.`}
        confirmText={isDeletingList ? "Deleting..." : "Delete List"}
        cancelText="Cancel"
        onConfirm={handleDeleteList}
        onCancel={() => setShowDeleteModal(false)}
        isDangerous
        isLoading={isDeletingList}
      />
    </>
  );
};

