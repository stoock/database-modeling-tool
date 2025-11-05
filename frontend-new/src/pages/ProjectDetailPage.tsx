import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useTableStore } from '@/stores/tableStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const { selectedProject, isLoading, fetchProjectById } = useProjectStore();
  const { tables, fetchTablesByProject } = useTableStore();

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
    // TODO: 내보내기 기능 구현 (Task 18)
    console.log('Export schema');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">프로젝트를 찾을 수 없습니다</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            프로젝트 목록으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 프로젝트 정보 헤더 */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                aria-label="프로젝트 목록으로 돌아가기"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
                {selectedProject.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProject.description}
                  </p>
                )}
              </div>
            </div>
            <Button onClick={handleExport} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              스키마 내보내기
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 - 좌우 분할 레이아웃 */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 좌측: 테이블 목록 영역 (30%) */}
        <aside className="w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r bg-card overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">테이블 목록</h2>
              <Button size="sm" variant="outline">
                테이블 추가
              </Button>
            </div>
            
            {tables.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  아직 테이블이 없습니다
                </p>
                <p className="text-sm text-muted-foreground">
                  테이블 추가 버튼을 클릭하여 시작하세요
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="p-3 rounded-lg border bg-background hover:bg-accent cursor-pointer transition-colors"
                  >
                    <h3 className="font-medium">{table.name}</h3>
                    {table.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {table.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* 우측: 테이블 상세 영역 (70%) */}
        <section className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 lg:p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                테이블을 선택하여 상세 정보를 확인하세요
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
