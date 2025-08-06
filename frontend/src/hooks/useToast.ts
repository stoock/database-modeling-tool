import { useState, useCallback } from 'react';
import type { ToastProps } from '../components/common/Toast';

export interface ToastOptions {
  type: ToastProps['type'];
  title: string;
  message?: string;
  duration?: number;
}

export interface ActiveToast extends ToastOptions {
  id: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ActiveToast = {
      id,
      ...options
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear
  };
};

export default useToast;