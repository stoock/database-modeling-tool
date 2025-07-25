import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 값을 디바운스하는 훅
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 함수 호출을 디바운스하는 훅
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * API 호출을 디바운스하고 중복 요청을 방지하는 훅
 */
export const useDebouncedApi = <T>(
  apiCall: (...args: any[]) => Promise<T>,
  delay: number = 300
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedApiCall = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 이전 타이머 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            setLoading(true);
            setError(null);

            // 새로운 AbortController 생성
            abortControllerRef.current = new AbortController();

            const result = await apiCall(...args);
            setLoading(false);
            resolve(result);
          } catch (err) {
            setLoading(false);
            if (err instanceof Error && err.name !== 'AbortError') {
              setError(err);
              reject(err);
            } else {
              resolve(null);
            }
          }
        }, delay);
      });
    },
    [apiCall, delay]
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    call: debouncedApiCall,
    loading,
    error,
  };
};

export default useDebounce;