import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { BoardStoreProvider } from './store/BoardStoreContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { BoardList } from './components/board/BoardList';
import { BoardView } from './components/board/BoardView';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Notification } from './components/common/Notification';
import { RouteTransitionLoader } from './components/common/RouteTransitionLoader';
import './styles/global.scss';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <BoardStoreProvider>
        <RouteTransitionLoader />
        <Notification />
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/boards" replace /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/playground" element={<BoardView />} />
          <Route
            path="/boards"
            element={
              <ProtectedRoute>
                <BoardList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/board/:id"
            element={
              <ProtectedRoute>
                <BoardView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BoardStoreProvider>
    </BrowserRouter>
  );
}

export default App;

