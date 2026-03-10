import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStoreContext } from '@/store/BoardStoreContext';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import './Board.scss';

export const BoardList = () => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { boards, fetchBoards, createBoard, isLoading } = useBoardStoreContext();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const board = await createBoard({ title, description });
      toast.success('Board created successfully!');
      setShowModal(false);
      setTitle('');
      setDescription('');
      navigate(`/board/${board._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
    );
  }

  return (
    <div className="board-list-container">
      <header className="board-list-header">
        <h1>FlowBoard – My Boards</h1>
        <div className="header-actions">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="boards-grid">
        <div className="board-card create-board-card" onClick={() => setShowModal(true)}>
          <div className="create-board-icon">+</div>
          <p>Create new board</p>
        </div>

        {boards.map((board) => (
          <div
            key={board._id}
            className="board-card"
            style={{ backgroundColor: board.backgroundColor }}
            onClick={() => navigate(`/board/${board._id}`)}
          >
            <h3>{board.title}</h3>
            {board.description && <p className="board-description">{board.description}</p>}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Board</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>
            <form onSubmit={handleCreateBoard} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Board Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter board title"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter board description"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={isCreating}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

