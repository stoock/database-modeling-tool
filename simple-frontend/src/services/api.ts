/**
 * Axios 기반 API 클라이언트
 */

import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 로딩 상태 시작 (필요시 스토어 연동)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 성공 응답 처리
    return response.data;
  },
  (error: AxiosError<ApiError>) => {
    // 에러 응답 처리
    const message =
      error.response?.data?.error ||
      error.message ||
      '요청 처리 중 오류가 발생했습니다.';

    // 에러 객체 생성
    const apiError: ApiError = {
      error: message,
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
    };

    return Promise.reject(apiError);
  }
);

export default api;
