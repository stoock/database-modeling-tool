import React, { useState, useEffect } from 'react';
import { 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useChangeTracker } from '../../utils/changeTracker';
import type { ChangeTrackerState } from '../../utils/changeTracker';

interface ChangeIndicatorProps {
  onSave?: () => Promise<void>;
  autoSaveInterval?: number; // 자동 저장 간격 (밀리초)
}

const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({
  onSave,
  autoSaveInterval = 0 // 기본값은 자동 저장 비활성화
}) => {
  const changeTracker = useChangeTracker();
  const [state, setState] = useState<ChangeTrackerState>(changeTracker.getState());
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(autoSaveInterval > 0);
  const [lastAutoSaveAttempt, setLastAutoSaveAttempt] = useState<Date | null>(null);
  
  // 변경사항 추적 구독
  useEffect(() => {
    return changeTracker.subscribe(newState => {
      setState(newState);
    });
  }, [changeTracker]);
  
  // 자동 저장 타이머
  useEffect(() => {
    if (!autoSaveEnabled || autoSaveInterval <= 0 || !onSave) return;
    
    const timer = setInterval(async () => {
      if (state.hasUnsavedChanges && !isSaving) {
        setIsSaving(true);
        setLastAutoSaveAttempt(new Date());
        
        try {
          await onSave();
          changeTracker.markAsSaved();
        } catch (error) {
          console.error('자동 저장 중 오류 발생:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, autoSaveInterval);
    
    return () => clearInterval(timer);
  }, [autoSaveEnabled, autoSaveInterval, onSave, state.hasUnsavedChanges, isSaving, changeTracker]);
  
  // 수동 저장 처리
  const handleSave = async () => {
    if (!onSave || isSaving) return;
    
    setIsSaving(true);
    
    try {
      await onSave();
      changeTracker.markAsSaved();
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // 자동 저장 토글
  const toggleAutoSave = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
  };
  
  // 마지막 저장 시간 포맷팅
  const formatLastSavedTime = (date: Date | null) => {
    if (!date) return '저장되지 않음';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 60) {
      return `${diffSec}초 전`;
    } else if (diffMin < 60) {
      return `${diffMin}분 전`;
    } else if (diffHour < 24) {
      return `${diffHour}시간 전`;
    } else {
      return date.toLocaleTimeString();
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      {/* 변경사항 상태 표시 */}
      {isSaving ? (
        <div className="flex items-center text-blue-600">
          <ArrowPathIcon className="h-5 w-5 mr-1 animate-spin" />
          <span className="text-sm">저장 중...</span>
        </div>
      ) : state.hasUnsavedChanges ? (
        <div className="flex items-center text-amber-600">
          <ExclamationCircleIcon className="h-5 w-5 mr-1" />
          <span className="text-sm">저장되지 않은 변경사항</span>
        </div>
      ) : (
        <div className="flex items-center text-green-600">
          <CheckCircleIcon className="h-5 w-5 mr-1" />
          <span className="text-sm">모든 변경사항 저장됨</span>
        </div>
      )}
      
      {/* 마지막 저장 시간 */}
      {state.lastSavedAt && (
        <div className="flex items-center text-gray-500 text-xs">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span>마지막 저장: {formatLastSavedTime(state.lastSavedAt)}</span>
        </div>
      )}
      
      {/* 저장 버튼 */}
      {onSave && (
        <button
          onClick={handleSave}
          disabled={isSaving || !state.hasUnsavedChanges}
          className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          저장
        </button>
      )}
      
      {/* 자동 저장 토글 */}
      {autoSaveInterval > 0 && (
        <div className="flex items-center ml-4">
          <input
            id="autoSave"
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={toggleAutoSave}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoSave" className="ml-2 text-sm text-gray-700">
            자동 저장
          </label>
        </div>
      )}
    </div>
  );
};

export default ChangeIndicator;