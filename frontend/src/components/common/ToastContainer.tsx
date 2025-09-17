import React from 'react';
import { Toast } from './Toast';
import { useToastStore } from '../../stores/toastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </>
  );
};

export default ToastContainer;