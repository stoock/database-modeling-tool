import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useTableStore } from '@/stores/tableStore';
import { Button } from '@/components/ui/button';
import { TableList, TableDetail } from '@/components/tables';
import { ExportDialog } from '@/components/export';
import { ArrowLeft, Download } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { announceToScreenReader } from '@/utils/accessibility';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const { selectedProject, isLoading, fetchProjectById } = useProjectStore();
  const { tables, selectedTable, fetchTablesByProject, setSelectedTable } = useTableStore();

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* 프로젝트 정보 헤더 */}
      <header className="border-b bg-card" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                aria-label="프로젝트 목록으로 돌아가기 (단축키: Esc)"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
                {selectedProject.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProject.description}
                  </p>
                )}
                <p className="sr-only">
                  Ctrl+E를 눌러 스키마를 내보낼 수 있습니다
                </p>
              </div>
            </div>
            <Button 
              onClick={handleExport} 
              className="w-full sm:w-auto"
              aria-label="스키마 내보내기 (단축키: Ctrl+E)"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              스키마 내보내기
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 - 좌우 분할 레이아웃 */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden" id="main-content">
        {/* 좌측: 테이블 목록 영역 (30%) */}
        <aside 
          className="w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r bg-card overflow-y-auto"
          role="navigation"
          aria-label="테이블 목록"
        >
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
        </aside>

        {/* 우측: 테이블 상세 영역 (70%) */}
        <section 
          className="flex-1 overflow-y-auto bg-background"
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
              <div className="text-center py-12" role="status">
                <p className="text-muted-foreground">
                  테이블을 선택하여 상세 정보를 확인하세요
                </p>
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
