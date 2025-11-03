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

export interface IndexColumn {
  columnId: string;
  columnName: string;
  order: 'ASC' | 'DESC';
}

export interface CreateIndexRequest {
  name: string;
  type: IndexType;
  unique: boolean;
  columns: IndexColumn[];
}
