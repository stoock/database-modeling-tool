import { useState, useCallback, useMemo, memo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ValidationError, ValidationResult } from '@/types';
import { validateProject } from '@/lib/api';

interface ValidationPanelProps {
  projectId: string;
  onNavigateToEntity?: (entityType: 'TABLE' | 'COLUMN' | 'INDEX', entityId: string) => void;
}

function ValidationPanelComponent({ projectId, onNavigateToEntity }: ValidationPanelProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['errors', 'warnings']));

  // 검증 실행을 useCallback으로 메모이제이션
  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateProject(projectId);
      setValidationResult(result);
    } catch (error) {
      console.error('검증 실패:', error);
    } finally {
      setIsValidating(false);
    }
  }, [projectId]);

  // 섹션 토글을 useCallback으로 메모이제이션
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  // 엔티티로 이동을 useCallback으로 메모이제이션
  const handleNavigate = useCallback((entityType: 'TABLE' | 'COLUMN' | 'INDEX', entityId: string) => {
    if (onNavigateToEntity) {
      onNavigateToEntity(entityType, entityId);
    }
  }, [onNavigateToEntity]);

  // 엔티티별 그룹화를 useCallback으로 메모이제이션
  const groupByEntity = useCallback((items: ValidationError[]): Record<string, ValidationError[]> => {
    return items.reduce((acc, item) => {
      const key = `${item.entity}-${item.entityId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ValidationError[]>);
  }, []);

  // 준수율 계산을 useMemo로 캐싱
  const complianceRate = useMemo((): number => {
    if (!validationResult) return 0;
    const totalIssues = validationResult.errors.length + validationResult.warnings.length;
    if (totalIssues === 0) return 100;
    
    // 에러는 더 큰 가중치, 경고는 작은 가중치
    const errorWeight = 2;
    const warningWeight = 1;
    const totalWeight = validationResult.errors.length * errorWeight + validationResult.warnings.length * warningWeight;
    const maxWeight = totalIssues * errorWeight;
    
    return Math.max(0, Math.round((1 - totalWeight / maxWeight) * 100));
  }, [validationResult]);

  // 에러 및 경고 그룹을 useMemo로 캐싱
  const errorGroups = useMemo(() => 
    validationResult ? groupByEntity(validationResult.errors) : {},
    [validationResult, groupByEntity]
  );

  const warningGroups = useMemo(() => 
    validationResult ? groupByEntity(validationResult.warnings) : {},
    [validationResult, groupByEntity]
  );

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">명명 규칙 검증</h3>
          <Button
            onClick={handleValidate}
            disabled={isValidating}
            size="sm"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                검증 중...
              </>
            ) : (
              '검증 실행'
            )}
          </Button>
        </div>

        {/* 검증 결과 요약 */}
        {validationResult && (
          <div className="grid grid-cols-3 gap-4">
            {/* 에러 수 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">에러</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {validationResult.errors.length}
              </p>
            </div>

            {/* 경고 수 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">경고</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {validationResult.warnings.length}
              </p>
            </div>

            {/* 준수율 */}
            <div className={`border rounded-lg p-4 ${
              complianceRate >= 80 
                ? 'bg-green-50 border-green-200' 
                : complianceRate >= 50 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className={`h-5 w-5 ${
                  complianceRate >= 80 
                    ? 'text-green-500' 
                    : complianceRate >= 50 
                    ? 'text-yellow-500' 
                    : 'text-red-500'
                }`} />
                <span className={`text-sm font-medium ${
                  complianceRate >= 80 
                    ? 'text-green-700' 
                    : complianceRate >= 50 
                    ? 'text-yellow-700' 
                    : 'text-red-700'
                }`}>준수율</span>
              </div>
              <p className={`text-2xl font-bold ${
                complianceRate >= 80 
                  ? 'text-green-600' 
                  : complianceRate >= 50 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
              }`}>
                {complianceRate}%
              </p>
            </div>
          </div>
        )}

        {/* 검증 결과 상세 */}
        {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
          <div className="space-y-4 mt-6">
            {/* 에러 목록 */}
            {validationResult.errors.length > 0 && (
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('errors')}
                  className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-700">
                      에러 ({validationResult.errors.length})
                    </span>
                  </div>
                  {expandedSections.has('errors') ? (
                    <ChevronDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-red-500" />
                  )}
                </button>

                {expandedSections.has('errors') && (
                  <div className="p-4 space-y-3 bg-white">
                    {Object.entries(errorGroups).map(([key, errors]) => {
                      const firstError = errors[0];
                      return (
                        <div
                          key={key}
                          className="border border-red-200 rounded-lg p-3 hover:bg-red-50 transition-colors cursor-pointer"
                          onClick={() => handleNavigate(firstError.entity, firstError.entityId)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                                {firstError.entity}
                              </span>
                              <p className="font-medium text-gray-900 mt-1">
                                {firstError.entityName}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {errors.map((error, idx) => (
                              <div key={idx} className="text-sm">
                                <p className="text-red-700">
                                  {error.field && <span className="font-medium">[{error.field}] </span>}
                                  {error.message}
                                </p>
                                {error.suggestion && (
                                  <p className="text-gray-600 text-xs mt-1">
                                    💡 {error.suggestion}
                                  </p>
                                )}
                                {error.expected && error.actual && (
                                  <div className="text-xs mt-1 space-y-1">
                                    <p className="text-gray-600">
                                      예상: <span className="font-mono">{error.expected}</span>
                                    </p>
                                    <p className="text-gray-600">
                                      실제: <span className="font-mono">{error.actual}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 경고 목록 */}
            {validationResult.warnings.length > 0 && (
              <div className="border border-yellow-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('warnings')}
                  className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700">
                      경고 ({validationResult.warnings.length})
                    </span>
                  </div>
                  {expandedSections.has('warnings') ? (
                    <ChevronDown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-yellow-500" />
                  )}
                </button>

                {expandedSections.has('warnings') && (
                  <div className="p-4 space-y-3 bg-white">
                    {Object.entries(warningGroups).map(([key, warnings]) => {
                      const firstWarning = warnings[0];
                      return (
                        <div
                          key={key}
                          className="border border-yellow-200 rounded-lg p-3 hover:bg-yellow-50 transition-colors cursor-pointer"
                          onClick={() => handleNavigate(firstWarning.entity, firstWarning.entityId)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                {firstWarning.entity}
                              </span>
                              <p className="font-medium text-gray-900 mt-1">
                                {firstWarning.entityName}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {warnings.map((warning, idx) => (
                              <div key={idx} className="text-sm">
                                <p className="text-yellow-700">
                                  {warning.field && <span className="font-medium">[{warning.field}] </span>}
                                  {warning.message}
                                </p>
                                {warning.suggestion && (
                                  <p className="text-gray-600 text-xs mt-1">
                                    💡 {warning.suggestion}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 검증 결과 없음 */}
        {validationResult && validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-700">모든 검증을 통과했습니다!</p>
            <p className="text-sm text-gray-600 mt-1">
              명명 규칙을 완벽하게 준수하고 있습니다.
            </p>
          </div>
        )}

        {/* 초기 상태 */}
        {!validationResult && !isValidating && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              검증 실행 버튼을 클릭하여 프로젝트의 명명 규칙을 검증하세요.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const ValidationPanel = memo(ValidationPanelComponent);
