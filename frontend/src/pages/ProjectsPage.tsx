import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/projectStore';
import ProjectCard from '@/components/projects/ProjectCard';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';
import DeleteProjectDialog from '@/components/projects/DeleteProjectDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { announceToScreenReader } from '@/utils/accessibility';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects } = useProjectStore();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // 키보드 단축키 설정
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      handler: () => {
        setCreateDialogOpen(true);
        announceToScreenReader('새 프로젝트 생성 다이얼로그 열림');
      },
      description: '새 프로젝트 생성',
    },
  ]);

  // 컴포넌트 마운트 시 프로젝트 목록 조회
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 프로젝트 선택 시 상세 페이지로 이동
  const handleSelectProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  // 프로젝트 삭제 다이얼로그 열기
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  // 프로젝트 생성 성공 시
  const handleCreateSuccess = () => {
    fetchProjects();
  };

  // 프로젝트 삭제 성공 시
  const handleDeleteSuccess = () => {
    setProjectToDelete(null);
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6" id="main-content">
        {/* 헤더 - 모던한 디자인 */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">프로젝트</h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              데이터베이스 모델링 프로젝트를 관리합니다
            </p>
            <p className="sr-only">
              Ctrl+N을 눌러 새 프로젝트를 생성할 수 있습니다
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20"
            aria-label="새 프로젝트 생성 (단축키: Ctrl+N)"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            새 프로젝트
          </Button>
        </header>

        {/* 로딩 상태 */}
        {isLoading && (
          <div 
            className="flex items-center justify-center py-12"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" aria-hidden="true" />
            <span className="ml-3 text-muted-foreground">프로젝트 목록을 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div 
            className="rounded-lg border border-red-200 bg-red-50 p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => fetchProjects()}
              aria-label="프로젝트 목록 다시 불러오기"
            >
              다시 시도
            </Button>
          </div>
        )}

        {/* 프로젝트 목록 */}
        {!isLoading && !error && (
          <main>
            {projects.length === 0 ? (
              <div 
                className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center"
                role="region"
                aria-label="빈 프로젝트 목록"
              >
                <div className="mx-auto max-w-md">
                  <h2 className="text-lg font-semibold text-gray-900">
                    프로젝트가 없습니다
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    새 프로젝트를 생성하여 데이터베이스 모델링을 시작하세요
                  </p>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="mt-6 gap-2"
                    aria-label="첫 프로젝트 만들기"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    첫 프로젝트 만들기
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
                aria-label={`프로젝트 목록 (총 ${projects.length}개)`}
              >
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={handleSelectProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </main>
        )}
      </div>

      {/* 프로젝트 생성 다이얼로그 */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* 프로젝트 삭제 다이얼로그 */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={projectToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
