import { useEffect, useState, useCallback } from 'react';
import { useValidationStore } from '../stores/validationStore';
import { useProjectStore } from '../stores/projectStore';
import { useDebounce } from './useDebounce';
import type { ValidationError, Table, Column, Index } from '../types';

/**
 * 실시간 검증을 위한 커스텀 훅
 */
export const useRealTimeValidation = () => {
  const { currentProject } = useProjectStore();
  const {
    validateTableName,
    validateColumnName,
    validateIndexName,
    validateTable,
    validateColumn,
    validateIndex,
    setTableValidation,
    setColumnValidation,
    setIndexValidation,
  } = useValidationStore();

  /**
   * 테이블명 실시간 검증
   */
  const useTableNameValidation = (tableName: string, tableId?: string) => {
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const debouncedTableName = useDebounce(tableName, 300);

    useEffect(() => {
      if (!currentProject?.namingRules || !debouncedTableName.trim()) {
        setErrors([]);
        if (tableId) {
          setTableValidation(tableId, []);
        }
        return;
      }

      const validationErrors = validateTableName(debouncedTableName, currentProject.namingRules);
      setErrors(validationErrors);
      
      if (tableId) {
        setTableValidation(tableId, validationErrors);
      }
    }, [debouncedTableName, tableId]);

    return errors;
  };

  /**
   * 컬럼명 실시간 검증
   */
  const useColumnNameValidation = (columnName: string, columnId?: string, tableName?: string, isPrimaryKey?: boolean) => {
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const debouncedColumnName = useDebounce(columnName, 300);

    useEffect(() => {
      if (!currentProject?.namingRules || !debouncedColumnName.trim()) {
        setErrors([]);
        if (columnId) {
          setColumnValidation(columnId, []);
        }
        return;
      }

      const validationErrors = validateColumnName(debouncedColumnName, currentProject.namingRules, tableName, isPrimaryKey);
      setErrors(validationErrors);
      
      if (columnId) {
        setColumnValidation(columnId, validationErrors);
      }
    }, [debouncedColumnName, columnId, tableName, isPrimaryKey]);

    return errors;
  };

  /**
   * 인덱스명 실시간 검증
   */
  const useIndexNameValidation = (indexName: string, indexId?: string) => {
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const debouncedIndexName = useDebounce(indexName, 300);

    useEffect(() => {
      if (!currentProject?.namingRules || !debouncedIndexName.trim()) {
        setErrors([]);
        if (indexId) {
          setIndexValidation(indexId, []);
        }
        return;
      }

      const validationErrors = validateIndexName(debouncedIndexName, currentProject.namingRules);
      setErrors(validationErrors);
      
      if (indexId) {
        setIndexValidation(indexId, validationErrors);
      }
    }, [debouncedIndexName, indexId]);

    return errors;
  };

  /**
   * 테이블 전체 검증
   */
  const validateTableEntity = useCallback((table: Table) => {
    if (!currentProject?.namingRules) return [];
    
    const errors = validateTable(table, currentProject.namingRules);
    setTableValidation(table.id, errors);
    return errors;
  }, [currentProject?.namingRules, validateTable, setTableValidation]);

  /**
   * 컬럼 전체 검증
   */
  const validateColumnEntity = useCallback((column: Column) => {
    if (!currentProject?.namingRules) return [];
    
    const errors = validateColumn(column, currentProject.namingRules);
    setColumnValidation(column.id, errors);
    return errors;
  }, [currentProject?.namingRules, validateColumn, setColumnValidation]);

  /**
   * 인덱스 전체 검증
   */
  const validateIndexEntity = useCallback((index: Index) => {
    if (!currentProject?.namingRules) return [];
    
    const errors = validateIndex(index, currentProject.namingRules);
    setIndexValidation(index.id, errors);
    return errors;
  }, [currentProject?.namingRules, validateIndex, setIndexValidation]);

  /**
   * 네이밍 제안 생성
   */
  const generateNameSuggestion = useCallback((
    currentName: string,
    type: 'table' | 'column' | 'index',
    tableName?: string
  ): string => {
    if (!currentProject?.namingRules) return currentName;

    const rules = currentProject.namingRules;
    let suggestion = currentName;

    // SQL Server 대문자 강제 적용
    if (rules.enforceUpperCase) {
      suggestion = suggestion.toUpperCase();
    } else if (rules.enforceCase) {
      // 기존 케이스 변환
      switch (rules.enforceCase) {
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

    // 테이블 접두사/접미사 적용
    if (type === 'table') {
      if (rules.tablePrefix && !suggestion.startsWith(rules.tablePrefix)) {
        suggestion = rules.tablePrefix + suggestion;
      }
      if (rules.tableSuffix && !suggestion.endsWith(rules.tableSuffix)) {
        suggestion = suggestion + rules.tableSuffix;
      }
    }

    // 기본키 컬럼 명명 규칙 적용
    if (type === 'column' && tableName && rules.enforceTableColumnNaming) {
      if (suggestion.toUpperCase() === 'ID' || 
          suggestion.toUpperCase() === 'SEQ_NO' || 
          suggestion.toUpperCase() === 'HIST_NO') {
        // 단독명칭 → 테이블명+컬럼명 조합으로 제안
        suggestion = tableName + '_' + suggestion;
        if (rules.enforceUpperCase) {
          suggestion = suggestion.toUpperCase();
        }
      }
    }

    return suggestion;
  }, [currentProject?.namingRules]);

  /**
   * 자동 수정 적용
   */
  const applyAutoFix = useCallback((
    originalName: string,
    type: 'table' | 'column' | 'index',
    tableName?: string
  ): string => {
    return generateNameSuggestion(originalName, type, tableName);
  }, [generateNameSuggestion]);

  return {
    useTableNameValidation,
    useColumnNameValidation,
    useIndexNameValidation,
    validateTableEntity,
    validateColumnEntity,
    validateIndexEntity,
    generateNameSuggestion,
    applyAutoFix,
  };
};

// 유틸리티 함수들
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

export default useRealTimeValidation;