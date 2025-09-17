import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  ValidationResult, 
  ValidationError, 
  NamingRules,
  Table,
  Column,
  Index
} from '../types';
import { apiClient, handleApiError } from '../services/api';

interface ValidationState {
  // 상태
  validationResult: ValidationResult | null;
  isValidating: boolean;
  error: string | null;
  
  // 실시간 검증 결과
  tableValidations: Record<string, ValidationError[]>;
  columnValidations: Record<string, ValidationError[]>;
  indexValidations: Record<string, ValidationError[]>;

  // 액션
  validateProject: (projectId: string) => Promise<ValidationResult | null>;
  validateTableName: (name: string, namingRules: NamingRules) => ValidationError[];
  validateColumnName: (name: string, namingRules: NamingRules, tableName?: string, isPrimaryKey?: boolean) => ValidationError[];
  validateIndexName: (name: string, namingRules: NamingRules) => ValidationError[];
  validateTable: (table: Table, namingRules: NamingRules) => ValidationError[];
  validateColumn: (column: Column, namingRules: NamingRules) => ValidationError[];
  validateIndex: (index: Index, namingRules: NamingRules) => ValidationError[];
  
  // 실시간 검증 결과 관리
  setTableValidation: (tableId: string, errors: ValidationError[]) => void;
  setColumnValidation: (columnId: string, errors: ValidationError[]) => void;
  setIndexValidation: (indexId: string, errors: ValidationError[]) => void;
  clearValidations: () => void;
  clearError: () => void;
}

export const useValidationStore = create<ValidationState>()(
  devtools(
    immer((set, get) => ({
      // 초기 상태
      validationResult: null,
      isValidating: false,
      error: null,
      tableValidations: {},
      columnValidations: {},
      indexValidations: {},

      // 프로젝트 전체 검증
      validateProject: async (projectId: string) => {
        set((state) => {
          state.isValidating = true;
          state.error = null;
        });

        try {
          const result = await apiClient.validateProject(projectId);
          set((state) => {
            state.validationResult = result;
            state.isValidating = false;
          });
          return result;
        } catch (error) {
          const apiError = handleApiError(error);
          set((state) => {
            state.error = apiError.error;
            state.isValidating = false;
          });
          return null;
        }
      },

      // 테이블명 검증
      validateTableName: (name: string, namingRules: NamingRules) => {
        const errors: ValidationError[] = [];

        if (!name.trim()) {
          errors.push({
            field: 'name',
            rule: 'required',
            message: '테이블명은 필수입니다.',
          });
          return errors;
        }

        // SQL Server 대문자 강제 검증
        if (namingRules.enforceUpperCase && name !== name.toUpperCase()) {
          errors.push({
            field: 'name',
            rule: 'sql_server_case',
            message: '테이블명은 대문자로 작성해야 합니다.',
            suggestion: name.toUpperCase(),
          });
        }

        // 패턴 검증
        if (namingRules.tablePattern) {
          const regex = new RegExp(namingRules.tablePattern);
          if (!regex.test(name)) {
            errors.push({
              field: 'name',
              rule: 'pattern',
              message: `테이블명이 패턴 '${namingRules.tablePattern}'에 맞지 않습니다.`,
              suggestion: generateTableNameSuggestion(name, namingRules),
            });
          }
        }

        // 접두사/접미사 검증
        if (namingRules.tablePrefix && !name.startsWith(namingRules.tablePrefix)) {
          errors.push({
            field: 'name',
            rule: 'prefix',
            message: `테이블명은 '${namingRules.tablePrefix}' 접두사로 시작해야 합니다.`,
            suggestion: `${namingRules.tablePrefix}${name}`,
          });
        }

        if (namingRules.tableSuffix && !name.endsWith(namingRules.tableSuffix)) {
          errors.push({
            field: 'name',
            rule: 'suffix',
            message: `테이블명은 '${namingRules.tableSuffix}' 접미사로 끝나야 합니다.`,
            suggestion: `${name}${namingRules.tableSuffix}`,
          });
        }

        // 케이스 검증 (SQL Server 대문자 강제가 아닌 경우에만)
        if (!namingRules.enforceUpperCase && namingRules.enforceCase) {
          const caseError = validateCase(name, namingRules.enforceCase, 'table');
          if (caseError) {
            errors.push(caseError);
          }
        }

        return errors;
      },

      // 컬럼명 검증
      validateColumnName: (name: string, namingRules: NamingRules, tableName?: string, isPrimaryKey?: boolean) => {
        const errors: ValidationError[] = [];

        if (!name.trim()) {
          errors.push({
            field: 'name',
            rule: 'required',
            message: '컬럼명은 필수입니다.',
          });
          return errors;
        }

        // SQL Server 대문자 강제 검증
        if (namingRules.enforceUpperCase && name !== name.toUpperCase()) {
          errors.push({
            field: 'name',
            rule: 'sql_server_case',
            message: '컬럼명은 대문자로 작성해야 합니다.',
            suggestion: name.toUpperCase(),
          });
        }

        // SQL Server 기본키 명명 규칙 검증
        if (isPrimaryKey && tableName && namingRules.enforceTableColumnNaming) {
          if (name.toUpperCase() === 'ID' || 
              name.toUpperCase() === 'SEQ_NO' || 
              name.toUpperCase() === 'HIST_NO') {
            errors.push({
              field: 'name',
              rule: 'sql_server_pk_naming',
              message: `기본키에 단독명칭 사용 지양: ${name}`,
              suggestion: `${tableName}_${name}`.toUpperCase(),
            });
          }
        }

        // 패턴 검증
        if (namingRules.columnPattern) {
          const regex = new RegExp(namingRules.columnPattern);
          if (!regex.test(name)) {
            errors.push({
              field: 'name',
              rule: 'pattern',
              message: `컬럼명이 패턴 '${namingRules.columnPattern}'에 맞지 않습니다.`,
              suggestion: generateColumnNameSuggestion(name, namingRules, tableName),
            });
          }
        }

        // 케이스 검증 (SQL Server 대문자 강제가 아닌 경우에만)
        if (!namingRules.enforceUpperCase && namingRules.enforceCase) {
          const caseError = validateCase(name, namingRules.enforceCase, 'column');
          if (caseError) {
            errors.push(caseError);
          }
        }

        return errors;
      },

      // 인덱스명 검증
      validateIndexName: (name: string, namingRules: NamingRules) => {
        const errors: ValidationError[] = [];

        if (!name.trim()) {
          errors.push({
            field: 'name',
            rule: 'required',
            message: '인덱스명은 필수입니다.',
          });
          return errors;
        }

        // 패턴 검증
        if (namingRules.indexPattern) {
          const regex = new RegExp(namingRules.indexPattern);
          if (!regex.test(name)) {
            errors.push({
              field: 'name',
              rule: 'pattern',
              message: `인덱스명이 패턴 '${namingRules.indexPattern}'에 맞지 않습니다.`,
              suggestion: generateIndexNameSuggestion(name, namingRules),
            });
          }
        }

        // 케이스 검증
        if (namingRules.enforceCase) {
          const caseError = validateCase(name, namingRules.enforceCase, 'index');
          if (caseError) {
            errors.push(caseError);
          }
        }

        return errors;
      },

      // 테이블 전체 검증
      validateTable: (table: Table, namingRules: NamingRules) => {
        const errors: ValidationError[] = [];
        
        // 테이블명 검증
        const nameErrors = get().validateTableName(table.name, namingRules);
        errors.push(...nameErrors);

        // 컬럼이 없는 경우
        if (table.columns.length === 0) {
          errors.push({
            field: 'columns',
            rule: 'required',
            message: '테이블에는 최소 하나의 컬럼이 있어야 합니다.',
          });
        }

        // 기본키 검증
        const primaryKeyColumns = table.columns.filter(c => c.primaryKey);
        if (primaryKeyColumns.length === 0) {
          errors.push({
            field: 'primaryKey',
            rule: 'required',
            message: '테이블에는 기본키가 있어야 합니다.',
          });
        }

        return errors;
      },

      // 컬럼 전체 검증
      validateColumn: (column: Column, namingRules: NamingRules) => {
        const errors: ValidationError[] = [];
        
        // 컬럼명 검증
        const nameErrors = get().validateColumnName(column.name, namingRules);
        errors.push(...nameErrors);

        // 데이터 타입별 검증
        if (column.dataType === 'VARCHAR' || column.dataType === 'NVARCHAR' || column.dataType === 'CHAR' || column.dataType === 'NCHAR') {
          if (!column.maxLength || column.maxLength <= 0) {
            errors.push({
              field: 'maxLength',
              rule: 'required',
              message: `${column.dataType} 타입은 길이를 지정해야 합니다.`,
            });
          }
        }

        if (column.dataType === 'DECIMAL' || column.dataType === 'NUMERIC') {
          if (!column.precision || column.precision <= 0) {
            errors.push({
              field: 'precision',
              rule: 'required',
              message: `${column.dataType} 타입은 정밀도를 지정해야 합니다.`,
            });
          }
        }

        return errors;
      },

      // 인덱스 전체 검증
      validateIndex: (index: Index, namingRules: NamingRules) => {
        const errors: ValidationError[] = [];
        
        // 인덱스명 검증
        const nameErrors = get().validateIndexName(index.name, namingRules);
        errors.push(...nameErrors);

        // 컬럼이 없는 경우
        if (index.columns.length === 0) {
          errors.push({
            field: 'columns',
            rule: 'required',
            message: '인덱스에는 최소 하나의 컬럼이 있어야 합니다.',
          });
        }

        return errors;
      },

      // 실시간 검증 결과 설정
      setTableValidation: (tableId: string, errors: ValidationError[]) => {
        set((state) => {
          if (errors.length === 0) {
            delete state.tableValidations[tableId];
          } else {
            state.tableValidations[tableId] = errors;
          }
        });
      },

      setColumnValidation: (columnId: string, errors: ValidationError[]) => {
        set((state) => {
          if (errors.length === 0) {
            delete state.columnValidations[columnId];
          } else {
            state.columnValidations[columnId] = errors;
          }
        });
      },

      setIndexValidation: (indexId: string, errors: ValidationError[]) => {
        set((state) => {
          if (errors.length === 0) {
            delete state.indexValidations[indexId];
          } else {
            state.indexValidations[indexId] = errors;
          }
        });
      },

      // 검증 결과 초기화
      clearValidations: () => {
        set((state) => {
          state.validationResult = null;
          state.tableValidations = {};
          state.columnValidations = {};
          state.indexValidations = {};
        });
      },

      // 에러 클리어
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'validation-store',
    }
  )
);

// 유틸리티 함수들
function validateCase(name: string, caseType: string, entityType: string): ValidationError | null {
  let isValid = false;
  let suggestion = '';

  switch (caseType) {
    case 'UPPER':
      isValid = name === name.toUpperCase();
      suggestion = name.toUpperCase();
      break;
    case 'LOWER':
      isValid = name === name.toLowerCase();
      suggestion = name.toLowerCase();
      break;
    case 'PASCAL':
      isValid = /^[A-Z][a-zA-Z0-9]*$/.test(name);
      suggestion = toPascalCase(name);
      break;
    case 'SNAKE':
      isValid = /^[a-z][a-z0-9_]*$/.test(name);
      suggestion = toSnakeCase(name);
      break;
  }

  if (!isValid) {
    return {
      field: 'name',
      rule: 'case',
      message: `${entityType} 이름은 ${caseType} 케이스를 따라야 합니다.`,
      suggestion,
    };
  }

  return null;
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/_/g, '');
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function generateTableNameSuggestion(name: string, namingRules: NamingRules): string {
  let suggestion = name;
  
  if (namingRules.tablePrefix && !suggestion.startsWith(namingRules.tablePrefix)) {
    suggestion = namingRules.tablePrefix + suggestion;
  }
  
  if (namingRules.tableSuffix && !suggestion.endsWith(namingRules.tableSuffix)) {
    suggestion = suggestion + namingRules.tableSuffix;
  }
  
  // SQL Server 대문자 강제 적용
  if (namingRules.enforceUpperCase) {
    suggestion = suggestion.toUpperCase();
  } else if (namingRules.enforceCase) {
    switch (namingRules.enforceCase) {
      case 'UPPER':
        suggestion = suggestion.toUpperCase();
        break;
      case 'LOWER':
        suggestion = suggestion.toLowerCase();
        break;
      case 'PASCAL':
        suggestion = toPascalCase(suggestion);
        break;
      case 'SNAKE':
        suggestion = toSnakeCase(suggestion);
        break;
    }
  }
  
  return suggestion;
}

function generateColumnNameSuggestion(name: string, namingRules: NamingRules, tableName?: string): string {
  let suggestion = name;
  
  // SQL Server 대문자 강제 적용
  if (namingRules.enforceUpperCase) {
    suggestion = suggestion.toUpperCase();
  } else if (namingRules.enforceCase) {
    switch (namingRules.enforceCase) {
      case 'UPPER':
        suggestion = suggestion.toUpperCase();
        break;
      case 'LOWER':
        suggestion = suggestion.toLowerCase();
        break;
      case 'PASCAL':
        suggestion = toPascalCase(suggestion);
        break;
      case 'SNAKE':
        suggestion = toSnakeCase(suggestion);
        break;
    }
  }
  
  // 기본키 명명 규칙 적용
  if (tableName && namingRules.enforceTableColumnNaming) {
    if (suggestion.toUpperCase() === 'ID' || 
        suggestion.toUpperCase() === 'SEQ_NO' || 
        suggestion.toUpperCase() === 'HIST_NO') {
      suggestion = tableName + '_' + suggestion;
      if (namingRules.enforceUpperCase) {
        suggestion = suggestion.toUpperCase();
      }
    }
  }
  
  return suggestion;
}

function generateIndexNameSuggestion(name: string, namingRules: NamingRules): string {
  let suggestion = name;
  
  if (namingRules.enforceCase) {
    switch (namingRules.enforceCase) {
      case 'UPPER':
        suggestion = suggestion.toUpperCase();
        break;
      case 'LOWER':
        suggestion = suggestion.toLowerCase();
        break;
      case 'PASCAL':
        suggestion = toPascalCase(suggestion);
        break;
      case 'SNAKE':
        suggestion = toSnakeCase(suggestion);
        break;
    }
  }
  
  return suggestion;
}