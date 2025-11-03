/**
 * 인덱스 관련 타입 정의
 */

export interface Index {
  id: string;
  tableId: string;
  name: string;
  type: IndexType;
  unique: boolean;
  columns: IndexColumn[];
  createdAt: string;
  updatedAt: string;
}

export type IndexType = 'CLUSTERED' | 'NONCLUSTERED';

export type SortOrder = 'ASC' | 'DESC';

export interface IndexColumn {
  columnId: string;
  columnName: string;
  order: SortOrder;
}

export interface CreateIndexRequest {
  name: string;
  type: IndexType;
  isUnique: boolean;
  columns: {
    columnId: string;
    order: SortOrder;
  }[];
}

export interface UpdateIndexRequest {
  name?: string;
  type?: IndexType;
  isUnique?: boolean;
  columns?: {
    columnId: string;
    order: SortOrder;
  }[];
}
