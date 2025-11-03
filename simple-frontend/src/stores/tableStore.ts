/**
 * 테이블 상태 관리 스토어
 */

import { create } from 'zustand';
import { tableService } from '../services/tableService';
import { columnService } from '../services/columnService';
import { indexService } from '../services/indexService';
import type { Table, TableSummary, CreateTableRequest, UpdateTableRequest } from '../types/table';
import type { Column, CreateColumnRequest, UpdateColumnRequest } from '../types/column';
import type { Index, CreateIndexRequest } from '../types/index';

interface TableStore {
  // 상태
  tables: TableSummary[];
  currentTable: Table | null;
  loading: boolean;
  error: string | null;

  // 테이블 액션
  fetchTables: (projectId: string) => Promise<void>;
  fetchTable: (id: string) => Promise<void>;
  createTable: (projectId: string, data: CreateTableRequest) => Promise<Table>;
  updateTable: (id: string, data: UpdateTableRequest) => Promise<Table>;
  deleteTable: (id: string) => Promise<void>;

  // 컬럼 액션
  createColumn: (tableId: string, data: CreateColumnRequest) => Promise<Column>;
  updateColumn: (id: string, data: UpdateColumnRequest) => Promise<Column>;
  deleteColumn: (id: string) => Promise<void>;

  // 인덱스 액션
  createIndex: (tableId: string, data: CreateIndexRequest) => Promise<Index>;
  deleteIndex: (id: string) => Promise<void>;

  // 유틸리티
  clearError: () => void;
}

export const useTableStore = create<TableStore>((set) => ({
  // 초기 상태
  tables: [],
  currentTable: null,
  loading: false,
  error: null,

  // 테이블 목록 조회
  fetchTables: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const tables = await tableService.getByProjectId(projectId);
      set({ tables, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '테이블 목록 조회 실패',
        loading: false,
      });
    }
  },

  // 테이블 상세 조회
  fetchTable: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const table = await tableService.getById(id);
      set({ currentTable: table, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '테이블 조회 실패',
        loading: false,
      });
    }
  },

  // 테이블 생성
  createTable: async (projectId: string, data: CreateTableRequest) => {
    set({ loading: true, error: null });
    try {
      const table = await tableService.create(projectId, data);
      set((state) => ({
        tables: [
          ...state.tables,
          { ...table, columnCount: 0, indexCount: 0 },
        ],
        loading: false,
      }));
      return table;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '테이블 생성 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 테이블 수정
  updateTable: async (id: string, data: UpdateTableRequest) => {
    set({ loading: true, error: null });
    try {
      const table = await tableService.update(id, data);
      set((state) => ({
        tables: state.tables.map((t) =>
          t.id === id ? { ...t, ...data } : t
        ),
        currentTable: state.currentTable?.id === id ? table : state.currentTable,
        loading: false,
      }));
      return table;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '테이블 수정 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 테이블 삭제
  deleteTable: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await tableService.delete(id);
      set((state) => ({
        tables: state.tables.filter((t) => t.id !== id),
        currentTable: state.currentTable?.id === id ? null : state.currentTable,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '테이블 삭제 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 컬럼 생성
  createColumn: async (tableId: string, data: CreateColumnRequest) => {
    set({ loading: true, error: null });
    try {
      const column = await columnService.create(tableId, data);
      set((state) => ({
        currentTable: state.currentTable?.id === tableId
          ? {
              ...state.currentTable,
              columns: [...state.currentTable.columns, column],
            }
          : state.currentTable,
        loading: false,
      }));
      return column;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '컬럼 생성 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 컬럼 수정
  updateColumn: async (id: string, data: UpdateColumnRequest) => {
    set({ loading: true, error: null });
    try {
      const column = await columnService.update(id, data);
      set((state) => ({
        currentTable: state.currentTable
          ? {
              ...state.currentTable,
              columns: state.currentTable.columns.map((c) =>
                c.id === id ? column : c
              ),
            }
          : null,
        loading: false,
      }));
      return column;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '컬럼 수정 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 컬럼 삭제
  deleteColumn: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await columnService.delete(id);
      set((state) => ({
        currentTable: state.currentTable
          ? {
              ...state.currentTable,
              columns: state.currentTable.columns.filter((c) => c.id !== id),
            }
          : null,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '컬럼 삭제 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 인덱스 생성
  createIndex: async (tableId: string, data: CreateIndexRequest) => {
    set({ loading: true, error: null });
    try {
      const index = await indexService.create(tableId, data);
      set((state) => ({
        currentTable: state.currentTable?.id === tableId
          ? {
              ...state.currentTable,
              indexes: [...state.currentTable.indexes, index],
            }
          : state.currentTable,
        loading: false,
      }));
      return index;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '인덱스 생성 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 인덱스 삭제
  deleteIndex: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await indexService.delete(id);
      set((state) => ({
        currentTable: state.currentTable
          ? {
              ...state.currentTable,
              indexes: state.currentTable.indexes.filter((i) => i.id !== id),
            }
          : null,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '인덱스 삭제 실패',
        loading: false,
      });
      throw error;
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));
