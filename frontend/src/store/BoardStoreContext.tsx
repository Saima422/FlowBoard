import { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BoardState, useBoardStore } from './boardStore';
import { usePlaygroundStore } from './playgroundStore';

const BoardStoreContext = createContext<BoardState | null>(null);

export function BoardStoreProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPlayground = location.pathname === '/playground';
  const boardStore = useBoardStore();
  const playgroundStore = usePlaygroundStore();
  const value = isPlayground ? playgroundStore : boardStore;

  return (
    <BoardStoreContext.Provider value={value}>
      {children}
    </BoardStoreContext.Provider>
  );
}

export function useBoardStoreContext(): BoardState {
  const ctx = useContext(BoardStoreContext);
  const fallback = useBoardStore();
  return ctx ?? fallback;
}
