import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useTableStore } from '../../stores/tableStore';
import Button from '../common/Button';
import Select from '../common/Select';
import type { ExportRequest } from '../../types';

interface ExportSectionProps {
  disabled?: boolean;
}

/**
 * 스키마 내보내기 섹션
 * - 다양한 형식으로 스키마 내보내기 (SQL, JSON, Markdown, HTML, CSV)
 * - 내보내기 옵션 설정 (주석, 인덱스 포함 등)
 * - 파일 다운로드 기능
 */
const ExportSection: React.FC<ExportSectionProps> = ({ disabled = false }) => {
  const { currentProject } = useProjectStore();
  const { tables } = useTableStore();

  // 로컬 상태
  const [exportOptions, setExportOptions] = useState<ExportRequest>({
    format: 'SQL',
    includeComments: true,
    includeIndexes: true,
    includeConstraints: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<{ filename: string; size: string } | null>(null);

  // 내보내기 형식 옵션
  const formatOptions = [
    { value: 'SQL', label: 'SQL 스크립트 (.sql)', description: 'CREATE TABLE 문과 인덱스, 제약조건' },
    { value: 'JSON', label: 'JSON 형식 (.json)', description: '구조화된 스키마 데이터' },
    { value: 'MARKDOWN', label: 'Markdown 문서 (.md)', description: '읽기 쉬운 문서 형태' },
    { value: 'HTML', label: 'HTML 보고서 (.html)', description: '웹에서 볼 수 있는 형태' },
    { value: 'CSV', label: 'CSV 테이블 (.csv)', description: '테이블별 컬럼 정보' }
  ];

  // 내보내기 실행
  const handleExport = async () => {
    if (!currentProject?.id) return;

    setIsExporting(true);
    try {
      // TODO: 실제 API 호출 (현재는 모의 구현)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
      
      // 모의 결과
      const mockResult = {
        filename: `${currentProject.name}_schema.${exportOptions.format.toLowerCase()}`,
        size: '25.6 KB'
      };
      
      setLastExportResult(mockResult);
      
      // 실제 구현에서는 여기서 파일 다운로드 처리
      console.log('내보내기 완료:', exportOptions);
      
    } catch (error) {
      console.error('내보내기 실패:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // 미리보기 (모의 구현)
  const getPreviewContent = () => {
    if (!currentProject || tables.length === 0) return '테이블이 없습니다.';

    switch (exportOptions.format) {
      case 'SQL':
        return `-- ${currentProject.name} 데이터베이스 스키마
-- 생성일: ${new Date().toLocaleString()}

${tables.slice(0, 2).map(table => `
CREATE TABLE [${table.name}] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    ${table.columns?.slice(0, 3).map(col => 
      `[${col.name}] ${col.dataType}${col.maxLength ? `(${col.maxLength})` : ''} ${col.nullable ? 'NULL' : 'NOT NULL'}`
    ).join(',\n    ') || '-- 컬럼 정보 없음'}
);${exportOptions.includeComments ? `\n-- ${table.description || '테이블 설명 없음'}` : ''}
`).join('\n')}

-- ... (총 ${tables.length}개 테이블)`;

      case 'JSON':
        return JSON.stringify({
          project: currentProject.name,
          tables: tables.slice(0, 2).map(table => ({
            name: table.name,
            description: table.description,
            columns: table.columns?.slice(0, 3).map(col => ({
              name: col.name,
              dataType: col.dataType,
              maxLength: col.maxLength,
              nullable: col.nullable,
              primaryKey: col.primaryKey
            })) || []
          }))
        }, null, 2);

      case 'MARKDOWN':
        return `# ${currentProject.name} 데이터베이스 스키마

${tables.slice(0, 2).map(table => `
## ${table.name}
${table.description || '테이블 설명 없음'}

| 컬럼명 | 타입 | 길이 | NULL | PK | 설명 |
|--------|------|------|------|----|----- |
${table.columns?.slice(0, 3).map(col => 
  `| ${col.name} | ${col.dataType} | ${col.maxLength || '-'} | ${col.nullable ? 'Y' : 'N'} | ${col.primaryKey ? 'Y' : 'N'} | ${col.description || '-'} |`
).join('\n') || '| - | - | - | - | - | - |'}
`).join('\n')}

---
*총 ${tables.length}개 테이블*`;

      default:
        return `${currentProject.name} 스키마 (${exportOptions.format} 형식)`;
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
      
      {/* 내보내기 옵션 */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* 기본 설정 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 text-sm">내보내기 설정</h3>
          
          {/* 형식 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내보내기 형식
            </label>
            <Select
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
              className="w-full"
              options={formatOptions.map(option => ({
                value: option.value,
                label: option.label
              }))}
            />
            <p className="text-xs text-gray-600 mt-1">
              {formatOptions.find(opt => opt.value === exportOptions.format)?.description}
            </p>
          </div>

          {/* 포함 옵션 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              포함 옵션
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeComments}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">주석 및 설명 포함</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeIndexes}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeIndexes: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">인덱스 정의 포함</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeConstraints}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeConstraints: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">제약조건 포함</span>
            </label>
          </div>
        </div>

        {/* 프로젝트 정보 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 text-sm">프로젝트 정보</h3>
          
          <div className="bg-gray-50 rounded-md p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">프로젝트명:</span>
              <span className="font-medium">{currentProject.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">테이블 수:</span>
              <span className="font-medium">{tables.length}개</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">총 컬럼 수:</span>
              <span className="font-medium">
                {tables.reduce((sum, table) => sum + (table.columns?.length || 0), 0)}개
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">예상 파일 크기:</span>
              <span className="font-medium text-blue-600">
                {tables.length > 0 ? `~${Math.max(1, tables.length * 2)}KB` : '1KB 미만'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 미리보기 */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2 text-sm">미리보기</h3>
        <div className="bg-gray-900 text-gray-100 rounded-md p-3 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{getPreviewContent()}</pre>
        </div>
      </div>

      {/* 내보내기 실행 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {tables.length === 0 ? (
            <span className="text-yellow-600">⚠️ 내보낼 테이블이 없습니다.</span>
          ) : (
            <span>✅ {tables.length}개 테이블을 내보낼 준비가 되었습니다.</span>
          )}
        </div>
        
        <Button
          onClick={handleExport}
          disabled={isExporting || tables.length === 0}
          variant="primary"
          size="md"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none'
          }}
        >
          {isExporting ? (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>내보내는 중...</span>
            </span>
          ) : (
            `📁 ${exportOptions.format} 형식으로 내보내기`
          )}
        </Button>
      </div>

      {/* 마지막 내보내기 결과 */}
      {lastExportResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-green-600 text-xl">✅</span>
            <div>
              <h4 className="font-medium text-green-900">내보내기 완료</h4>
              <p className="text-sm text-green-700">
                {lastExportResult.filename} ({lastExportResult.size})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 지원 형식 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <h4 className="font-medium text-blue-900 mb-2 text-sm">📋 지원하는 내보내기 형식</h4>
        <ul className="text-xs text-blue-700 space-y-0.5">
          <li>• <strong>SQL</strong>: MSSQL Server 호환 CREATE TABLE 스크립트</li>
          <li>• <strong>JSON</strong>: 구조화된 스키마 데이터 (API 연동용)</li>
          <li>• <strong>Markdown</strong>: 문서화용 테이블 형식</li>
          <li>• <strong>HTML</strong>: 웹 브라우저에서 볼 수 있는 보고서</li>
          <li>• <strong>CSV</strong>: 스프레드시트에서 편집 가능한 형식</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportSection;