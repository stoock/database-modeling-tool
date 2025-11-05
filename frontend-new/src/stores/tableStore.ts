import { create } from 'zustand';
import type { Table, CreateTableRequest, UpdateTableRequest } from '@/types';
import apiClient from '@/lib/api';

interface TableStore {
  tables: Table[];
  selectedTable: Table | null;
  isLoading: boolean;
  error: string | null;
  
  // 기본 상태 관리
  setTables: (tables: Table[]) => void;
  setSelectedTable: (table: Table | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD 액션
  fetchTablesByProject: (projectId: string) => Promise<void>;
  fetchTableById: (id: string) => Promise<void>;
  createTable: (data: CreateTableRequest) => Promise<Table>;
  updateTable: (id: string, data: UpdateTableRequest) => Promise<Table>;
  deleteTable: (id: string) => Promise<void>;
  
  // 유틸리티
  clearError: () => void;
  reset: () => void;
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  selectedTable: null,
  isLoading: false,
  error: null,
  
  // 기본 상태 관리
  setTables: (tables) => set({ tables }),
  
  setSelectedTable: (table) => set({ selectedTable: table }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // CRUD 액션
  fetchTablesByProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Table[]>(`/projects/${projectId}/tables`);
      set({ tables: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || '테이블 목록을 불러오는데 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  fetchTableById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Table>(`/tables/${id}`);
      set({ selectedTable: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || '테이블을 불러오는데 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  createTable: async (data: CreateTableRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Table>('/tables', data);
      const newTable = response.data;
      
      // 테이블 목록에 추가
      set((state) => ({
        tables: [...state.tables, newTable],
        isLoading: false,
      }));
      
      return newTable;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || '테이블 생성에 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  updateTable: async (id: string, data: UpdateTableRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<Table>(`/tables/${id}`, data);
      const updatedTable = response.data;
      
      // 테이블 목록 업데이트
      set((state) => ({
        tables: state.tables.map((t) => (t.id === id ? updatedTable : t)),
        selectedTable: state.selectedTable?.id === id ? updatedTable : state.selectedTable,
        isLoading: false,
      }));
      
      return updatedTable;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || '테이블 수정에 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  deleteTable: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/tables/${id}`);
      
      // 테이블 목록에서 제거
      set((state) => ({
        tables: state.tables.filter((t) => t.id !== id),
        selectedTable: state.selectedTable?.id === id ? null : state.selectedTable,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || '테이블 삭제에 실패했습니다';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // 유틸리티
  clearError: () => set({ error: null }),
  
  reset: () => set({
    tables: [],
    selectedTable: null,
    isLoading: false,
    error: null,
  }),
}));
