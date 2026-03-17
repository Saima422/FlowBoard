import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStoreContext } from '@/store/BoardStoreContext';
import { List, Task } from '@/types';
import { TaskCard } from './TaskCard';
import { ConfirmModal } from '../common/ConfirmModal';
import toast from 'react-hot-toast';
import './Board.scss';

function toSentenceCase(s: string): string {
  if (!s || s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

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
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState(list.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);
  const [isRenamingList, setIsRenamingList] = useState(false);
  const { createTask, deleteList, updateList } = useBoardStoreContext();
  const { setNodeRef } = useDroppable({ id: `list-${list._id}` });

  useEffect(() => {
    setRenameValue(list.title);
  }, [list.title]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleRenameList = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === list.title) {
      setShowRenameModal(false);
      return;
    }
    setIsRenamingList(true);
    try {
      await updateList(list._id, { title: trimmed });
      toast.success('List renamed');
      setShowRenameModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to rename list');
    } finally {
      setIsRenamingList(false);
    }
  };

  return (
    <>
      <div className="list-column">
        <div className="list-header">
          <h3>{toSentenceCase(list.title)}</h3>
          <span className="list-header-pill">{tasks.length}</span>
          <div className="list-header-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="list-header-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              title="List options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              ···
            </button>
            {menuOpen && (
              <div className="list-header-dropdown">
                <button type="button" onClick={() => { setMenuOpen(false); setShowRenameModal(true); }}>
                  Rename
                </button>
                <button type="button" onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }} className="list-header-dropdown-danger">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

      <SortableContext items={sortedTasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="task-list" ref={setNodeRef}>
          {sortedTasks.map((task) => (
            <TaskCard key={task._id} task={task} listTitle={list.title} />
          ))}
          {sortedTasks.length === 0 && (
            <div className="task-list-empty">No cards yet</div>
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
              {isAddingTask ? 'Adding...' : 'Add task'}
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
        <button type="button" onClick={() => setShowAddTask(true)} className="add-task-btn">
          + Add a task
        </button>
      )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete list"
        message={`Are you sure you want to delete "${list.title}" and all its tasks? This action cannot be undone.`}
        confirmText={isDeletingList ? "Deleting..." : "Delete list"}
        cancelText="Cancel"
        onConfirm={handleDeleteList}
        onCancel={() => setShowDeleteModal(false)}
        isDangerous
        isLoading={isDeletingList}
      />

      {showRenameModal && (
        <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal modal-rename-list" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rename list</h2>
              <button type="button" onClick={() => setShowRenameModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameList()}
                className="rename-list-input"
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowRenameModal(false)} className="btn-secondary-sm">Cancel</button>
                <button type="button" onClick={handleRenameList} className="btn-primary-sm" disabled={isRenamingList || !renameValue.trim()}>
                  {isRenamingList ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

