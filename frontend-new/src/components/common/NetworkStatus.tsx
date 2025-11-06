import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';

/**
 * 네트워크 상태 모니터링 컴포넌트
 * 온라인/오프라인 상태를 감지하고 사용자에게 알립니다.
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const { warning, success } = useToastStore();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        success('네트워크 연결됨', '인터넷 연결이 복구되었습니다');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      warning('네트워크 연결 끊김', '인터넷 연결을 확인해주세요');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, warning, success]);

  // 오프라인 상태일 때만 표시
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 px-4 py-2 rounded-lg shadow-lg">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">오프라인</span>
    </div>
  );
}


