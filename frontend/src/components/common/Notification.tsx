import { Toaster } from 'react-hot-toast';

export const Notification = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#fff',
          color: '#172b4d',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: '#61bd4f',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#eb5a46',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

