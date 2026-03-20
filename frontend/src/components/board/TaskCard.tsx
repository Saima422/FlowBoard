import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";
import { useBoardStoreContext } from "@/store/BoardStoreContext";
import { ConfirmModal } from "../common/ConfirmModal";
import { format } from "date-fns";
import clsx from "clsx";
import toast from "react-hot-toast";
import "./Board.scss";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  listTitle?: string;
}

function getStatusFromListTitle(listTitle?: string): "todo" | "doing" | "done" {
  if (!listTitle) return "todo";
  const t = listTitle.toLowerCase();
  if (t === "to do") return "todo";
  if (t === "in progress") return "doing";
  if (t === "done") return "done";
  return "todo";
}

export const TaskCard = ({ task, isDragging, listTitle }: TaskCardProps) => {
  const status = getStatusFromListTitle(listTitle);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    task.priority
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const { updateTask, deleteTask } = useBoardStoreContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTask(task._id, { title, description, priority });
      setIsEditing(false);
      toast.success("Task updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task._id);
      setShowModal(false);
      setShowDeleteModal(false);
      toast.success("Task deleted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = async () => {
    setIsTogglingComplete(true);
    try {
      await updateTask(task._id, { isCompleted: !task.isCompleted });
    } catch (error: any) {
      toast.error("Failed to update task");
    } finally {
      setIsTogglingComplete(false);
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "var(--color-priority-high)";
      case "medium":
        return "var(--color-priority-medium)";
      case "low":
        return "var(--color-priority-low)";
      default:
        return "var(--color-priority-low)";
    }
  };

  if (isDragging) {
    return (
      <div className="task-card dragging">
        <div className="task-card-drag-handle">⋮⋮</div>
        <div className="task-card-content">
          <div
            className="task-priority"
            style={{ backgroundColor: getPriorityColor() }}
          />
          <button className="task-complete-btn">
            {task.isCompleted ? "✓" : "○"}
          </button>
          <h4>{task.title}</h4>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={clsx("task-card", { completed: task.isCompleted })}
        data-status={status}
      >
        <div className="task-card-drag-handle" {...listeners}>
          ⋮⋮
        </div>
        <div className="task-card-content" onClick={() => setShowModal(true)}>
          <div
            className="task-priority"
            style={{ backgroundColor: getPriorityColor() }}
          />
          <button
            className="task-complete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete();
            }}
            title={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
            disabled={isTogglingComplete}
          >
            {isTogglingComplete ? "..." : task.isCompleted ? "✓" : "○"}
          </button>
          <h4>{task.title}</h4>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          {task.labels && task.labels.length > 0 && (
            <div className="task-labels">
              {task.labels.map((label, index) => (
                <span key={index} className="label">
                  {label}
                </span>
              ))}
            </div>
          )}
          {task.dueDate && (
            <div className="task-due-date">
              📅 {format(new Date(task.dueDate), "MMM dd, yyyy")}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal task-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Task Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <div className="modal-body">
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as "low" | "medium" | "high")
                      }
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button onClick={handleCancel} className="btn-secondary" disabled={isSaving}>
                      Cancel
                    </button>
                    <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{task.title}</h3>
                  <p className="task-detail-description">
                    {task.description || "No description"}
                  </p>

                  <div className="task-details">
                    <div className="detail-item">
                      <strong>Priority:</strong>
                      <span style={{ color: getPriorityColor() }}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong>
                      <span>
                        {task.isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div className="detail-item">
                        <strong>Due Date:</strong>
                        <span>
                          {format(new Date(task.dueDate), "MMMM dd, yyyy")}
                        </span>
                      </div>
                    )}
                    <div className="detail-item">
                      <strong>Created by:</strong>
                      <span>{task.createdBy.name}</span>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleToggleComplete}
                      className="btn-secondary"
                      disabled={isTogglingComplete}
                    >
                      {isTogglingComplete ? "Updating..." : task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Task"}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isDangerous
        isLoading={isDeleting}
      />
    </>
  );
};
