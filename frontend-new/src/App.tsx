import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { NetworkStatus } from '@/components/common/NetworkStatus';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          </Routes>
          <Toaster />
          <NetworkStatus />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
