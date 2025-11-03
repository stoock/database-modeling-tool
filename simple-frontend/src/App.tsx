/**
 * 루트 애플리케이션 컴포넌트
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectListPage } from './pages/ProjectListPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectListPage />} />
          {/* TODO: 추가 라우트 구현 예정 */}
          {/* <Route path="/projects/:projectId" element={<ProjectDetailPage />} /> */}
          {/* <Route path="/projects/:projectId/tables/:tableId" element={<TableDetailPage />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
