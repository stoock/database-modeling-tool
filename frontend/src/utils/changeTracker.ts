import { useEffect, useMemo } from 'react';
import { useTableStore } from '../stores/tableStore';

/**
 * 변경사항 추적 상태
 */
export interface ChangeTrackerState {
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  pendingChanges: {
    tables: string[];
    columns: string[];
    indexes: string[];
  };
}

/**
 * 변경사항 추적 클래스
 */
export class ChangeTracker {
  private static instance: ChangeTracker;
  private state: ChangeTrackerState;
  private listeners: ((state: ChangeTrackerState) => void)[] = [];
  
  private constructor() {
    this.state = {
      hasUnsavedChanges: false,
      lastSavedAt: null,
      pendingChanges: {
        tables: [],
        columns: [],
        indexes: []
      }
    };
  }
  
  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(): ChangeTracker {
    if (!ChangeTracker.instance) {
      ChangeTracker.instance = new ChangeTracker();
    }
    return ChangeTracker.instance;
  }
  
  /**
   * 현재 상태 가져오기
   */
  public getState(): ChangeTrackerState {
    return { ...this.state };
  }
  
  /**
   * 변경사항 추가
   */
  public trackChange(type: 'table' | 'column' | 'index', id: string): void {
    const pendingChanges = { ...this.state.pendingChanges };
    
    switch (type) {
      case 'table':
        if (!pendingChanges.tables.includes(id)) {
          pendingChanges.tables.push(id);
        }
        break;
      case 'column':
        if (!pendingChanges.columns.includes(id)) {
          pendingChanges.columns.push(id);
        }
        break;
      case 'index':
        if (!pendingChanges.indexes.includes(id)) {
          pendingChanges.indexes.push(id);
        }
        break;
    }
    
    this.setState({
      hasUnsavedChanges: true,
      pendingChanges
    });
  }
  
  /**
   * 저장 완료 처리
   */
  public markAsSaved(): void {
    this.setState({
      hasUnsavedChanges: false,
      lastSavedAt: new Date(),
      pendingChanges: {
        tables: [],
        columns: [],
        indexes: []
      }
    });
  }
  
  /**
   * 특정 항목 저장 완료 처리
   */
  public markItemAsSaved(type: 'table' | 'column' | 'index', id: string): void {
    const pendingChanges = { ...this.state.pendingChanges };
    
    switch (type) {
      case 'table':
        pendingChanges.tables = pendingChanges.tables.filter(tableId => tableId !== id);
        break;
      case 'column':
        pendingChanges.columns = pendingChanges.columns.filter(columnId => columnId !== id);
        break;
      case 'index':
        pendingChanges.indexes = pendingChanges.indexes.filter(indexId => indexId !== id);
        break;
    }
    
    const hasUnsavedChanges = (
      pendingChanges.tables.length > 0 ||
      pendingChanges.columns.length > 0 ||
      pendingChanges.indexes.length > 0
    );
    
    this.setState({
      hasUnsavedChanges,
      pendingChanges
    });
    
    if (!hasUnsavedChanges) {
      this.setState({
        lastSavedAt: new Date()
      });
    }
  }
  
  /**
   * 상태 변경 리스너 등록
   */
  public subscribe(listener: (state: ChangeTrackerState) => void): () => void {
    this.listeners.push(listener);
    
    // 현재 상태로 즉시 호출
    listener(this.state);
    
    // 구독 해제 함수 반환
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * 상태 변경
   */
  private setState(partialState: Partial<ChangeTrackerState>): void {
    this.state = {
      ...this.state,
      ...partialState
    };
    
    // 모든 리스너에게 알림
    this.listeners.forEach(listener => listener(this.state));
  }
  
  /**
   * 페이지 이탈 시 경고 설정
   */
  public setupBeforeUnloadWarning(): () => void {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (this.state.hasUnsavedChanges) {
        const message = '저장되지 않은 변경사항이 있습니다. 정말로 나가시겠습니까?';
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 정리 함수 반환
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }
}

/**
 * 변경사항 추적 훅
 */
export function useChangeTracker() {
  const tracker = useMemo(() => ChangeTracker.getInstance(), []); // 메모화
  const { updateTable } = useTableStore();
  
  // 페이지 이탈 시 경고 설정
  useEffect(() => {
    return tracker.setupBeforeUnloadWarning();
  }, [tracker]); // tracker 의존성 추가
  
  // 메모화된 반환 객체
  return useMemo(() => ({
    getState: tracker.getState.bind(tracker),
    trackChange: tracker.trackChange.bind(tracker),
    markAsSaved: tracker.markAsSaved.bind(tracker),
    markItemAsSaved: tracker.markItemAsSaved.bind(tracker),
    subscribe: tracker.subscribe.bind(tracker),
    
    // 테이블 위치 변경 추적
    trackTablePositionChange: async (tableId: string, x: number, y: number) => {
      tracker.trackChange('table', tableId);
      await updateTable(tableId, { positionX: x, positionY: y });
      tracker.markItemAsSaved('table', tableId);
    }
  }), [tracker, updateTable]); // updateProject 제거 (사용되지 않음)
}

export default ChangeTracker;