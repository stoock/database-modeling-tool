import { useCallback } from 'react';
import { useToastStore } from '@/stores/toastStore';
import { parseError, logError, getUserFriendlyMessage } from '@/lib/errorHandler';

/**
 * 비동기 작업 에러 처리 훅
 * 
 * @example
 * const handleError = useAsyncError();
 * 
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   handleError(error);
 * }
 */
export function useAsyncError() {
  const { error: showError } = useToastStore();

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      // 에러 파싱
      const errorInfo = parseError(error);
      
      // 에러 로깅
      logError(errorInfo);
      
      // 사용자 친화적 메시지 생성
      const message = customMessage || getUserFriendlyMessage(errorInfo);
      
      // 토스트 표시
      showError(errorInfo.title, message);
    },
    [showError]
  );

  return handleError;
}

/**
 * 비동기 작업 래퍼 훅
 * 에러 처리를 자동으로 수행하는 비동기 함수 래퍼를 제공합니다.
 * 
 * @example
 * const wrapAsync = useAsyncWrapper();
 * 
 * const handleSubmit = wrapAsync(async (data) => {
 *   await createProject(data);
 * });
 */
export function useAsyncWrapper() {
  const handleError = useAsyncError();

  const wrapAsync = useCallback(
    <T extends (...args: never[]) => Promise<unknown>>(
      asyncFn: T,
      options?: {
        onError?: (error: unknown) => void;
        errorMessage?: string;
      }
    ) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
        try {
          return await asyncFn(...args);
        } catch (error) {
          // 커스텀 에러 핸들러가 있으면 실행
          if (options?.onError) {
            options.onError(error);
          }
          
          // 에러 처리
          handleError(error, options?.errorMessage);
          
          return undefined;
        }
      };
    },
    [handleError]
  );

  return wrapAsync;
}
