import React, { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import { useValidationStore } from '../../stores/validationStore';
import SqlPreview from './SqlPreview';
import ExportOptions from './ExportOptions';
import SchemaDocumentation from './SchemaDocumentation';
import ExportHistory from './ExportHistory';
import { addExportRecord } from '../../utils/exportHistory';
import type { ExportFormat } from '../../types';

const SchemaExportPanel: React.FC = () => {
  const { currentProject } = useProjectStore();
  const { validateProject } = useValidationStore();
  
  const [exportOptions, setExportOptions] = useState({
    format: 'SQL' as ExportFormat,
    includeComments: true,
    includeIndexes: true,
    includeConstraints: true
  });
  
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errorCount: number;
  } | null>(null);
  
  // 스키마 검증
  const handleValidateSchema = async () => {
    if (!currentProject) return;
    
    const result = await validateProject(currentProject.id);
    
    if (result) {
      setValidationResult({
        isValid: result.isValid,
        errorCount: result.errors.length
      });
    }
  };
  
  // 내보내기 옵션 변경 핸들러
  const handleOptionsChange = (options: {
    format: ExportFormat;
    includeComments: boolean;
    includeIndexes: boolean;
    includeConstraints: boolean;
  }) => {
    setExportOptions(options);
  };
  
  // 내보내기 완료 핸들러 (기록에 추가)
  const handleExportComplete = (result: {
    content: string;
    filename: string;
    mimeType: string;
  }) => {
    if (!currentProject) return;
    
    // 내보내기 기록에 추가
    addExportRecord(
      currentProject.id,
      exportOptions.format,
      result.filename,
      true
    );
  };
  
  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <DocumentTextIcon className="h-12 w-12 mb-2" />
        <p>스키마를 내보내려면 프로젝트를 선택하세요.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">스키마 내보내기</h2>
        <button
          onClick={handleValidateSchema}
          className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          스키마 검증
        </button>
      </div>
      
      {/* 검증 결과 표시 */}
      {validationResult && (
        <div className={`p-4 rounded-md ${
          validationResult.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {validationResult.isValid ? (
            <p className="font-medium">스키마가 유효합니다. 내보내기를 진행할 수 있습니다.</p>
          ) : (
            <div>
              <p className="font-medium">스키마에 {validationResult.errorCount}개의 오류가 있습니다.</p>
              <p className="mt-1 text-sm">내보내기 전에 오류를 수정하는 것을 권장합니다.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽 패널: 내보내기 옵션 및 기록 */}
        <div className="lg:col-span-1 space-y-6">
          <ExportOptions
            projectId={currentProject.id}
            onOptionsChange={handleOptionsChange}
            onExportComplete={handleExportComplete}
          />
          
          <ExportHistory
            projectId={currentProject.id}
          />
        </div>
        
        {/* 오른쪽 패널: 미리보기 및 문서화 */}
        <div className="lg:col-span-2 space-y-6">
          <SqlPreview
            projectId={currentProject.id}
            format={exportOptions.format}
            includeComments={exportOptions.includeComments}
            includeIndexes={exportOptions.includeIndexes}
            includeConstraints={exportOptions.includeConstraints}
          />
          
          <SchemaDocumentation
            projectId={currentProject.id}
          />
        </div>
      </div>
    </div>
  );
};

export default SchemaExportPanel;