import { useCallback, useMemo, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

import DatabaseSchemaNode from './DatabaseSchemaNode';
import type { DatabaseSchemaNodeData } from './DatabaseSchemaNode';
import type { Table, Column } from '@/types';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';

// 노드 타입 정의
const nodeTypes = {
  databaseSchema: DatabaseSchemaNode,
};

interface ERDCanvasProps {
  tables: Table[];
}

// 초기 노드 데이터 (전자상거래 시스템 예제) - 사용하지 않음
// const initialNodes: Node<DatabaseSchemaNodeData>[] = [
//   {
//     id: '1',
//     type: 'databaseSchema',
//     position: { x: 50, y: 50 },
//     data: {
//       label: 'User',
//       columns: [
//         { name: 'id', type: 'BIGINT', isPK: true, isNullable: false },
//         { name: 'username', type: 'NVARCHAR(50)', isUnique: true, isNullable: false },
//         { name: 'email', type: 'NVARCHAR(100)', isUnique: true, isNullable: false },
//         { name: 'password_hash', type: 'NVARCHAR(255)', isNullable: false },
//         { name: 'created_at', type: 'DATETIME2', isNullable: false },
//       ],
//     },
//   },
//   {
//     id: '2',
//     type: 'databaseSchema',
//     position: { x: 450, y: 50 },
//     data: {
//       label: 'Product',
//       columns: [
//         { name: 'id', type: 'BIGINT', isPK: true, isNullable: false },
//         { name: 'name', type: 'NVARCHAR(200)', isNullable: false },
//         { name: 'price', type: 'DECIMAL(10,2)', isNullable: false },
//         { name: 'stock', type: 'INT', isNullable: false },
//         { name: 'category_id', type: 'BIGINT', isFK: true, isNullable: true },
//       ],
//     },
//   },
//   {
//     id: '3',
//     type: 'databaseSchema',
//     position: { x: 850, y: 50 },
//     data: {
//       label: 'Category',
//       columns: [
//         { name: 'id', type: 'BIGINT', isPK: true, isNullable: false },
//         { name: 'name', type: 'NVARCHAR(100)', isUnique: true, isNullable: false },
//         { name: 'parent_id', type: 'BIGINT', isFK: true, isNullable: true },
//         { name: 'description', type: 'NVARCHAR(500)', isNullable: true },
//       ],
//     },
//   },
//   {
//     id: '4',
//     type: 'databaseSchema',
//     position: { x: 50, y: 400 },
//     data: {
//       label: 'Order',
//       columns: [
//         { name: 'id', type: 'BIGINT', isPK: true, isNullable: false },
//         { name: 'user_id', type: 'BIGINT', isFK: true, isNullable: false },
//         { name: 'total_amount', type: 'DECIMAL(10,2)', isNullable: false },
//         { name: 'status', type: 'NVARCHAR(20)', isNullable: false },
//         { name: 'created_at', type: 'DATETIME2', isNullable: false },
//       ],
//     },
//   },
//   {
//     id: '5',
//     type: 'databaseSchema',
//     position: { x: 450, y: 400 },
//     data: {
//       label: 'OrderItem',
//       columns: [
//         { name: 'id', type: 'BIGINT', isPK: true, isNullable: false },
//         { name: 'order_id', type: 'BIGINT', isFK: true, isNullable: false },
//         { name: 'product_id', type: 'BIGINT', isFK: true, isNullable: false },
//         { name: 'quantity', type: 'INT', isNullable: false },
//         { name: 'price', type: 'DECIMAL(10,2)', isNullable: false },
//       ],
//     },
//   },
//   {
//     id: '6',
//     type: 'databaseSchema',
//     position: { x: 850, y: 400 },
//     data: {
//       label: 'Review',
//       columns: [
//         { name: 'id', type: 'BIGINT', isPK: true, isNullable: false },
//         { name: 'user_id', type: 'BIGINT', isFK: true, isNullable: false },
//         { name: 'product_id', type: 'BIGINT', isFK: true, isNullable: false },
//         { name: 'rating', type: 'INT', isNullable: false },
//         { name: 'comment', type: 'NVARCHAR(1000)', isNullable: true },
//         { name: 'created_at', type: 'DATETIME2', isNullable: false },
//       ],
//     },
//   },
// ];

// 초기 엣지 데이터 (관계선) - 사용하지 않음
// const initialEdges: Edge[] = [
//   {
//     id: 'e1-4',
//     source: '1',
//     target: '4',
//     sourceHandle: 'id',
//     targetHandle: 'user_id',
//     type: 'smoothstep',
//     animated: true,
//     label: '1:N',
//     markerEnd: { type: MarkerType.ArrowClosed },
//     style: { stroke: '#667eea', strokeWidth: 2 },
//   },
//   {
//     id: 'e2-5',
//     source: '2',
//     target: '5',
//     sourceHandle: 'id',
//     targetHandle: 'product_id',
//     type: 'smoothstep',
//     animated: true,
//     label: '1:N',
//     markerEnd: { type: MarkerType.ArrowClosed },
//     style: { stroke: '#667eea', strokeWidth: 2 },
//   },
//   {
//     id: 'e3-2',
//     source: '3',
//     target: '2',
//     sourceHandle: 'id',
//     targetHandle: 'category_id',
//     type: 'smoothstep',
//     label: '1:N',
//     markerEnd: { type: MarkerType.ArrowClosed },
//     style: { stroke: '#667eea', strokeWidth: 2 },
//   },
//   {
//     id: 'e3-3',
//     source: '3',
//     target: '3',
//     sourceHandle: 'id',
//     targetHandle: 'parent_id',
//     type: 'smoothstep',
//     label: '자기참조',
//     markerEnd: { type: MarkerType.ArrowClosed },
//     style: { stroke: '#f59e0b', strokeWidth: 2 },
//   },
//   {
//     id: 'e4-5',
//     source: '4',
//     target: '5',
//     sourceHandle: 'id',
//     targetHandle: 'order_id',
//     type: 'smoothstep',
//     animated: true,
//     label: '1:N',
//     markerEnd: { type: MarkerType.ArrowClosed },
//     style: { stroke: '#667eea', strokeWidth: 2 },
//   },
//   {
//     id: 'e1-6',
//     source: '1',
//     target: '6',
//     sourceHandle: 'id',
//     targetHandle: 'user_id',
//     type: 'smoothstep',
//     label: '1:N',
//     markerEnd: { type: MarkerType.ArrowClosed },
//     style: { stroke: '#667eea', strokeWidth: 2 },
//   },
//   {
//     id: 'e2-6',
//     source: '2',
//     target: '6',
//     sourceHandle: 'id',
//     targetHandle: 'product_id',
//     type: 'smoothstep',
//     label: '1:N',
//     markerEnd: { type: MarkerType.ArrowClosed },
//     style: { stroke: '#667eea', strokeWidth: 2 },
//   },
// ];

// Dagre 레이아웃 설정
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 260;
const nodeHeight = 200;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  // const isHorizontal = direction === 'LR'; // 사용하지 않음
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * ERD Canvas 내부 컴포넌트
 */
function ERDCanvasInner({ tables }: ERDCanvasProps) {
  const [tableColumns, setTableColumns] = useState<Record<string, Column[]>>({});
  const [nodes, setNodes, onNodesChange] = useNodesState<DatabaseSchemaNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // 테이블별 컬럼 데이터 가져오기
  useEffect(() => {
    const fetchAllColumns = async () => {
      const columnsMap: Record<string, Column[]> = {};
      
      for (const table of tables) {
        try {
          const response = await apiClient.get<Column[]>(`/tables/${table.id}/columns`);
          columnsMap[table.id] = response.data.sort((a, b) => a.orderIndex - b.orderIndex);
        } catch (error) {
          console.error(`Failed to fetch columns for table ${table.id}:`, error);
          columnsMap[table.id] = [];
        }
      }
      
      setTableColumns(columnsMap);
    };

    if (tables.length > 0) {
      fetchAllColumns();
    }
  }, [tables]);

  // 테이블 데이터를 React Flow 노드로 변환
  useEffect(() => {
    if (Object.keys(tableColumns).length === 0) return;

    const newNodes: Node<DatabaseSchemaNodeData>[] = tables.map((table, index) => {
      const columns = tableColumns[table.id] || [];
      
      // 저장된 위치가 있으면 사용, 없으면 그리드 레이아웃
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = table.positionX ?? (col * 350 + 50);
      const y = table.positionY ?? (row * 350 + 50);

      return {
        id: table.id,
        type: 'databaseSchema',
        position: { x, y },
        data: {
          label: table.name,
          columns: columns.map(col => ({
            name: col.name,
            type: formatDataType(col),
            isPK: col.primaryKey,
            isFK: false, // TODO: FK 관계 파악
            isUnique: false, // TODO: Unique 제약조건 파악
            isNullable: col.nullable,
          })),
        },
      };
    });

    setNodes(newNodes);

    // TODO: 외래키 관계를 기반으로 엣지 생성
    const newEdges: Edge[] = [];
    setEdges(newEdges);
  }, [tables, tableColumns, setNodes, setEdges]);

  console.log('ERDCanvas rendered', { nodesCount: nodes.length, edgesCount: edges.length });

  // 새로운 연결 추가
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#667eea', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  // 노드 타입 메모이제이션
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // 자동 정렬 함수
  const onLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      window.requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 300 });
      });
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  // 데이터 타입 포맷팅
  function formatDataType(column: Column): string {
    let type = column.dataType;
    
    if (column.maxLength) {
      type += `(${column.maxLength})`;
    } else if (column.precision && column.scale !== undefined) {
      type += `(${column.precision},${column.scale})`;
    } else if (column.precision) {
      type += `(${column.precision})`;
    }
    
    return type;
  }

  if (!nodes || nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">테이블 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* 자동 정렬 버튼 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          onClick={() => onLayout('TB')}
          size="sm"
          variant="outline"
          className="bg-white shadow-md hover:bg-gray-50"
        >
          ⬇️ 세로 정렬
        </Button>
        <Button
          onClick={() => onLayout('LR')}
          size="sm"
          variant="outline"
          className="bg-white shadow-md hover:bg-gray-50"
        >
          ➡️ 가로 정렬
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={memoizedNodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#667eea', strokeWidth: 2 },
        }}
        className="bg-slate-50 dark:bg-slate-950"
      >
        {/* 컨트롤 패널 */}
        {/* 컨트롤 패널 */}
        <Controls className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg" />

        {/* 미니맵 */}
        <MiniMap
          nodeColor={() => '#3b82f6'}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg"
        />

        {/* 배경 그리드 */}
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e0" />
      </ReactFlow>
    </div>
  );
}

/**
 * ERD Canvas - ReactFlowProvider로 감싼 메인 컴포넌트
 */
export default function ERDCanvas(props: ERDCanvasProps) {
  return (
    <ReactFlowProvider>
      <ERDCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
