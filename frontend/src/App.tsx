import { DashboardMain } from './components/Dashboard';
import { ToastContainer } from './components/common';
import './App.css';

/**
 * 메인 App 컴포넌트
 * - DashboardMain으로 모든 로직을 위임
 * - 라우팅 및 전체 애플리케이션 상태 관리
 * - 전역 토스트 알림 시스템 제공
 */
function App() {
  return (
    <>
      <DashboardMain />
      <ToastContainer />
    </>
  );
}

export default App;