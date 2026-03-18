import { Toaster } from 'react-hot-toast';

export const Notification = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-status-done)',
            secondary: 'var(--color-bg-card)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--color-danger)',
            secondary: 'var(--color-bg-card)',
          },
        },
      }}
    />
  );
};

