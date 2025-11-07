import { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Network } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';
import { getColumns } from '@/lib/api';
import type { Table, Column } from '@/types';

interface TableWithColumns extends Table {
  columns: Column[];
}

interface ErdDiagramDialogProps {
  projectName: string;
  tables: Table[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ErdDiagramDialog({
  projectName,
  tables,
  open,
  onOpenChange,
}: ErdDiagramDialogProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const { success, error } = useToastStore();
  const [tablesWithColumns, setTablesWithColumns] = useState<TableWithColumns[]>([]);
  const [loading, setLoading] = useState(false);

  // 테이블 컬럼 데이터 로드
  useEffect(() => {
    if (open && tables.length > 0) {
      loadTableColumns();
    }
  }, [open, tables]);

  const loadTableColumns = async () => {
    setLoading(true);
    try {
      const tablesData = await Promise.all(
        tables.map(async (table) => {
          const columns = await getColumns(table.id);
          return {
            ...table,
            columns,
          };
        })
      );
      setTablesWithColumns(tablesData);
    } catch (err) {
      error('로드 실패', '테이블 컬럼 정보를 불러오는데 실패했습니다');
      console.error('Load columns error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 텍스트 복사
  const handleCopy = async () => {
    const text = tablesWithColumns.map(table => {
      const columns = table.columns
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(col => `  - ${col.name} (${col.dataType})${col.primaryKey ? ' PK' : ''}${col.nullable ? '' : ' NOT NULL'}`)
        .join('\n');
      return `${table.name}\n${columns}`;
    }).join('\n\n');
    
    try {
      await navigator.clipboard.writeText(text);
      success('복사 완료', '테이블 구조가 클립보드에 복사되었습니다');
    } catch (err) {
      error('복사 실패', '클립보드 복사 중 오류가 발생했습니다');
      console.error('Copy error:', err);
    }
  };

  // 스크린샷 다운로드
  const handleDownload = () => {
    success('다운로드', '스크린샷 기능은 브라우저의 스크린샷 도구를 사용해주세요');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col bg-slate-50 dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">ERD 다이어그램</DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
            {projectName} 프로젝트의 테이블 구조를 시각화합니다
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">테이블 정보를 불러오는 중...</p>
            </div>
          ) : tablesWithColumns.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                <Network className="h-8 w-8 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">테이블이 없습니다</p>
            </div>
          ) : (
            <div ref={diagramRef} className="flex flex-wrap gap-6 justify-center">
              {tablesWithColumns.map((table) => (
                <div
                  key={table.id}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-xl hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 min-w-[280px] max-w-[360px] overflow-hidden"
                >
                  {/* 테이블 헤더 - 전문적인 스타일 */}
                  <div className="bg-slate-700 dark:bg-slate-800 text-white px-4 py-2 border-b-2 border-slate-800 dark:border-slate-900">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h3 className="font-bold text-base tracking-tight">{table.name}</h3>
                    </div>
                    {table.description && (
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">{table.description}</p>
                    )}
                  </div>
                  
                  {/* 컬럼 목록 - 데이터베이스 도구 스타일 */}
                  <div className="bg-white dark:bg-slate-800">
                    {table.columns
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((column, index) => (
                        <div
                          key={column.id}
                          className={`flex items-center gap-2 py-1.5 px-3 text-xs border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                            column.primaryKey 
                              ? 'bg-blue-50 dark:bg-blue-950/20' 
                              : index % 2 === 0 
                                ? 'bg-white dark:bg-slate-800' 
                                : 'bg-slate-50 dark:bg-slate-850'
                          }`}
                        >
                          {/* 아이콘 영역 */}
                          <div className="flex items-center gap-1 w-8 flex-shrink-0">
                            {column.primaryKey ? (
                              <svg className="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <div className="h-3.5 w-3.5 rounded-sm border border-slate-300 dark:border-slate-600"></div>
                            )}
                            {column.identity && (
                              <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          
                          {/* 컬럼명 */}
                          <div className="flex-1 min-w-0">
                            <div className={`font-mono font-semibold truncate ${
                              column.primaryKey 
                                ? 'text-slate-900 dark:text-slate-100' 
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {column.name}
                            </div>
                            {column.description && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {column.description}
                              </div>
                            )}
                          </div>
                          
                          {/* 데이터 타입 */}
                          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                            <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              {column.dataType}
                            </span>
                            {!column.nullable && (
                              <span className="text-[9px] font-medium text-red-600 dark:text-red-400">
                                NOT NULL
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {/* 테이블 푸터 - 통계 */}
                  <div className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                      {table.columns.filter(c => c.primaryKey).length > 0 && (
                        <span className="mr-2">
                          🔑 {table.columns.filter(c => c.primaryKey).length} PK
                        </span>
                      )}
                      {table.columns.length} columns
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">
                      {table.columns.filter(c => !c.nullable).length} required
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-slate-300 dark:border-slate-700"
          >
            닫기
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopy} 
            disabled={loading || tablesWithColumns.length === 0}
            className="gap-1.5 border-slate-300 dark:border-slate-700"
          >
            <Copy className="h-3.5 w-3.5" />
            복사
          </Button>
          <Button 
            size="sm"
            onClick={handleDownload} 
            disabled={loading || tablesWithColumns.length === 0}
            className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Download className="h-3.5 w-3.5" />
            스크린샷
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
