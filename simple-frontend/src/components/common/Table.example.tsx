/**
 * Table 컴포넌트 사용 예제
 * 이 파일은 개발 참고용이며 실제 빌드에는 포함되지 않습니다.
 */

import React from 'react';
import { Table } from './Table';
import type { ColumnDef } from './Table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const TableExample: React.FC = () => {
  const users: User[] = [
    { id: 1, name: '홍길동', email: 'hong@example.com', role: '관리자' },
    { id: 2, name: '김철수', email: 'kim@example.com', role: '사용자' },
    { id: 3, name: '이영희', email: 'lee@example.com', role: '사용자' },
  ];

  const columns: ColumnDef<User>[] = [
    {
      header: 'ID',
      accessor: 'id',
      width: '80px',
    },
    {
      header: '이름',
      accessor: 'name',
    },
    {
      header: '이메일',
      accessor: 'email',
    },
    {
      header: '역할',
      accessor: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.role === '관리자' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
        }`}>
          {row.role}
        </span>
      ),
    },
  ];

  const handleRowClick = (user: User) => {
    console.log('클릭된 사용자:', user);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">테이블 컴포넌트 예제</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">기본 테이블</h3>
        <Table
          columns={columns}
          data={users}
          onRowClick={handleRowClick}
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">로딩 상태</h3>
        <Table
          columns={columns}
          data={[]}
          loading={true}
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">빈 데이터</h3>
        <Table
          columns={columns}
          data={[]}
          emptyMessage="등록된 사용자가 없습니다."
        />
      </div>
    </div>
  );
};
