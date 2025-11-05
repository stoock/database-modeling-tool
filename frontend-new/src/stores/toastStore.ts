import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  
  // 토스트 관리
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  
  // 편의 메서드
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  // 토스트 관리
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const duration = toast.duration || 3000;
    
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id, duration }],
    }));
    
    // 자동으로 duration 후 제거
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
  
  // 편의 메서드
  success: (title, description) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          title,
          description,
          variant: 'success' as const,
          duration: 3000,
        },
      ],
    }));
    
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
    
    return id;
  },
  
  error: (title, description) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          title,
          description,
          variant: 'destructive' as const,
          duration: 5000, // 에러는 조금 더 길게
        },
      ],
    }));
    
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
    
    return id;
  },
  
  warning: (title, description) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          title,
          description,
          variant: 'warning' as const,
          duration: 4000,
        },
      ],
    }));
    
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
    
    return id;
  },
  
  info: (title, description) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          title,
          description,
          variant: 'default' as const,
          duration: 3000,
        },
      ],
    }));
    
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
    
    return id;
  },
}));
