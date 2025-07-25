import { apiClient } from './api';
import type {
  Project,
  Table,
  Column,
  Index,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTableRequest,
  UpdateTableRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateIndexRequest,
  UpdateIndexRequest,
  ValidationResult,
  ExportRequest,
  ExportResult,
} from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * 캐싱 기능이 추가된 API 클라이언트
 */
class CachedApiClient {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtl = 5 * 60 * 1000; // 5분
  private readonly maxCacheSize = 100;

  private getCacheKey(method: string, ...args: any[]): string {
    return `${method}:${JSON.stringify(args)}`;
  }

  private get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // 만료 확인
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private set<T>(key: string, data: T, ttl: number = this.defaultTtl): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]?.[0];
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + ttl,
    });
  }

  private invalidatePattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // 프로젝트 관련 API (캐싱 적용)
  async getProjects(): Promise<Project[]> {
    const cacheKey = this.getCacheKey('getProjects');
    const cached = this.get<Project[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await apiClient.getProjects();
    this.set(cacheKey, result);
    return result;
  }

  async getProject(id: string): Promise<Project> {
    const cacheKey = this.getCacheKey('getProject', id);
    const cached = this.get<Project>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await apiClient.getProject(id);
    this.set(cacheKey, result);
    return result;
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    const result = await apiClient.createProject(request);
    
    // 프로젝트 목록 캐시 무효화
    this.invalidatePattern('getProjects');
    
    return result;
  }

  async updateProject(id: string, request: UpdateProjectRequest): Promise<Project> {
    const result = await apiClient.updateProject(id, request);
    
    // 관련 캐시 무효화
    this.invalidatePattern('getProjects');
    this.invalidatePattern(`getProject:["${id}"]`);
    
    return result;
  }

  async deleteProject(id: string): Promise<void> {
    await apiClient.deleteProject(id);
    
    // 관련 캐시 무효화
    this.invalidatePattern('getProjects');
    this.invalidatePattern(`getProject:["${id}"]`);
    this.invalidatePattern(`getTables:["${id}"]`);
  }

  // 테이블 관련 API (캐싱 적용)
  async getTables(projectId: string): Promise<Table[]> {
    const cacheKey = this.getCacheKey('getTables', projectId);
    const cached = this.get<Table[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await apiClient.getTables(projectId);
    this.set(cacheKey, result);
    return result;
  }

  async createTable(projectId: string, request: CreateTableRequest): Promise<Table> {
    const result = await apiClient.createTable(projectId, request);
    
    // 테이블 목록 캐시 무효화
    this.invalidatePattern(`getTables:["${projectId}"]`);
    this.invalidatePattern(`getProject:["${projectId}"]`);
    
    return result;
  }

  async updateTable(id: string, request: UpdateTableRequest): Promise<Table> {
    const result = await apiClient.updateTable(id, request);
    
    // 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
    
    return result;
  }

  async deleteTable(id: string): Promise<void> {
    await apiClient.deleteTable(id);
    
    // 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
  }

  // 컬럼 관련 API (캐싱 없음 - 실시간 업데이트 필요)
  async createColumn(tableId: string, request: CreateColumnRequest): Promise<Column> {
    const result = await apiClient.createColumn(tableId, request);
    
    // 테이블 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
    
    return result;
  }

  async updateColumn(id: string, request: UpdateColumnRequest): Promise<Column> {
    const result = await apiClient.updateColumn(id, request);
    
    // 테이블 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
    
    return result;
  }

  async deleteColumn(id: string): Promise<void> {
    await apiClient.deleteColumn(id);
    
    // 테이블 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
  }

  async updateColumnOrder(tableId: string, updates: { columnId: string; orderIndex: number }[]): Promise<Column[]> {
    const result = await apiClient.updateColumnOrder(tableId, updates);
    
    // 테이블 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
    
    return result;
  }

  // 인덱스 관련 API (캐싱 없음)
  async createIndex(tableId: string, request: CreateIndexRequest): Promise<Index> {
    const result = await apiClient.createIndex(tableId, request);
    
    // 테이블 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
    
    return result;
  }

  async updateIndex(id: string, request: UpdateIndexRequest): Promise<Index> {
    const result = await apiClient.updateIndex(id, request);
    
    // 테이블 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
    
    return result;
  }

  async deleteIndex(id: string): Promise<void> {
    await apiClient.deleteIndex(id);
    
    // 테이블 관련 캐시 무효화
    this.invalidatePattern('getTables');
    this.invalidatePattern('getProject');
  }

  // 검증 관련 API (캐싱 적용 - 짧은 TTL)
  async validateProject(projectId: string): Promise<ValidationResult> {
    const cacheKey = this.getCacheKey('validateProject', projectId);
    const cached = this.get<ValidationResult>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await apiClient.validateProject(projectId);
    this.set(cacheKey, result, 30 * 1000); // 30초 TTL
    return result;
  }

  // 스키마 내보내기 API (캐싱 없음)
  async exportSchema(projectId: string, request: ExportRequest): Promise<ExportResult> {
    return await apiClient.exportSchema(projectId, request);
  }

  // 캐시 관리 메서드
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 싱글톤 인스턴스 생성
export const cachedApiClient = new CachedApiClient();

export default cachedApiClient;