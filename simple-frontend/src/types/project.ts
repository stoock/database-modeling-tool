/**
 * 프로젝트 관련 타입 정의
 */

export interface Project {
  id: string;
  name: string;
  description?: string;
  namingRules?: NamingRules;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  tableCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NamingRules {
  tablePrefix?: string;
  tableSuffix?: string;
  tablePattern?: string;
  columnPattern?: string;
  indexPattern?: string;
  enforceCase?: CaseType;
}

export type CaseType = 'UPPER' | 'LOWER' | 'PASCAL' | 'SNAKE';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  namingRules?: NamingRules;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  namingRules?: NamingRules;
}
