import { useEffect, useState } from 'react';

/**
 * 저장되지 않은 변경사항을 추적하는 훅
 */
export const useUnsavedChanges = (hasChanges: boolean) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges) {
        event.preventDefault();
        event.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 페이지를 떠나시겠습니까?';
        return event.returnValue;
      }
    };

    const handlePopState = () => {
      if (hasChanges) {
        setShowWarning(true);
        // 뒤로가기 방지
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (hasChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      // 현재 상태를 히스토리에 추가
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasChanges]);

  const confirmLeave = () => {
    setShowWarning(false);
    window.history.back();
  };

  const cancelLeave = () => {
    setShowWarning(false);
  };

  return {
    showWarning,
    confirmLeave,
    cancelLeave,
  };
};

export default useUnsavedChanges;