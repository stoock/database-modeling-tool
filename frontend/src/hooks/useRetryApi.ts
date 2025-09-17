import { useState, useCallback, useRef } from 'react';

interface UseRetryApiOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onError?: (error: unknown, attempt: number) => void;
  onMaxRetriesReached?: (error: unknown) => void;
}

interface RetryState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  hasReachedMaxRetries: boolean;
}

export const useRetryApi = <T>(
  apiCall: () => Promise<T>,
  options: UseRetryApiOptions = {}
) => {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onError,
    onMaxRetriesReached
  } = options;

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    hasReachedMaxRetries: false
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const clearRetry = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const calculateDelay = useCallback((attempt: number) => {
    return delayMs * Math.pow(backoffMultiplier, attempt);
  }, [delayMs, backoffMultiplier]);

  const executeWithRetry = useCallback(async (): Promise<T | null> => {
    clearRetry();
    retryCountRef.current = 0;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: 0,
      hasReachedMaxRetries: false
    }));

    const attemptCall = async (attempt: number): Promise<T | null> => {
      try {
        const result = await apiCall();
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          retryCount: attempt,
          hasReachedMaxRetries: false
        }));

        return result;
      } catch (error) {
        retryCountRef.current = attempt;
        
        setState(prev => ({
          ...prev,
          retryCount: attempt,
          error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        }));

        onError?.(error, attempt);

        if (attempt >= maxRetries) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            hasReachedMaxRetries: true
          }));

          onMaxRetriesReached?.(error);
          return null;
        }

        // 다음 재시도까지 딜레이
        const delay = calculateDelay(attempt);
        
        return new Promise<T | null>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            resolve(attemptCall(attempt + 1));
          }, delay);
        });
      }
    };

    return attemptCall(1);
  }, [apiCall, maxRetries, onError, onMaxRetriesReached, calculateDelay, clearRetry]);

  const retry = useCallback(() => {
    if (!state.isLoading && state.hasReachedMaxRetries) {
      return executeWithRetry();
    }
    return Promise.resolve(null);
  }, [executeWithRetry, state.isLoading, state.hasReachedMaxRetries]);

  return {
    execute: executeWithRetry,
    retry,
    clear: clearRetry,
    state
  };
};

export default useRetryApi;