import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, UNSAFE_NavigationContext } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useChangeTracker } from '../../utils/changeTracker';

/**
 * 저장되지 않은 변경사항이 있을 때 페이지 이탈 시 경고 다이얼로그
 */
const UnsavedChangesDialog: React.FC = () => {
  const navigate = useNavigate();
  // const location = useLocation(); // 현재 미사용
  const changeTracker = useChangeTracker();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // 현재 변경사항 상태
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(
    changeTracker.getState().hasUnsavedChanges
  );
  
  // 변경사항 상태 구독
  useEffect(() => {
    return changeTracker.subscribe(state => {
      setHasUnsavedChanges(state.hasUnsavedChanges);
    });
  }, [changeTracker]);
  
  // 라우터 이탈 차단
  const blockNavigation = useCallback(
    (navigationAction: any) => {
      if (hasUnsavedChanges) {
        setShowDialog(true);
        setPendingNavigation(navigationAction.location.pathname);
        return false;
      }
      return true;
    },
    [hasUnsavedChanges]
  );
  
  // 라우터 이탈 차단 설정
  useEffect(() => {
    if (hasUnsavedChanges) {
      const unblock = (UNSAFE_NavigationContext as any)._context.navigator.block(
        (tx: any) => {
          blockNavigation(tx);
        }
      );
      return unblock;
    }
    return () => {};
  }, [hasUnsavedChanges, blockNavigation]);
  
  // 이탈 확인
  const handleConfirmNavigation = () => {
    setShowDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };
  
  // 이탈 취소
  const handleCancelNavigation = () => {
    setShowDialog(false);
    setPendingNavigation(null);
  };
  
  return (
    <Dialog
      open={showDialog}
      onClose={handleCancelNavigation}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                저장되지 않은 변경사항
              </Dialog.Title>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              저장되지 않은 변경사항이 있습니다. 페이지를 나가면 변경사항이 손실됩니다.
            </p>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancelNavigation}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirmNavigation}
              className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              변경사항 버리기
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UnsavedChangesDialog;