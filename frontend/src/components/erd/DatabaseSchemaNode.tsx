import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export interface Column {
  name: string;
  type: string;
  isPK?: boolean;
  isFK?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
}

export interface DatabaseSchemaNodeData {
  label: string;
  columns: Column[];
}

/**
 * Database Schema Node - ERD 테이블 노드 컴포넌트
 * React Flow 공식 예제 기반
 */
const DatabaseSchemaNode = memo(({ data, selected }: NodeProps<DatabaseSchemaNodeData>) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden min-w-[240px] max-w-[280px]
        border-2 transition-all
        ${selected ? 'border-purple-500 shadow-purple-200' : 'border-blue-500'}
      `}
    >
      {/* 테이블 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 font-semibold text-xs flex items-center gap-2">
        <span className="text-sm">📊</span>
        <span>{data.label}</span>
      </div>

      {/* 컬럼 목록 */}
      <table className="w-full">
        <tbody>
          {data.columns.map((column, index) => {
            const handleId = `${column.name}`;
            const topPosition = ((index + 1) / (data.columns.length + 1)) * 100;

            return (
              <tr
                key={column.name}
                className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                {/* 컬럼명 */}
                <td className="px-2 py-1.5 text-xs font-medium text-gray-800 relative">
                  {/* Left Handle (Target) */}
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={handleId}
                    className="!w-1.5 !h-1.5 !bg-purple-500 !border !border-white"
                    style={{ top: `${topPosition}%` }}
                  />
                  
                  <div className="flex items-center gap-1.5">
                    {/* 아이콘 */}
                    <span className="text-[10px]">
                      {column.isPK ? '🔑' : column.isFK ? '🔗' : column.isUnique ? '⭐' : '📝'}
                    </span>
                    <span className="truncate">{column.name}</span>
                  </div>
                </td>

                {/* 데이터 타입 */}
                <td className="px-2 py-1.5 text-xs text-gray-600 text-right relative">
                  <div className="flex items-center justify-end gap-1">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[100px]">
                      {column.type}
                    </span>
                    {!column.isNullable && (
                      <span className="text-[9px] text-red-500 font-semibold whitespace-nowrap">NOT NULL</span>
                    )}
                  </div>

                  {/* Right Handle (Source) */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={handleId}
                    className="!w-1.5 !h-1.5 !bg-blue-500 !border !border-white"
                    style={{ top: `${topPosition}%` }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

DatabaseSchemaNode.displayName = 'DatabaseSchemaNode';

export default DatabaseSchemaNode;
