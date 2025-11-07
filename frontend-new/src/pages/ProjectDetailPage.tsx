import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useTableStore } from '@/stores/tableStore';
import { Button } from '@/components/ui/button';
import { TableList, TableDetail } from '@/components/tables';
import { ExportDialog } from '@/components/export';
import { ArrowLeft, Download, Network, ChevronLeft, ChevronRight } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { announceToScreenReader } from '@/utils/accessibility';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(20); // 사이드바 폭 (%)
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // 사이드바 최소화 상태
  
  const { selectedProject, isLoading, fetchProjectById } = useProjectStore();
  const { tables, selectedTable, fetchTablesByProject, setSelectedTable } = useTableStore();

  // 사이드바 토글
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    announceToScreenReader(isCollapsed ? '테이블 목록 펼침' : '테이블 목록 접음');
  };

  // 리사이저 마우스 다운 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCollapsed) return; // 최소화 상태에서는 리사이즈 불가
    
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercent, 12), 35);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 키보드 단축키 설정
  useKeyboardShortcuts([
    {
      key: 'e',
      ctrl: true,
      handler: () => {
        setExportDialogOpen(true);
        announceToScreenReader('스키마 내보내기 다이얼로그 열림');
      },
      description: '스키마 내보내기',
    },
    {
      key: 'Escape',
      handler: () => {
        if (!exportDialogOpen) {
          handleBack();
        }
      },
      description: '프로젝트 목록으로 돌아가기',
    },
  ]);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchTablesByProject(projectId);
    }
  }, [projectId, fetchProjectById, fetchTablesByProject]);

  const handleBack = () => {
    navigate('/projects');
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setSelectedTable(table);
    }
  };

  const handleTableCreated = () => {
    if (projectId) {
      fetchTablesByProject(projectId);
    }
  };

  const handleTableDeleted = () => {
    setSelectedTableId(null);
    setSelectedTable(null);
    if (projectId) {
      fetchTablesByProject(projectId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-muted-foreground">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="alert">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">프로젝트를 찾을 수 없습니다</p>
          <Button onClick={handleBack} aria-label="프로젝트 목록으로 돌아가기">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            프로젝트 목록으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* 프로젝트 정보 헤더 - 모던한 그라데이션 */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm" role="banner">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                aria-label="프로젝트 목록으로 돌아가기 (단축키: Esc)"
                className="h-9 w-9 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{selectedProject.name}</h1>
                {selectedProject.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {selectedProject.description}
                  </p>
                )}
                <p className="sr-only">
                  Ctrl+E를 눌러 스키마를 내보낼 수 있습니다
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/projects/${projectId}/erd`)} 
                size="sm"
                className="gap-1.5 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="ERD 다이어그램 보기"
              >
                <Network className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">ERD</span>
              </Button>
              <Button 
                onClick={handleExport}
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                aria-label="스키마 내보내기 (단축키: Ctrl+E)"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">내보내기</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 - 좌우 분할 레이아웃 (리사이저블) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden" id="main-content">
        {/* 좌측: 테이블 목록 영역 (리사이저블, 최소 12%, 최대 35%) */}
        <aside 
          className={`border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto transition-all duration-300 ${
            isCollapsed ? 'lg:w-12' : ''
          }`}
          style={!isCollapsed ? { 
            width: `${sidebarWidth}%`,
            minWidth: '12%',
            maxWidth: '35%',
          } : undefined}
          role="navigation"
          aria-label="테이블 목록"
        >
          {isCollapsed ? (
            // 최소화 상태: 토글 버튼만 표시
            <div className="h-full flex items-start justify-center pt-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="테이블 목록 펼치기"
                className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // 펼침 상태: 테이블 목록 표시
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
                <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tables</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  aria-label="테이블 목록 접기"
                  className="h-7 w-7 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              </div>
              {projectId && (
                <TableList
                  projectId={projectId}
                  tables={tables}
                  selectedTableId={selectedTableId}
                  onSelectTable={handleSelectTable}
                  onTableCreated={handleTableCreated}
                  onTableDeleted={handleTableDeleted}
                />
              )}
            </>
          )}
        </aside>

        {/* 리사이저 (최소화 상태에서는 숨김) */}
        {!isCollapsed && (
          <div
            className={`hidden lg:block w-0.5 cursor-col-resize transition-all ${
              isResizing 
                ? 'bg-gradient-to-b from-blue-500 to-indigo-500 w-1' 
                : 'bg-slate-200 dark:bg-slate-800 hover:bg-gradient-to-b hover:from-blue-400 hover:to-indigo-400 hover:w-1'
            }`}
            onMouseDown={handleMouseDown}
            role="separator"
            aria-label="사이드바 크기 조절"
          />
        )}

        {/* 우측: 테이블 상세 영역 */}
        <section 
          className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950"
          role="main"
          aria-label="테이블 상세 정보"
        >
          <div className="p-4 lg:p-6">
            {selectedTable ? (
              <TableDetail
                table={selectedTable}
                onUpdate={handleTableCreated}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]" role="status">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Network className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    테이블을 선택하여 상세 정보를 확인하세요
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    좌측 목록에서 테이블을 클릭하거나 새로 생성하세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* SQL 스키마 내보내기 다이얼로그 */}
      {projectId && selectedProject && (
        <ExportDialog
          projectId={projectId}
          projectName={selectedProject.name}
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
        />
      )}
    </div>
  );
}
