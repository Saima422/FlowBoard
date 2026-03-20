import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBoardStoreContext } from "@/store/BoardStoreContext";
import { PLAYGROUND_BOARD_ID } from "@/store/playgroundStore";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ListColumn } from "./ListColumn";
import { TaskCard } from "./TaskCard";
import { Task } from "@/types";
import toast from "react-hot-toast";
import "./Board.scss";

function toSentenceCase(s: string): string {
  if (!s || s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export const BoardView = () => {
  const location = useLocation();
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isPlayground = location.pathname === "/playground";
  const boardId = isPlayground ? PLAYGROUND_BOARD_ID : paramId;

  const {
    currentBoard,
    lists,
    tasks,
    fetchBoard,
    createList,
    moveTask,
    isLoading,
  } = useBoardStoreContext();

  const [newListTitle, setNewListTitle] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [boardId, fetchBoard]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !boardId) return;

    setIsCreatingList(true);
    try {
      await createList(newListTitle, boardId);
      setNewListTitle("");
      setShowNewList(false);
      toast.success("List created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create list");
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleDragStart = (event: any) => {
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    const overId = over.id.toString();
    const isOverList = overId.startsWith("list-");

    const sourceListId = activeTask.list;
    let destinationListId = sourceListId;

    // Determine destination list
    if (isOverList) {
      destinationListId = overId.replace("list-", "");
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        destinationListId = overTask.list;
      }
    }

    const sourceListTasks = tasks
      .filter((t) => t.list === sourceListId)
      .sort((a, b) => a.position - b.position);
    const destinationListTasks = tasks
      .filter((t) => t.list === destinationListId && t._id !== active.id)
      .sort((a, b) => a.position - b.position);

    const sourcePosition = sourceListTasks.findIndex(
      (t) => t._id === active.id
    );
    let destinationPosition = 0;

    if (isOverList) {
      // Dropped on empty list - place at position 0
      destinationPosition = 0;
    } else {
      // Dropped on another task - place it before that task
      destinationPosition = destinationListTasks.findIndex(
        (t) => t._id === overId
      );
      if (destinationPosition === -1) {
        destinationPosition = destinationListTasks.length;
      }
    }

    // Don't move if same position in same list
    if (
      sourceListId === destinationListId &&
      sourcePosition === destinationPosition
    ) {
      return;
    }

    try {
      await moveTask(
        activeTask._id,
        sourceListId,
        destinationListId,
        sourcePosition,
        destinationPosition
      );
      if (sourceListId !== destinationListId) {
        toast.success("Task moved successfully!");
      }
    } catch (error) {
      toast.error("Failed to move task");
      if (boardId) {
        fetchBoard(boardId);
      }
    }
  };

  if (isLoading || !currentBoard) {
    return (
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="board-view"
        style={{ backgroundColor: currentBoard.backgroundColor }}
      >
        <header className="board-header">
          <div className="board-header-left">
            <button
              onClick={() => navigate(isPlayground ? "/login" : "/boards")}
              className="back-btn"
            >
              {isPlayground ? "← Back to login" : "← Back to boards"}
            </button>
            <span className="board-title-inline">{toSentenceCase(currentBoard.title)}</span>
          </div>
          <ThemeToggle />
        </header>
        {isPlayground && (
          <div className="playground-banner">
            <span className="playground-banner-text">Playground mode — data is not saved when you close this tab.</span>
            <Link to="/register" className="playground-banner-link">Sign up to save →</Link>
          </div>
        )}

        <div className="board-content">
          <SortableContext
            items={lists.map((l) => l._id)}
            strategy={horizontalListSortingStrategy}
          >
            {lists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                tasks={tasks.filter((t) => t.list === list._id)}
              />
            ))}
          </SortableContext>

          <div className={`add-list-container${showNewList ? ' add-list-container--form' : ''}`}>
            {showNewList ? (
              <form onSubmit={handleCreateList} className="new-list-form">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Enter list title..."
                  autoFocus
                />
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={isCreatingList}>
                    {isCreatingList ? "Adding..." : "Add list"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewList(false);
                      setNewListTitle("");
                    }}
                    className="btn-secondary"
                    disabled={isCreatingList}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewList(true)}
                className="add-list-btn"
              >
                + Add another list
              </button>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};
