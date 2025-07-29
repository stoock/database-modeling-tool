import React from 'react';
import { DashboardMain } from './components/Dashboard';
import './App.css';

/**
 * 메인 App 컴포넌트
 * - DashboardMain으로 모든 로직을 위임
 * - 라우팅 및 전체 애플리케이션 상태 관리
 */
function App() {
  return <DashboardMain />;
}

export default App;