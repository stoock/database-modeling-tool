import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  Table, 
  Column, 
  Index,
  CreateTableRequest,
  UpdateTableRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateIndexRequest,
  UpdateIndexRequest
} from '../types';
import { cachedApiClient } from '../services/cachedApi';
import { handleApiError } from '../services/api';

interface TableState {
  // 상태
  tables: Table[];
  selectedTable: Table | null;
  selectedColumn: Column | null;
  isLoading: boolean;
  error: string | null;

  // 테이블 액션
  loadTables: (projectId: string) => Promise<void>;
  createTable: (projectId: string, request: CreateTableRequest) => Promise<Table | null>;
  updateTable: (id: string, request: UpdateTableRequest) => Promise<Table | null>;
  deleteTable: (id: string) => Promise<boolean>;
  setSelectedTable: (table: Table | null) => void;
  updateTablePosition: (id: string, x: number, y: number) => Promise<void>;

  // 컬럼 액션
  createColumn: (tableId: string, request: CreateColumnRequest) => Promise<Column | null>;
  updateColumn: (id: string, request: UpdateColumnRequest) => Promise<Column | null>;
  deleteColumn: (id: string) => Promise<boolean>;
  setSelectedColumn: (column: Column | null) => void;
  reorderColumns: (tableId: string, columnIds: string[]) => Promise<void>;

  // 인덱스 액션
  createIndex: (tableId: string, request: CreateIndexRequest) => Promise<Index | null>;
  updateIndex: (id: string, request: UpdateIndexRequest) => Promise<Index | null>;
  deleteIndex: (id: string) => Promise<boolean>;

  // 유틸리티
  getTableById: (id: string) => Table | undefined;
  getColumnById: (id: string) => Column | undefined;
  getIndexById: (id: string) => Index | undefined;
  clearError: () => void;
}

export const useTableStore = create<TableState>()(
  devtools(
    immer((set, get) => ({
      // 초기 상태
      tables: [],
      selectedTable: null,
      selectedColumn: null,
      isLoading: false,
      error: null,

      // 테이블 목록 로드
      loadTables: async (projectId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const tables = await cachedApiClient.getTables(projectId);
          set((state) => {
            state.tables = tables;
            state.isLoading = false;
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
        }
      },

      // 테이블 생성
      createTable: async (projectId: string, request: CreateTableRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const newTable = await cachedApiClient.createTable(projectId, request);
          set((state) => {
            state.tables.push(newTable);
            state.selectedTable = newTable;
            state.isLoading = false;
          });
          return newTable;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return null;
        }
      },

      // 테이블 업데이트
      updateTable: async (id: string, request: UpdateTableRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const updatedTable = await cachedApiClient.updateTable(id, request);
          set((state) => {
            const index = state.tables.findIndex(t => t.id === id);
            if (index !== -1) {
              state.tables[index] = updatedTable;
            }
            if (state.selectedTable?.id === id) {
              state.selectedTable = updatedTable;
            }
            state.isLoading = false;
          });
          return updatedTable;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return null;
        }
      },

      // 테이블 삭제
      deleteTable: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await cachedApiClient.deleteTable(id);
          set((state) => {
            state.tables = state.tables.filter(t => t.id !== id);
            if (state.selectedTable?.id === id) {
              state.selectedTable = null;
            }
            state.isLoading = false;
          });
          return true;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return false;
        }
      },

      // 선택된 테이블 설정
      setSelectedTable: (table: Table | null) => {
        set((state) => {
          state.selectedTable = table;
          state.selectedColumn = null; // 테이블 변경 시 선택된 컬럼 초기화
        });
      },

      // 테이블 위치 업데이트
      updateTablePosition: async (id: string, x: number, y: number) => {
        try {
          const updatedTable = await cachedApiClient.updateTable(id, { positionX: x, positionY: y });
          set((state) => {
            const index = state.tables.findIndex(t => t.id === id);
            if (index !== -1) {
              state.tables[index] = updatedTable;
            }
            if (state.selectedTable?.id === id) {
              state.selectedTable = updatedTable;
            }
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
          });
        }
      },

      // 컬럼 생성
      createColumn: async (tableId: string, request: CreateColumnRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const newColumn = await cachedApiClient.createColumn(tableId, request);
          set((state) => {
            const tableIndex = state.tables.findIndex(t => t.id === tableId);
            if (tableIndex !== -1) {
              state.tables[tableIndex].columns.push(newColumn);
              // 컬럼을 orderIndex로 정렬
              state.tables[tableIndex].columns.sort((a, b) => a.orderIndex - b.orderIndex);
            }
            if (state.selectedTable?.id === tableId) {
              state.selectedTable.columns.push(newColumn);
              state.selectedTable.columns.sort((a, b) => a.orderIndex - b.orderIndex);
            }
            state.selectedColumn = newColumn;
            state.isLoading = false;
          });
          return newColumn;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return null;
        }
      },

      // 컬럼 업데이트
      updateColumn: async (id: string, request: UpdateColumnRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const updatedColumn = await cachedApiClient.updateColumn(id, request);
          set((state) => {
            // 모든 테이블에서 해당 컬럼 찾아서 업데이트
            state.tables.forEach(table => {
              const columnIndex = table.columns.findIndex(c => c.id === id);
              if (columnIndex !== -1) {
                table.columns[columnIndex] = updatedColumn;
                table.columns.sort((a, b) => a.orderIndex - b.orderIndex);
              }
            });
            
            if (state.selectedTable) {
              const columnIndex = state.selectedTable.columns.findIndex(c => c.id === id);
              if (columnIndex !== -1) {
                state.selectedTable.columns[columnIndex] = updatedColumn;
                state.selectedTable.columns.sort((a, b) => a.orderIndex - b.orderIndex);
              }
            }
            
            if (state.selectedColumn?.id === id) {
              state.selectedColumn = updatedColumn;
            }
            state.isLoading = false;
          });
          return updatedColumn;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return null;
        }
      },

      // 컬럼 삭제
      deleteColumn: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await cachedApiClient.deleteColumn(id);
          set((state) => {
            // 모든 테이블에서 해당 컬럼 제거
            state.tables.forEach(table => {
              table.columns = table.columns.filter(c => c.id !== id);
            });
            
            if (state.selectedTable) {
              state.selectedTable.columns = state.selectedTable.columns.filter(c => c.id !== id);
            }
            
            if (state.selectedColumn?.id === id) {
              state.selectedColumn = null;
            }
            state.isLoading = false;
          });
          return true;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return false;
        }
      },

      // 선택된 컬럼 설정
      setSelectedColumn: (column: Column | null) => {
        set((state) => {
          state.selectedColumn = column;
        });
      },

      // 컬럼 순서 변경
      reorderColumns: async (tableId: string, columnIds: string[]) => {
        try {
          // 배치 업데이트 API 사용 (백엔드에서 지원하는 경우)
          try {
            const updates = columnIds.map((columnId, index) => ({
              columnId,
              orderIndex: index
            }));
            
            const updatedColumns = await cachedApiClient.updateColumnOrder(tableId, updates);
            
            set((state) => {
              const tableIndex = state.tables.findIndex(t => t.id === tableId);
              if (tableIndex !== -1) {
                state.tables[tableIndex].columns = updatedColumns.sort((a, b) => a.orderIndex - b.orderIndex);
              }
              
              if (state.selectedTable?.id === tableId) {
                state.selectedTable.columns = updatedColumns.sort((a, b) => a.orderIndex - b.orderIndex);
              }
            });
          } catch (batchError) {
            // 배치 API가 지원되지 않는 경우 개별 업데이트로 폴백
            console.warn('Batch update API not supported, processing individually.');
            
            const promises = columnIds.map((columnId, index) => 
              cachedApiClient.updateColumn(columnId, { orderIndex: index })
            );
            
            const updatedColumns = await Promise.all(promises);
            
            set((state) => {
              const tableIndex = state.tables.findIndex(t => t.id === tableId);
              if (tableIndex !== -1) {
                state.tables[tableIndex].columns = updatedColumns.sort((a, b) => a.orderIndex - b.orderIndex);
              }
              
              if (state.selectedTable?.id === tableId) {
                state.selectedTable.columns = updatedColumns.sort((a, b) => a.orderIndex - b.orderIndex);
              }
            });
          }
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
          });
          throw error; // 에러를 다시 던져서 컴포넌트에서 처리할 수 있도록 함
        }
      },

      // 인덱스 생성
      createIndex: async (tableId: string, request: CreateIndexRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const newIndex = await cachedApiClient.createIndex(tableId, request);
          set((state) => {
            const tableIndex = state.tables.findIndex(t => t.id === tableId);
            if (tableIndex !== -1) {
              state.tables[tableIndex].indexes.push(newIndex);
            }
            if (state.selectedTable?.id === tableId) {
              state.selectedTable.indexes.push(newIndex);
            }
            state.isLoading = false;
          });
          return newIndex;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return null;
        }
      },

      // 인덱스 업데이트
      updateIndex: async (id: string, request: UpdateIndexRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const updatedIndex = await cachedApiClient.updateIndex(id, request);
          set((state) => {
            // 모든 테이블에서 해당 인덱스 찾아서 업데이트
            state.tables.forEach(table => {
              const indexIndex = table.indexes.findIndex(i => i.id === id);
              if (indexIndex !== -1) {
                table.indexes[indexIndex] = updatedIndex;
              }
            });
            
            if (state.selectedTable) {
              const indexIndex = state.selectedTable.indexes.findIndex(i => i.id === id);
              if (indexIndex !== -1) {
                state.selectedTable.indexes[indexIndex] = updatedIndex;
              }
            }
            state.isLoading = false;
          });
          return updatedIndex;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return null;
        }
      },

      // 인덱스 삭제
      deleteIndex: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await cachedApiClient.deleteIndex(id);
          set((state) => {
            // 모든 테이블에서 해당 인덱스 제거
            state.tables.forEach(table => {
              table.indexes = table.indexes.filter(i => i.id !== id);
            });
            
            if (state.selectedTable) {
              state.selectedTable.indexes = state.selectedTable.indexes.filter(i => i.id !== id);
            }
            state.isLoading = false;
          });
          return true;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isLoading = false;
          });
          return false;
        }
      },

      // 유틸리티 함수들
      getTableById: (id: string) => {
        return get().tables.find(t => t.id === id);
      },

      getColumnById: (id: string) => {
        const { tables } = get();
        for (const table of tables) {
          const column = table.columns.find(c => c.id === id);
          if (column) return column;
        }
        return undefined;
      },

      getIndexById: (id: string) => {
        const { tables } = get();
        for (const table of tables) {
          const index = table.indexes.find(i => i.id === id);
          if (index) return index;
        }
        return undefined;
      },

      // 에러 클리어
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'table-store',
    }
  )
);