import React from 'react';
import type { Project } from '../../types';

interface DashboardLayoutProps {
  currentProject: Project | null;
  children: React.ReactNode;
  header: React.ReactNode;
  sidebar?: React.ReactNode;
}

/**
 * 대시보드 전체 레이아웃 컨테이너
 * - 헤더, 메인 콘텐츠, 사이드바 영역 구성
 * - 반응형 레이아웃 지원
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentProject,
  children,
  header,
  sidebar
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 영역 */}
      <header className="bg-white shadow-sm border-b">
        {header}
      </header>
      
      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentProject ? (
          <div className={`grid gap-6 ${sidebar ? 'grid-cols-1 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {/* 메인 콘텐츠 */}
            <div className={sidebar ? 'xl:col-span-3 space-y-6' : 'space-y-6'}>
              {children}
            </div>

            {/* 사이드바 */}
            {sidebar && (
              <div className="xl:col-span-1">
                <div className="sticky top-8">
                  {sidebar}
                </div>
              </div>
            )}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;