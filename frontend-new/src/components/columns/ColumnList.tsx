import { useState } from 'react';
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
import { CreateColumnDialog } from './CreateColumnDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { Column } from '@/types';
import { reorderColumns } from '@/lib/api';

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

export function ColumnList({
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

  // 컬럼이 변경되면 로컬 상태 업데이트
  useState(() => {
    setLocalColumns(columns);
  });

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러
  const handleDragEnd = async (event: DragEndEvent) => {
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
      const columnIds = newColumns.map((col) => col.id);
      await reorderColumns(tableId, { columnIds });
      onColumnUpdated(); // 부모 컴포넌트에 알림
    } catch (error) {
      // 에러 발생 시 원래 순서로 복원
      setLocalColumns(columns);
      console.error('컬럼 순서 변경 실패:', error);
    } finally {
      setIsReordering(false);
    }
  };

  // orderIndex로 정렬된 컬럼 목록
  const sortedColumns = [...localColumns].sort((a, b) => a.orderIndex - b.orderIndex);

  // 다음 orderIndex 계산
  const nextOrderIndex = sortedColumns.length > 0
    ? Math.max(...sortedColumns.map(col => col.orderIndex)) + 1
    : 0;

  // 컬럼 생성 성공 핸들러
  const handleColumnCreated = () => {
    onColumnCreated();
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">컬럼 목록</h3>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          컬럼 추가
        </Button>
      </div>

      {/* 컬럼이 없는 경우 */}
      {sortedColumns.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">컬럼이 없습니다</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            첫 번째 컬럼 추가
          </Button>
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
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
                </DndContext>
              </tbody>
            </table>
          </div>

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
