import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

/**
 * 컴포넌트 렌더링 성능을 모니터링하는 훅
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>();
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  // 렌더링 시작 시간 기록
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  // 렌더링 완료 시간 기록
  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now(),
      };

      metricsRef.current.push(metrics);

      // 최근 100개 메트릭만 유지
      if (metricsRef.current.length > 100) {
        metricsRef.current = metricsRef.current.slice(-100);
      }

      // 개발 환경에서만 로그 출력
      if (import.meta.env.DEV && renderTime > 16) { // 60fps 기준 16ms
        console.warn(`[Performance] ${componentName} 렌더링 시간: ${renderTime.toFixed(2)}ms`);
      }
    }
  });

  // 성능 메트릭 가져오기
  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  // 평균 렌더링 시간 계산
  const getAverageRenderTime = useCallback(() => {
    if (metricsRef.current.length === 0) return 0;
    
    const total = metricsRef.current.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / metricsRef.current.length;
  }, []);

  // 최대 렌더링 시간 계산
  const getMaxRenderTime = useCallback(() => {
    if (metricsRef.current.length === 0) return 0;
    
    return Math.max(...metricsRef.current.map(metric => metric.renderTime));
  }, []);

  return {
    getMetrics,
    getAverageRenderTime,
    getMaxRenderTime,
  };
};

/**
 * API 호출 성능을 모니터링하는 훅
 */
export const useApiPerformanceMonitor = () => {
  const metricsRef = useRef<Map<string, { duration: number; timestamp: number }[]>>(new Map());

  const measureApiCall = useCallback(async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      // 메트릭 저장
      const existing = metricsRef.current.get(apiName) || [];
      existing.push({ duration, timestamp: Date.now() });
      
      // 최근 50개만 유지
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50);
      }
      
      metricsRef.current.set(apiName, existing);
      
      // 개발 환경에서만 로그 출력
      if (import.meta.env.DEV && duration > 1000) { // 1초 이상
        console.warn(`[API Performance] ${apiName} 응답 시간: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // 에러 발생 시에도 메트릭 저장
      const existing = metricsRef.current.get(apiName) || [];
      existing.push({ duration, timestamp: Date.now() });
      metricsRef.current.set(apiName, existing);
      
      throw error;
    }
  }, []);

  const getApiMetrics = useCallback((apiName?: string) => {
    if (apiName) {
      return metricsRef.current.get(apiName) || [];
    }
    
    const allMetrics: Record<string, { duration: number; timestamp: number }[]> = {};
    metricsRef.current.forEach((metrics, name) => {
      allMetrics[name] = metrics;
    });
    
    return allMetrics;
  }, []);

  const getAverageApiTime = useCallback((apiName: string) => {
    const metrics = metricsRef.current.get(apiName) || [];
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }, []);

  return {
    measureApiCall,
    getApiMetrics,
    getAverageApiTime,
  };
};

export default usePerformanceMonitor;