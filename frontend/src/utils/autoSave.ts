import { useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTableStore } from '../stores/tableStore';
import ChangeTracker from './changeTracker';

/**
 * 자동 저장 상태
 */
export interface AutoSaveState {
  isEnabled: boolean;
  interval: number;
  lastSavedAt: Date | null;
  isSaving: boolean;
  error: string | null;
}

/**
 * 자동 저장 설정
 */
export interface AutoSaveConfig {
  enabled?: boolean;
  interval?: number;
  onBeforeSave?: () => Promise<boolean> | boolean;
  onAfterSave?: () => void;
}

/**
 * 로컬 스토리지 키
 */
const LOCAL_STORAGE_KEYS = {
  AUTO_SAVE_ENABLED: 'dbmodeling_auto_save_enabled',
  AUTO_SAVE_INTERVAL: 'dbmodeling_auto_save_interval',
  PENDING_CHANGES: 'dbmodeling_pending_changes',
};

/**
 * 자동 저장 훅
 */
export function useAutoSave(config: AutoSaveConfig = {}) {
  const { currentProject } = useProjectStore();
  // const updateProject = useProjectStore().updateProject; // 현재 미사용
  const { tables, updateTable } = useTableStore();
  
  // 로컬 스토리지에서 설정 불러오기
  const getStoredConfig = () => {
    try {
      const storedEnabled = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_SAVE_ENABLED);
      const storedInterval = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_SAVE_INTERVAL);
      
      return {
        enabled: storedEnabled !== null ? storedEnabled === 'true' : config.enabled ?? true,
        interval: storedInterval !== null ? parseInt(storedInterval, 10) : config.interval ?? 30000,
      };
    } catch (err) {
      console.error('자동 저장 설정을 불러오는 중 오류 발생:', err);
      return {
        enabled: config.enabled ?? true,
        interval: config.interval ?? 30000,
      };
    }
  };
  
  const storedConfig = getStoredConfig();
  
  const [state, setState] = useState<AutoSaveState>({
    isEnabled: storedConfig.enabled,
    interval: storedConfig.interval,
    lastSavedAt: null,
    isSaving: false,
    error: null,
  });
  
  // 자동 저장 활성화/비활성화
  const setEnabled = (enabled: boolean) => {
    setState(prev => ({ ...prev, isEnabled: enabled }));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_SAVE_ENABLED, String(enabled));
    } catch (err) {
      console.error('자동 저장 설정을 저장하는 중 오류 발생:', err);
    }
  };
  
  // 자동 저장 간격 설정
  const setInterval = (interval: number) => {
    setState(prev => ({ ...prev, interval }));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_SAVE_INTERVAL, String(interval));
    } catch (err) {
      console.error('자동 저장 간격을 저장하는 중 오류 발생:', err);
    }
  };
  
  // 변경사항 저장
  const saveChanges = useCallback(async () => {
    if (!currentProject) return false;
    
    // 중복 실행 방지를 위한 상태 확인
    if (state.isSaving) return false;
    
    const changeTracker = ChangeTracker.getInstance();
    const trackerState = changeTracker.getState();
    if (!trackerState.hasUnsavedChanges) return false;
    
    // 저장 전 콜백 실행
    if (config.onBeforeSave) {
      const shouldContinue = await config.onBeforeSave();
      if (!shouldContinue) return false;
    }
    
    setState(prev => ({ ...prev, isSaving: true, error: null }));
    
    try {
      // 테이블 변경사항 저장
      for (const tableId of trackerState.pendingChanges.tables) {
        const table = tables.find(t => t.id === tableId);
        if (table) {
          await updateTable(tableId, {
            name: table.name,
            description: table.description,
            positionX: table.positionX,
            positionY: table.positionY
          });
        }
      }
      
      // 모든 변경사항 저장 완료 표시
      changeTracker.markAsSaved();
      
      setState(prev => ({ 
        ...prev, 
        isSaving: false, 
        lastSavedAt: new Date() 
      }));
      
      // 저장 후 콜백 실행
      if (config.onAfterSave) {
        config.onAfterSave();
      }
      
      return true;
    } catch (err: any) {
      console.error('자동 저장 중 오류 발생:', err);
      setState(prev => ({ 
        ...prev, 
        isSaving: false, 
        error: err.message || '저장 중 오류가 발생했습니다.' 
      }));
      return false;
    }
  }, [currentProject, state.isSaving, tables, updateTable, config.onBeforeSave, config.onAfterSave]);
  
  // 자동 저장 타이머
  useEffect(() => {
    if (!state.isEnabled || state.interval <= 0) return;
    
    const timer = window.setInterval(() => {
      const changeTracker = ChangeTracker.getInstance();
      const trackerState = changeTracker.getState();
      // state.isSaving을 직접 참조하지 않고 현재 상태를 확인
      if (trackerState.hasUnsavedChanges) {
        saveChanges();
      }
    }, state.interval);
    
    return () => {
      window.clearInterval(timer);
    };
  }, [state.isEnabled, state.interval, saveChanges]);
  
  // 브라우저 새로고침 시 변경사항 저장
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const changeTracker = ChangeTracker.getInstance();
      const trackerState = changeTracker.getState();
      
      if (trackerState.hasUnsavedChanges) {
        // 변경사항을 로컬 스토리지에 임시 저장
        try {
          localStorage.setItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES, JSON.stringify({
            projectId: currentProject?.id,
            tables: trackerState.pendingChanges.tables,
            columns: trackerState.pendingChanges.columns,
            indexes: trackerState.pendingChanges.indexes,
            timestamp: new Date().toISOString()
          }));
        } catch (err) {
          console.error('변경사항을 임시 저장하는 중 오류 발생:', err);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentProject?.id]); // changeTracker는 싱글톤이므로 의존성에서 제거
  
  // 브라우저 새로고침 후 변경사항 복구
  useEffect(() => {
    if (!currentProject) return;
    
    try {
      const pendingChangesStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES);
      if (!pendingChangesStr) return;
      
      const pendingChanges = JSON.parse(pendingChangesStr);
      
      // 현재 프로젝트와 일치하는지 확인
      if (pendingChanges.projectId !== currentProject.id) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES);
        return;
      }
      
      // 저장된 지 10분 이상 지났으면 무시
      const timestamp = new Date(pendingChanges.timestamp);
      const now = new Date();
      if (now.getTime() - timestamp.getTime() > 10 * 60 * 1000) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES);
        return;
      }
      
      // 변경사항 복구 (테이블 위치 등)
      if (pendingChanges.tables && pendingChanges.tables.length > 0) {
        const changeTracker = ChangeTracker.getInstance();
        pendingChanges.tables.forEach((tableId: string) => {
          changeTracker.trackChange('table', tableId);
        });
      }
      
      // 임시 저장 데이터 삭제
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES);
      
    } catch (err) {
      console.error('변경사항을 복구하는 중 오류 발생:', err);
    }
  }, [currentProject]); // changeTracker는 싱글톤이므로 의존성에서 제거
  
  return {
    state,
    setEnabled,
    setInterval,
    saveChanges,
  };
}

export default useAutoSave;