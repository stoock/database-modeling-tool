import React, { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { RelationshipEdgeData } from '../../types';

interface RelationshipLineProps extends EdgeProps<RelationshipEdgeData> {}

const RelationshipLine: React.FC<RelationshipLineProps> = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // 관계 타입에 따른 스타일 설정
  const getRelationshipStyle = () => {
    if (!data) return { stroke: '#6b7280', strokeWidth: 2 };
    
    switch (data.type) {
      case 'ONE_TO_ONE':
        return { 
          stroke: '#10b981', 
          strokeWidth: 2,
          strokeDasharray: '5,5'
        };
      case 'ONE_TO_MANY':
        return { 
          stroke: '#3b82f6', 
          strokeWidth: 2 
        };
      case 'MANY_TO_MANY':
        return { 
          stroke: '#f59e0b', 
          strokeWidth: 3,
          strokeDasharray: '10,5'
        };
      default:
        return { 
          stroke: '#6b7280', 
          strokeWidth: 2 
        };
    }
  };

  // 관계 타입 라벨 텍스트
  const getRelationshipLabel = () => {
    if (!data) return '';
    
    switch (data.type) {
      case 'ONE_TO_ONE':
        return '1:1';
      case 'ONE_TO_MANY':
        return '1:N';
      case 'MANY_TO_MANY':
        return 'N:M';
      default:
        return '';
    }
  };

  const relationshipStyle = getRelationshipStyle();
  const label = getRelationshipLabel();

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        stroke={relationshipStyle.stroke}
        strokeWidth={selected ? relationshipStyle.strokeWidth + 1 : relationshipStyle.strokeWidth}
        strokeDasharray={relationshipStyle.strokeDasharray}
        style={{
          filter: selected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : 'none',
        }}
      />
      
      {/* 화살표 마커 */}
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={relationshipStyle.stroke}
          />
        </marker>
      </defs>
      
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={relationshipStyle.strokeWidth}
        markerEnd={`url(#arrowhead-${id})`}
      />

      {/* 관계 타입 라벨 */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className={`
              px-2 py-1 text-xs font-medium rounded-full border-2 bg-white
              ${selected ? 'border-blue-500 text-blue-700' : 'border-gray-300 text-gray-600'}
            `}>
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

RelationshipLine.displayName = 'RelationshipLine';

export default RelationshipLine;