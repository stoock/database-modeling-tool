import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SaveFeedbackProps {
  status: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
  duration?: number; // 성공/오류 메시지 표시 시간 (밀리초)
  onDismiss?: () => void;
}

const SaveFeedback: React.FC<SaveFeedbackProps> = ({
  status,
  message,
  duration = 3000,
  onDismiss
}) => {
  const [visible, setVisible] = useState(status !== 'idle');
  
  // 상태가 변경되면 표시
  useEffect(() => {
    if (status !== 'idle') {
      setVisible(true);
    }
    
    // 성공 또는 오류 상태일 때 일정 시간 후 숨김
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [status, duration, onDismiss]);
  
  // 상태별 스타일 및 아이콘
  const getStatusStyle = () => {
    switch (status) {
      case 'saving':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          icon: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: null
        };
    }
  };
  
  const { bgColor, textColor, borderColor, icon } = getStatusStyle();
  
  // 상태별 기본 메시지
  const getDefaultMessage = () => {
    switch (status) {
      case 'saving':
        return '저장 중...';
      case 'success':
        return '저장 완료';
      case 'error':
        return '저장 실패';
      default:
        return '';
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center ${bgColor} ${textColor} px-4 py-3 rounded-md border ${borderColor} shadow-lg transition-all duration-300 transform`}>
      {icon && <div className="mr-3">{icon}</div>}
      <div>
        <p className="font-medium">
          {message || getDefaultMessage()}
        </p>
      </div>
    </div>
  );
};

export default SaveFeedback;