import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface ApiCacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

/**
 * API 응답을 캐싱하는 훅
 */
export const useApiCache = <T>(options: ApiCacheOptions = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 기본 5분 TTL, 최대 100개 항목
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [cacheSize, setCacheSize] = useState(0);

  // 캐시에서 데이터 가져오기
  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      return null;
    }

    // 만료 확인
    if (Date.now() > entry.expiry) {
      cacheRef.current.delete(key);
      setCacheSize(cacheRef.current.size);
      return null;
    }

    return entry.data;
  }, []);

  // 캐시에 데이터 저장
  const set = useCallback((key: string, data: T) => {
    const now = Date.now();
    
    // 캐시 크기 제한 확인
    if (cacheRef.current.size >= maxSize && !cacheRef.current.has(key)) {
      // LRU 방식으로 가장 오래된 항목 제거
      const oldestKey = Array.from(cacheRef.current.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]?.[0];
      
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
      }
    }

    cacheRef.current.set(key, {
      data,
      timestamp: now,
      expiry: now + ttl,
    });

    setCacheSize(cacheRef.current.size);
  }, [ttl, maxSize]);

  // 캐시에서 특정 키 제거
  const remove = useCallback((key: string) => {
    const deleted = cacheRef.current.delete(key);
    if (deleted) {
      setCacheSize(cacheRef.current.size);
    }
    return deleted;
  }, []);

  // 캐시 전체 비우기
  const clear = useCallback(() => {
    cacheRef.current.clear();
    setCacheSize(0);
  }, []);

  // 만료된 항목들 정리
  const cleanup = useCallback(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    cacheRef.current.forEach((entry, key) => {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      cacheRef.current.delete(key);
    });

    if (keysToDelete.length > 0) {
      setCacheSize(cacheRef.current.size);
    }
  }, []);

  // 주기적으로 만료된 항목 정리
  useEffect(() => {
    const interval = setInterval(cleanup, ttl / 2);
    return () => clearInterval(interval);
  }, [cleanup, ttl]);

  return {
    get,
    set,
    remove,
    clear,
    size: cacheSize,
  };
};

export default useApiCache;