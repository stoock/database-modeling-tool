import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { NetworkStatus } from '@/components/common/NetworkStatus';
import { KeyboardShortcutsHelp } from '@/components/common/KeyboardShortcutsHelp';
import { useServerHealth } from '@/hooks/useServerHealth';
import { Loader2 } from 'lucide-react';

// 코드 스플리팅 - React.lazy로 페이지 컴포넌트 지연 로딩
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));
const ERDPage = lazy(() => import('@/pages/ERDPage'));

// 로딩 컴포넌트
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">페이지를 불러오는 중...</p>
      </div>
    </div>
  );
}

function App() {
  // 서버 헬스 체크 (1분마다)
  useServerHealth({
    enabled: true,
    interval: 60000,
    showToast: true,
  });

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* 스킵 링크 - 메인 콘텐츠로 바로가기 */}
        <a href="#main-content" className="skip-link">
          메인 콘텐츠로 바로가기
        </a>
        
        <div className="min-h-screen bg-background">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/projects/:projectId/erd" element={<ERDPage />} />
            </Routes>
          </Suspense>
          <Toaster />
          <NetworkStatus />
          <KeyboardShortcutsHelp />
        </div>

        {/* 라이브 리전 - 스크린 리더 알림용 */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="aria-live-region"
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
