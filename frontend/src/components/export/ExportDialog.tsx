import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { exportToSql } from '@/lib/api';
import { useToastStore } from '@/stores/toastStore';
import type { ExportOptions } from '@/types';
import { Download, Copy, Loader2, FileCode } from 'lucide-react';

interface ExportDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeDropStatements: false,
    includeComments: true,
    includeIndexes: true,
    includeConstraints: true,
  });
  
  const [sqlScript, setSqlScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { success, error } = useToastStore();

  // SQL 생성
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await exportToSql(projectId, options);
      setSqlScript(result.content || result.sql || '');
    } catch (err) {
      error('SQL 생성 실패', 'SQL 스크립트 생성 중 오류가 발생했습니다');
      console.error('SQL generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 클립보드 복사
  const handleCopy = async () => {
    if (!sqlScript) {
      error('복사 실패', '먼저 SQL을 생성해주세요');
      return;
    }
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(sqlScript);
      success('복사 완료', 'SQL 스크립트가 클립보드에 복사되었습니다');
    } catch (err) {
      error('복사 실패', '클립보드 복사 중 오류가 발생했습니다');
      console.error('Copy error:', err);
    } finally {
      setIsCopying(false);
    }
  };

  // 파일 다운로드
  const handleDownload = () => {
    if (!sqlScript) {
      error('다운로드 실패', '먼저 SQL을 생성해주세요');
      return;
    }
    
    setIsDownloading(true);
    try {
      const blob = new Blob([sqlScript], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName}_schema_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      success('다운로드 완료', 'SQL 파일이 다운로드되었습니다');
    } catch (err) {
      error('다운로드 실패', '파일 다운로드 중 오류가 발생했습니다');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // 옵션 변경 핸들러
  const handleOptionChange = (key: keyof ExportOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
    // 옵션 변경 시 기존 SQL 초기화
    setSqlScript('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            SQL 스키마 내보내기
          </DialogTitle>
          <DialogDescription>
            {projectName} 프로젝트의 데이터베이스 스키마를 MSSQL DDL 스크립트로 내보냅니다
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* 내보내기 옵션 */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-sm">내보내기 옵션</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDropStatements"
                  checked={options.includeDropStatements}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeDropStatements', checked as boolean)
                  }
                />
                <Label
                  htmlFor="includeDropStatements"
                  className="text-sm font-normal cursor-pointer"
                >
                  DROP 문 포함 (기존 객체 삭제)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeComments"
                  checked={options.includeComments}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeComments', checked as boolean)
                  }
                />
                <Label
                  htmlFor="includeComments"
                  className="text-sm font-normal cursor-pointer"
                >
                  MS_Description 주석 포함 (권장)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeIndexes"
                  checked={options.includeIndexes}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeIndexes', checked as boolean)
                  }
                />
                <Label
                  htmlFor="includeIndexes"
                  className="text-sm font-normal cursor-pointer"
                >
                  인덱스 생성문 포함
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeConstraints"
                  checked={options.includeConstraints}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeConstraints', checked as boolean)
                  }
                />
                <Label
                  htmlFor="includeConstraints"
                  className="text-sm font-normal cursor-pointer"
                >
                  제약조건 포함 (PK, DEFAULT 등)
                </Label>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  SQL 생성 중...
                </>
              ) : (
                <>
                  <FileCode className="mr-2 h-4 w-4" />
                  SQL 생성
                </>
              )}
            </Button>
          </div>

          {/* SQL 미리보기 */}
          {sqlScript && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">SQL 스크립트 미리보기</h3>
                <span className="text-xs text-gray-500">
                  {sqlScript.split('\n').length} 줄
                </span>
              </div>
              
              <div className="relative">
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                  <code>{sqlScript}</code>
                </pre>
              </div>
            </div>
          )}

          {/* DB 스키마 가이드 준수 사항 */}
          {sqlScript && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">
                DB 스키마 가이드 준수 확인
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ 모든 객체명 대문자 사용</li>
                <li>✓ MS_Description으로 한글 설명 등록</li>
                <li>✓ 시스템 속성 컬럼 포함 (REG_ID, REG_DT, CHG_ID, CHG_DT)</li>
                <li>✓ 명명 규칙 준수 (PK__, CIDX__, IDX__)</li>
                <li>✓ REG_DT DEFAULT GETDATE() 제약조건</li>
                <li>✓ 테이블 생성 → 인덱스 → 제약조건 → Description 순서</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!sqlScript || isCopying}
          >
            {isCopying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                복사 중...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                클립보드 복사
              </>
            )}
          </Button>
          
          <Button
            onClick={handleDownload}
            disabled={!sqlScript || isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                다운로드 중...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                .sql 파일 다운로드
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
