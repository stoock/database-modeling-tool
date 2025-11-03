/**
 * 테이블 관련 타입 정의
 */

import { Column } from './column';
import { Index } from './index';

export interface Table {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  columns: Column[];
  indexes: Index[];
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TableSummary {
  id: string;
  name: string;
  description?: string;
  columnCount: number;
  indexCount: number;
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableRequest {
  name: string;
  description?: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdateTableRequest {
  name?: string;
  description?: string;
  positionX?: number;
  positionY?: number;
}
