import type { Index, Table, Column, IndexColumn } from '../types';

/**
 * 인덱스 이름 생성 유틸리티
 * @param tableId 테이블 ID
 * @param columnIds 컬럼 ID 배열
 * @param columns 전체 컬럼 목록
 * @param isUnique 유니크 인덱스 여부
 * @returns 생성된 인덱스 이름
 */
export const generateIndexName = (
  tableId: string,
  columnIds: string[],
  columns: Column[],
  isUnique: boolean = false
): string => {
  // 테이블 ID에서 짧은 식별자 추출
  const tableShortId = tableId.substring(0, 8);
  
  // 컬럼 이름 추출
  const columnNames = columnIds.map(id => {
    const column = columns.find(c => c.id === id);
    return column ? column.name : 'unknown';
  });
  
  // 컬럼 이름을 최대 2개까지만 사용
  const columnPart = columnNames.slice(0, 2).join('_');
  
  // 유니크 인덱스인 경우 접두사 변경
  const prefix = isUnique ? 'UX' : 'IX';
  
  return `${prefix}_${tableShortId}_${columnPart}`;
};

/**
 * 인덱스 타입 설명 반환
 * @param type 인덱스 타입
 * @returns 인덱스 타입 설명
 */
export const getIndexTypeDescription = (type: string): string => {
  switch (type) {
    case 'CLUSTERED':
      return '클러스터드 인덱스는 테이블의 물리적 순서를 결정하며, 테이블당 하나만 생성할 수 있습니다.';
    case 'NONCLUSTERED':
      return '논클러스터드 인덱스는 별도의 구조로 저장되며, 테이블당 여러 개 생성할 수 있습니다.';
    default:
      return '';
  }
};

/**
 * 인덱스 성능 영향 분석
 * @param index 인덱스 객체
 * @param table 테이블 객체
 * @returns 성능 분석 결과
 */
export const analyzeIndexPerformance = (
  index: Index,
  table: Table
): { score: number; recommendations: string[] } => {
  const recommendations: string[] = [];
  let score = 10; // 기본 점수 10점
  
  // 1. 컬럼 수 체크
  if (index.columns.length > 5) {
    score -= 2;
    recommendations.push('인덱스에 너무 많은 컬럼이 포함되어 있습니다. 5개 이하로 유지하는 것이 좋습니다.');
  }
  
  // 2. 클러스터드 인덱스 체크
  if (index.type === 'CLUSTERED') {
    const otherClusteredIndexes = table.indexes.filter(i => 
      i.id !== index.id && i.type === 'CLUSTERED'
    );
    
    if (otherClusteredIndexes.length > 0) {
      score -= 3;
      recommendations.push('테이블에 이미 클러스터드 인덱스가 존재합니다. 테이블당 하나의 클러스터드 인덱스만 가질 수 있습니다.');
    }
  }
  
  // 3. 선행 컬럼 선택성 체크
  if (index.columns.length > 1) {
    recommendations.push('복합 인덱스의 경우 선택성이 높은 컬럼을 앞쪽에 배치하는 것이 좋습니다.');
  }
  
  // 4. 유니크 인덱스 체크
  if (index.isUnique) {
    recommendations.push('유니크 인덱스는 중복 값을 방지하지만, 데이터 입력/수정 시 추가 검증이 필요합니다.');
  }
  
  return {
    score,
    recommendations
  };
};

/**
 * 인덱스 SQL 스크립트 생성
 * @param index 인덱스 객체
 * @param table 테이블 객체
 * @returns SQL 스크립트
 */
export const generateIndexSQL = (index: Index, table: Table): string => {
  const columnNames = index.columns.map(col => {
    const column = table.columns.find(c => c.id === col.columnId);
    return column ? `[${column.name}] ${col.order}` : '';
  }).filter(Boolean);
  
  if (columnNames.length === 0) return '';
  
  const uniqueStr = index.isUnique ? 'UNIQUE ' : '';
  const typeStr = index.type;
  
  return `CREATE ${uniqueStr}${typeStr} INDEX [${index.name}]
ON [${table.name}] (${columnNames.join(', ')});`;
};