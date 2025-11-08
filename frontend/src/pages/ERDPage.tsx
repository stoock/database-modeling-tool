import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useTableStore } from '@/stores/tableStore';
import ERDCanvas from '../components/erd/ERDCanvas';

/**
 * ERD Page - React Flow 기반 ERD 다이어그램 페이지
 */
export default function ERDPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  
  const { selectedProject, fetchProjectById } = useProjectStore();
  const { tables, fetchTablesByProject } = useTableStore();

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchTablesByProject(projectId);
    }
  }, [projectId, fetchProjectById, fetchTablesByProject]);

  const handleBack = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* 헤더 - 기존 UI와 일관성 유지 */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm" role="banner">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="이전 페이지로 돌아가기"
              className="h-9 w-9 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {selectedProject?.name || 'ERD 다이어그램'}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {tables.length}개의 테이블 구조와 관계를 시각적으로 확인하세요
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ERD 캔버스 - 전체 화면 */}
      <main className="flex-1 min-h-0" id="main-content">
        {tables.length > 0 ? (
          <ERDCanvas tables={tables} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-2">테이블이 없습니다</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                프로젝트에 테이블을 추가한 후 ERD를 확인하세요
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
