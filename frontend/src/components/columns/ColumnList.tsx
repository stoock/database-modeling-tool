import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';
import { InlineColumnRow } from './InlineColumnRow';
import { CreateColumnDialog } from './CreateColumnDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { Column } from '@/types';
import { reorderColumns } from '@/lib/api';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface ColumnListProps {
  tableId: string;
  tableName: string;
  columns: Column[];
  onColumnCreated: () => void;
  onColumnUpdated: () => void;
  onColumnDeleted: () => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (column: Column) => void;
}

function ColumnListComponent({
  tableId,
  tableName,
  columns,
  onColumnCreated,
  onColumnUpdated,
  onEditColumn,
  onDeleteColumn,
}: ColumnListProps) {
  const [isReordering, setIsReordering] = useState(false);
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInlineAdding, setIsInlineAdding] = useState(false);

  // 컬럼이 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  // 드래그 앤 드롭 센서 설정 - useMemo로 캐싱
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러를 useCallback으로 메모이제이션
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localColumns.findIndex((col) => col.id === active.id);
    const newIndex = localColumns.findIndex((col) => col.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 로컬 상태 즉시 업데이트 (낙관적 업데이트)
    const newColumns = arrayMove(localColumns, oldIndex, newIndex);
    setLocalColumns(newColumns);

    // 서버에 순서 변경 요청
    setIsReordering(true);
    try {
      const updates = newColumns.map((col, index) => ({
        columnId: col.id,
        orderIndex: index + 1, // 1부터 시작
      }));
      await reorderColumns(tableId, { updates });
      onColumnUpdated();
    } catch (error) {
      // 에러 발생 시 원래 순서로 복원
      setLocalColumns(columns);
      console.error('컬럼 순서 변경 실패:', error);
    } finally {
      setIsReordering(false);
    }
  }, [localColumns, tableId, columns, onColumnUpdated]);

  // orderIndex로 정렬된 컬럼 목록을 useMemo로 캐싱
  const sortedColumns = useMemo(() => 
    [...localColumns].sort((a, b) => a.orderIndex - b.orderIndex),
    [localColumns]
  );

  // 다음 orderIndex 계산을 useMemo로 캐싱 (백엔드는 1부터 시작)
  const nextOrderIndex = useMemo(() => 
    sortedColumns.length > 0
      ? Math.max(...sortedColumns.map(col => col.orderIndex)) + 1
      : 1,
    [sortedColumns]
  );

  // 이벤트 핸들러를 useCallback으로 메모이제이션
  const handleColumnCreated = useCallback(() => {
    onColumnCreated();
    setIsCreateDialogOpen(false);
  }, [onColumnCreated]);

  const handleOpenCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleStartInlineAdd = useCallback(() => {
    setIsInlineAdding(true);
  }, []);

  const handleInlineAddSuccess = useCallback(() => {
    setIsInlineAdding(false);
    onColumnCreated();
  }, [onColumnCreated]);

  const handleInlineAddCancel = useCallback(() => {
    setIsInlineAdding(false);
  }, []);

  // 키보드 단축키 설정
  useKeyboardShortcuts([
    {
      key: 'q',
      ctrl: true,
      handler: handleStartInlineAdd,
      description: '빠른 컬럼 추가',
    },
    {
      key: 'd',
      ctrl: true,
      handler: handleOpenCreateDialog,
      description: '상세 컬럼 추가',
    },
  ]);

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">컬럼 목록</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleStartInlineAdd} 
            size="sm"
            variant="outline"
            disabled={isInlineAdding}
            title="빠른 추가 (Ctrl+Q)"
          >
            <Plus className="h-4 w-4 mr-2" />
            빠른 추가
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border">
              Ctrl+Q
            </kbd>
          </Button>
          <Button 
            onClick={handleOpenCreateDialog} 
            size="sm"
            title="상세 추가 (Ctrl+D)"
          >
            <Plus className="h-4 w-4 mr-2" />
            상세 추가
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white/90 text-gray-700 rounded border border-gray-300">
              Ctrl+D
            </kbd>
          </Button>
        </div>
      </div>

      {/* 컬럼이 없는 경우 */}
      {sortedColumns.length === 0 && !isInlineAdding ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">컬럼이 없습니다</p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleStartInlineAdd} 
              variant="outline"
              title="빠른 추가 (Ctrl+Q)"
            >
              <Plus className="h-4 w-4 mr-2" />
              빠른 추가 (Ctrl+Q)
            </Button>
            <Button 
              onClick={handleOpenCreateDialog}
              title="상세 추가 (Ctrl+D)"
            >
              <Plus className="h-4 w-4 mr-2" />
              상세 추가 (Ctrl+D)
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 로딩 오버레이 */}
          {isReordering && (
            <div className="flex items-center justify-center py-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              순서 변경 중...
            </div>
          )}

          {/* 테이블 헤더 */}
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      순서
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      컬럼명
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      한글명
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      데이터 타입
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      기본값
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      NULL
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      PK
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      IDENTITY
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={sortedColumns.map((col) => col.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedColumns.map((column, index) => (
                      <SortableRow
                        key={column.id}
                        column={column}
                        index={index}
                        onEdit={() => onEditColumn(column)}
                        onDelete={() => onDeleteColumn(column)}
                      />
                    ))}
                  </SortableContext>
                  
                  {/* 인라인 추가 행 */}
                  {isInlineAdding && (
                    <InlineColumnRow
                      tableId={tableId}
                      nextOrderIndex={nextOrderIndex}
                      onSuccess={handleInlineAddSuccess}
                      onCancel={handleInlineAddCancel}
                    />
                  )}
                </tbody>
              </table>
            </DndContext>
          </div>

          {/* 빠른 추가 버튼 (테이블 하단) */}
          {!isInlineAdding && (
            <Button
              onClick={handleStartInlineAdd}
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-gray-500 hover:text-gray-700 border-2 border-dashed"
              title="빠른 추가 (Ctrl+Q)"
            >
              <Plus className="h-4 w-4 mr-2" />
              빠른 추가 (Ctrl+Q)
            </Button>
          )}

          {/* 안내 메시지 */}
          <p className="text-xs text-gray-500 mt-2">
            💡 컬럼을 드래그하여 순서를 변경할 수 있습니다
          </p>
        </>
      )}

      {/* 컬럼 생성 다이얼로그 */}
      <CreateColumnDialog
        tableId={tableId}
        tableName={tableName}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleColumnCreated}
        nextOrderIndex={nextOrderIndex}
      />
    </div>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const ColumnList = memo(ColumnListComponent);
