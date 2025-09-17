import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ActiveToast extends ToastOptions {
  id: string;
}

interface ToastState {
  toasts: ActiveToast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  clear: () => void;
}

export const useToastStore = create<ToastState>()(
  devtools(
    (set, get) => ({
      toasts: [],

      addToast: (options: ToastOptions): string => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: ActiveToast = {
          id,
          ...options
        };

        set((state) => ({
          toasts: [...state.toasts, toast]
        }));

        return id;
      },

      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }));
      },

      success: (title: string, message?: string, duration?: number) => {
        return get().addToast({ type: 'success', title, message, duration });
      },

      error: (title: string, message?: string, duration?: number) => {
        return get().addToast({ type: 'error', title, message, duration });
      },

      warning: (title: string, message?: string, duration?: number) => {
        return get().addToast({ type: 'warning', title, message, duration });
      },

      info: (title: string, message?: string, duration?: number) => {
        return get().addToast({ type: 'info', title, message, duration });
      },

      clear: () => {
        set({ toasts: [] });
      }
    }),
    {
      name: 'toast-store'
    }
  )
);