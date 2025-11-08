import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useToastStore } from '@/stores/toastStore';

interface HealthStatus {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  database?: 'UP' | 'DOWN';
  message?: string;
  hint?: string;
}

/**
 * 서버 헬스 체크 훅
 * 주기적으로 백엔드 서버 상태를 확인하고 문제 발생 시 알림을 표시합니다.
 */
export function useServerHealth(options?: {
  enabled?: boolean;
  interval?: number; // 밀리초 단위
  showToast?: boolean;
}) {
  const {
    enabled = true,
    interval = 60000, // 기본 1분
    showToast = true,
  } = options || {};

  const [isHealthy, setIsHealthy] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const { error: showError, warning: showWarning, success: showSuccess } = useToastStore();

  useEffect(() => {
    if (!enabled) return;

    let toastId: string | null = null;

    const checkHealth = async () => {
      try {
        const response = await apiClient.get<HealthStatus>('/health', {
          // 헬스 체크는 에러 인터셉터를 우회
          validateStatus: () => true,
        });

        setLastCheck(new Date());
        setHealthStatus(response.data);

        // 이전에 문제가 있었고 지금 정상이면 복구 알림
        if (!isHealthy && response.data.status === 'UP') {
          setIsHealthy(true);
          if (showToast) {
            showSuccess('서버 연결 복구', '백엔드 서버가 정상적으로 작동합니다');
          }
        }

        // 데이터베이스 문제 감지
        if (response.data.status === 'DEGRADED' && response.data.database === 'DOWN') {
          setIsHealthy(false);
          if (showToast && !toastId) {
            toastId = showWarning(
              '데이터베이스 연결 실패',
              response.data.message || 'PostgreSQL 연결을 확인해주세요'
            );
          }
        }

        // 서버 다운
        if (response.data.status === 'DOWN') {
          setIsHealthy(false);
          if (showToast && !toastId) {
            toastId = showError('서버 오류', '백엔드 서버에 문제가 발생했습니다');
          }
        }
      } catch (err) {
        // 서버에 연결할 수 없음
        setIsHealthy(false);
        setLastCheck(new Date());
        
        if (showToast && !toastId) {
          toastId = showError(
            '서버 연결 실패',
            '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          );
        }
      }
    };

    // 초기 체크
    checkHealth();

    // 주기적 체크
    const intervalId = setInterval(checkHealth, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, interval, showToast, isHealthy, showError, showWarning, showSuccess]);

  return {
    isHealthy,
    lastCheck,
    healthStatus,
  };
}
