import React from 'react';
import ReactDOM from 'react-dom/client';
import './store/themeStore'; // apply saved theme before first paint
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

