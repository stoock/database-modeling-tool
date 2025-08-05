// React import 현재 미사용
// import React from 'react';
import ColumnManagerTest from './components/ColumnEditor/ColumnManagerTest';
import './index.css';

function TestApp() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              컬럼 관리 기능 테스트
            </h1>
            <p className="mt-2 text-gray-600">
              드래그앤드롭, 편집, 복사, 삭제 등의 기능을 테스트해보세요
            </p>
          </div>
          
          <ColumnManagerTest />
        </div>
      </div>
    </div>
  );
}

export default TestApp;