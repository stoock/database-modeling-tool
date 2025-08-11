import React, { useCallback, useEffect, useMemo, useState, memo } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  Panel,
} from 'reactflow';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { useChangeTracker } from '../../utils/changeTracker';

import { useTableStore } from '../../stores/tableStore';
import { useProjectStore } from '../../stores/projectStore';
import type { Table, TableNodeData } from '../../types';
import TableNode from './TableNode';
import RelationshipLine from './RelationshipLine';
import TableEditModal from './TableEditModal';
import ColumnAddModal from './ColumnAddModal';
import IndexManageModal from './IndexManageModal';
import Button from '../common/Button';

interface TableCanvasProps {
  className?: string;
}

const TableCanvas: React.FC<TableCanvasProps> = memo(({ className = '' }) => {
  // 커스텀 노드 및 엣지 타입 등록 (메모이제이션으로 재생성 방지)
  const nodeTypes = useMemo(() => ({
    tableNode: TableNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    relationshipEdge: RelationshipLine,
  }), []);
  const { 
    tables, 
    selectedTable, 
    setSelectedTable, 
    updateTablePosition,
    loadTables,
    createTable,
    error: tableError,
    clearError: clearTableError
  } = useTableStore();
  
  const { 
    currentProject,
    error: projectError 
  } = useProjectStore();
  
  const changeTracker = useChangeTracker();

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // 모달 상태
  const [tableEditModal, setTableEditModal] = useState<{
    isOpen: boolean;
    table: Table | null;
  }>({ isOpen: false, table: null });

  const [columnAddModal, setColumnAddModal] = useState<{
    isOpen: boolean;
    tableId: string | null;
  }>({ isOpen: false, tableId: null });

  const [indexManageModal, setIndexManageModal] = useState<{
    isOpen: boolean;
    tableId: string | null;
  }>({ isOpen: false, tableId: null });

  // 테이블 데이터를 React Flow 노드로 변환 (메모이제이션)
  const convertTablesToNodes = useMemo((): Node<TableNodeData>[] => {
    // tables가 undefined이거나 배열이 아닌 경우 빈 배열 반환
    if (!tables || !Array.isArray(tables)) {
      return [];
    }

    return tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      position: { x: table.positionX, y: table.positionY },
      data: {
        table,
        isSelected: selectedTable?.id === table.id,
      },
      draggable: true,
      selectable: true,
    }));
  }, [tables, selectedTable]);

  // 테이블 관계를 React Flow 엣지로 변환 (메모이제이션)
  const convertRelationshipsToEdges = useMemo((): Edge[] => {
    const edges: Edge[] = [];
    
    // tables가 undefined이거나 배열이 아닌 경우 빈 배열 반환
    if (!tables || !Array.isArray(tables) || tables.length < 2) {
      return edges;
    }
    
    // 현재는 예시 관계만 표시 (실제로는 외래키 관계를 기반으로 구현)
    // 향후 외래키 관계 구현 시 실제 관계 데이터로 대체
    
    try {
      // 예시 관계 (첫 번째 테이블과 두 번째 테이블 사이)
      const firstTable = tables[0];
      const secondTable = tables[1];
      
      // 테이블과 컬럼이 모두 존재하는지 확인
      if (firstTable && secondTable && 
          firstTable.columns && Array.isArray(firstTable.columns) && firstTable.columns.length > 0 &&
          secondTable.columns && Array.isArray(secondTable.columns) && secondTable.columns.length > 0) {
        edges.push({
          id: `${firstTable.id}-${secondTable.id}`,
          source: firstTable.id,
          target: secondTable.id,
          type: 'relationshipEdge',
          data: {
            sourceColumnId: firstTable.columns[0].id,
            targetColumnId: secondTable.columns[0].id,
            type: 'ONE_TO_MANY'
          },
          animated: false,
        });
      }
    } catch (error) {
      console.warn('테이블 관계 변환 중 오류:', error);
    }
    
    return edges;
  }, [tables]);

  // 테이블 데이터가 변경될 때 노드 업데이트
  useEffect(() => {
    const newNodes = convertTablesToNodes;
    const newEdges = convertRelationshipsToEdges;
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [tables, selectedTable, convertTablesToNodes, convertRelationshipsToEdges, setNodes, setEdges]);

  // 프로젝트가 변경될 때 테이블 로드
  useEffect(() => {
    if (currentProject?.id) {
      loadTables(currentProject.id);
    }
  }, [currentProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 노드 변경 처리 (드래그 등)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // 위치 변경 감지 및 서버 업데이트
      changes.forEach(async (change) => {
        if (change.type === 'position' && change.position && change.dragging === false) {
          try {
            console.log(`테이블 위치 저장 중: ${change.id} → (${change.position.x}, ${change.position.y})`);
            
            // 드래그가 끝났을 때만 서버에 위치 업데이트
            await updateTablePosition(change.id, change.position.x, change.position.y);
            
            console.log(`테이블 위치 저장 완료: ${change.id}`);
            
            // 변경사항 추적
            changeTracker.trackChange('table', change.id);
          } catch (error) {
            console.error(`테이블 위치 저장 실패: ${change.id}`, error);
            // 토스트로 사용자에게 알림 (옵션)
            // showToast?.('테이블 위치 저장에 실패했습니다.', 'error');
          }
        }
      });

      // React Flow 상태 업데이트
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [updateTablePosition, setNodes, changeTracker]
  );

  // 엣지 변경 처리
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  // 연결 생성 처리 (향후 관계 설정 시 사용)
  const onConnect = useCallback(
    (params: Connection) => {
      // 향후 테이블 간 관계 설정 구현
      console.log('Connection created:', params);
    },
    []
  );

  // 노드 선택 처리
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<TableNodeData>) => {
      event.stopPropagation();
      setSelectedTable(node.data.table);
    },
    [setSelectedTable]
  );

  // 캔버스 클릭 처리 (선택 해제)
  const onPaneClick = useCallback(() => {
    setSelectedTable(null);
  }, [setSelectedTable]);

  // 새 테이블 추가 버튼 클릭
  const handleAddTable = useCallback(() => {
    setTableEditModal({ isOpen: true, table: null });
  }, []);

  // 테이블 복제 처리
  const handleDuplicateTable = useCallback((sourceTable: Table) => {
    if (!currentProject) return;
    
    // 새 테이블 위치 계산 (약간 오른쪽 아래로 이동)
    const newPositionX = sourceTable.positionX + 50;
    const newPositionY = sourceTable.positionY + 50;
    
    // 새 테이블 이름 생성 (Copy 접미사 추가)
    const newName = `${sourceTable.name}_Copy`;
    
    // 새 테이블 생성
    createTable(currentProject.id, {
      name: newName,
      description: sourceTable.description,
      positionX: newPositionX,
      positionY: newPositionY
    }).then(newTable => {
      if (newTable) {
        // 테이블이 생성되면 컬럼과 인덱스도 복제하는 로직을 추가할 수 있음
        // 현재는 빈 테이블만 복제
        setSelectedTable(newTable);
      }
    });
  }, [currentProject, createTable, setSelectedTable]);

  // 커스텀 이벤트 리스너 설정
  useEffect(() => {
    const handleEditTable = (event: CustomEvent) => {
      const { table } = event.detail;
      setTableEditModal({ isOpen: true, table });
    };

    const handleAddColumn = (event: CustomEvent) => {
      const { tableId } = event.detail;
      setColumnAddModal({ isOpen: true, tableId });
    };

    const handleManageIndexes = (event: CustomEvent) => {
      const { tableId } = event.detail;
      setIndexManageModal({ isOpen: true, tableId });
    };

    const handleAddTableFromCanvas = () => {
      setTableEditModal({ isOpen: true, table: null });
    };
    
    const handleDuplicateTableEvent = (event: CustomEvent) => {
      const { table } = event.detail;
      handleDuplicateTable(table);
    };

    window.addEventListener('editTable', handleEditTable as EventListener);
    window.addEventListener('addColumn', handleAddColumn as EventListener);
    window.addEventListener('manageIndexes', handleManageIndexes as EventListener);
    window.addEventListener('addTable', handleAddTableFromCanvas as EventListener);
    window.addEventListener('duplicateTable', handleDuplicateTableEvent as EventListener);

    return () => {
      window.removeEventListener('editTable', handleEditTable as EventListener);
      window.removeEventListener('addColumn', handleAddColumn as EventListener);
      window.removeEventListener('manageIndexes', handleManageIndexes as EventListener);
      window.removeEventListener('addTable', handleAddTableFromCanvas as EventListener);
      window.removeEventListener('duplicateTable', handleDuplicateTableEvent as EventListener);
    };
  }, [handleDuplicateTable]);

  // 에러 표시
  const errorMessage = tableError || projectError;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {errorMessage && (
        <div className="absolute top-4 left-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center justify-between">
            <span>{errorMessage}</span>
            <Button
              onClick={clearTableError}
              variant="ghost"
              size="sm"
              className="ml-4 text-red-500 hover:text-red-700 p-1"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[15, 15]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
        panOnScroll={true}
        panOnScrollSpeed={0.5}
        zoomOnScroll={true}
        zoomOnPinch={true}
        className="bg-gray-50"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e5e7eb"
        />
        
        <Controls 
          position="bottom-right"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        
        <MiniMap 
          position="bottom-left"
          nodeColor={(node) => {
            if (node.data?.isSelected) return '#3b82f6';
            return '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
          }}
        />

        <Panel position="top-left">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                테이블 설계
              </h3>
              <span className="text-xs text-gray-500">
                {tables.length}개 테이블
              </span>
            </div>
            
            <Button
              onClick={handleAddTable}
              disabled={!currentProject}
              variant="primary"
              size="md"
              className="w-full"
            >
              + 새 테이블 추가
            </Button>
            
            {selectedTable && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">선택된 테이블:</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedTable.name}
                </p>
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>

      {/* 모달들 */}
      <TableEditModal
        isOpen={tableEditModal.isOpen}
        onClose={() => setTableEditModal({ isOpen: false, table: null })}
        table={tableEditModal.table}
      />

      <ColumnAddModal
        isOpen={columnAddModal.isOpen}
        onClose={() => setColumnAddModal({ isOpen: false, tableId: null })}
        tableId={columnAddModal.tableId}
      />

      <IndexManageModal
        isOpen={indexManageModal.isOpen}
        onClose={() => setIndexManageModal({ isOpen: false, tableId: null })}
        tableId={indexManageModal.tableId}
      />
    </div>
  );
});

TableCanvas.displayName = 'TableCanvas';

export default TableCanvas;