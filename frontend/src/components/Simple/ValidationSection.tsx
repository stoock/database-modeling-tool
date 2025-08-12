import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useValidationStore } from '../../stores/validationStore';
import Button from '../common/Button';
// ValidationResult 타입은 store에서 추론

interface ValidationSectionProps {
  disabled?: boolean;
}

/**
 * 검증 결과 섹션
 * - 실시간 검증 결과 표시
 * - 명명 규칙, 비즈니스 규칙, SQL Server 특화 검증
 * - 오류별 수정 가이드 제공
 */
const ValidationSection: React.FC<ValidationSectionProps> = ({ disabled = false }) => {
  const { currentProject } = useProjectStore();
  const {
    validationResult,
    isValidating,
    validateProject,
    clearValidations
  } = useValidationStore();

  // 로컬 상태
  const [autoValidation, setAutoValidation] = useState(true);

  // 프로젝트 변경 시 자동 검증
  useEffect(() => {
    if (currentProject?.id && autoValidation) {
      const timer = setTimeout(() => {
        validateProject(currentProject.id);
      }, 1000); // 1초 딜레이

      return () => clearTimeout(timer);
    }
  }, [currentProject?.id, autoValidation, validateProject]);

  // 수동 검증 실행
  const handleManualValidation = () => {
    if (currentProject?.id) {
      validateProject(currentProject.id);
    }
  };

  // 검증 결과 초기화
  const handleClearValidations = () => {
    clearValidations();
  };

  // 오류 타입별 아이콘 및 색상
  const getErrorStyle = (rule: string) => {
    switch (rule) {
      case 'SQL_SERVER_NAMING':
        return { icon: '🏷️', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-800' };
      case 'SQL_SERVER_DESCRIPTION':
        return { icon: '📝', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-800' };
      case 'SQL_SERVER_AUDIT':
        return { icon: '📊', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-800' };
      case 'NAMING_RULE':
        return { icon: '⚠️', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-800' };
      case 'BUSINESS_RULE':
        return { icon: '❌', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-800' };
      case 'DATA_TYPE':
        return { icon: '🔧', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', textColor: 'text-gray-800' };
      default:
        return { icon: '❓', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', textColor: 'text-gray-800' };
    }
  };

  if (disabled || !currentProject) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">프로젝트를 먼저 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* 검증 컨트롤 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-700">프로젝트 검증</h3>
          
          {/* 자동 검증 토글 */}
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoValidation}
              onChange={(e) => setAutoValidation(e.target.checked)}
              className="rounded"
            />
            <span>실시간 자동 검증</span>
          </label>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleManualValidation}
            disabled={isValidating}
            variant="outline"
            size="sm"
          >
            {isValidating ? '검증 중...' : '수동 검증'}
          </Button>
          
          {validationResult && (
            <Button
              onClick={handleClearValidations}
              variant="ghost"
              size="sm"
            >
              결과 지우기
            </Button>
          )}
        </div>
      </div>

      {/* 검증 진행 중 */}
      {isValidating && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
            <span className="text-blue-800 font-medium text-sm">프로젝트 검증 중...</span>
          </div>
        </div>
      )}

      {/* 검증 결과 */}
      {validationResult && !isValidating && (
        <div className="space-y-3">
          
          {/* 검증 요약 */}
          <div className={`rounded-lg p-4 ${
            validationResult.isValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {validationResult.isValid ? '✅' : '❌'}
              </div>
              <div>
                <h3 className={`font-medium ${
                  validationResult.isValid ? 'text-green-900' : 'text-red-900'
                }`}>
                  {validationResult.isValid ? '검증 통과' : '검증 실패'}
                </h3>
                <p className={`text-sm ${
                  validationResult.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {validationResult.isValid 
                    ? '모든 검증 규칙을 통과했습니다.'
                    : `${validationResult.errors.length}개의 오류와 ${validationResult.warnings?.length || 0}개의 경고가 발견되었습니다.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 오류 목록 */}
          {validationResult.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-red-900 mb-3">오류 ({validationResult.errors.length}개)</h4>
              <div className="space-y-2">
                {validationResult.errors.map((error, index) => {
                  const style = getErrorStyle(error.rule);
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${style.bgColor} ${style.borderColor}`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{style.icon}</span>
                        <div className="flex-1">
                          <div className={`font-medium ${style.textColor}`}>
                            [{error.rule}] {error.field}
                          </div>
                          <p className={`text-sm ${style.textColor} mt-1`}>
                            {error.message}
                          </p>
                          {error.suggestion && (
                            <div className={`text-xs ${style.textColor} mt-2 bg-white/50 rounded px-2 py-1`}>
                              💡 제안: {error.suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 경고 목록 */}
          {validationResult.warnings && validationResult.warnings.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-900 mb-3">경고 ({validationResult.warnings.length}개)</h4>
              <div className="space-y-2">
                {validationResult.warnings.map((warning, index) => {
                  const style = getErrorStyle('WARNING');
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${style.bgColor} ${style.borderColor}`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{style.icon}</span>
                        <div className="flex-1">
                          <div className={`font-medium ${style.textColor}`}>
                            [WARNING] {warning.field}
                          </div>
                          <p className={`text-sm ${style.textColor} mt-1`}>
                            {warning.message}
                          </p>
                          {warning.suggestion && (
                            <div className={`text-xs ${style.textColor} mt-2 bg-white/50 rounded px-2 py-1`}>
                              💡 제안: {warning.suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 검증 결과가 없을 때 */}
      {!validationResult && !isValidating && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">아직 검증을 실행하지 않았습니다.</p>
          <p className="text-sm">위의 "수동 검증" 버튼을 클릭하거나 자동 검증을 활성화하세요.</p>
        </div>
      )}

      {/* 검증 규칙 안내 */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">🔍 검증 규칙</h4>
        <ul className="text-xs text-gray-700 space-y-0.5">
          <li>• <strong>명명 규칙</strong>: 테이블명(PascalCase), 컬럼명(snake_case)</li>
          <li>• <strong>SQL Server 특화</strong>: 대문자 강제, Description 필수, 감사 컬럼 권장</li>
          <li>• <strong>비즈니스 규칙</strong>: 기본키 필수, 컬럼명 중복 방지</li>
          <li>• <strong>데이터 타입</strong>: MSSQL 호환 타입 및 길이 검증</li>
        </ul>
      </div>
    </div>
  );
};

export default ValidationSection;