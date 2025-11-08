import { useState, useCallback, useMemo, memo } from 'react';
import { Plus, Trash2, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTableDialog } from './CreateTableDialog';
import { DeleteTableDialog } from './DeleteTableDialog';
import { useTableStore } from '@/stores/tableStore';
import type { Table } from '@/types';

interface TableListProps {
  projectId: string;
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onTableCreated: () => void;
  onTableDeleted: () => void;
}

function TableListComponent({
  projectId,
  tables,
  selectedTableId,
  onSelectTable,
  onTableCreated,
  onTableDeleted,
}: TableListProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const { deleteTable, isLoading } = useTableStore();

  // 이벤트 핸들러를 useCallback으로 메모이제이션
  const handleCreateTable = useCallback(() => {
    onTableCreated();
  }, [onTableCreated]);

  const handleDeleteClick = useCallback((table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!tableToDelete) return;

    try {
      await deleteTable(tableToDelete.id);
      onTableDeleted();
    } catch (error) {
      console.error('테이블 삭제 실패:', error);
    }
  }, [tableToDelete, deleteTable, onTableDeleted]);

  const handleOpenCreateDialog = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  // 테이블 개수를 useMemo로 캐싱
  const tableCount = useMemo(() => tables.length, [tables.length]);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 - 슬림 버전 */}
      <div className="p-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              테이블 ({tableCount})
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleOpenCreateDialog}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 테이블 목록 - 슬림 버전 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tableCount === 0 ? (
          <div className="text-center py-8">
            <TableIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-3">
              테이블이 없습니다
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenCreateDialog}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              추가
            </Button>
          </div>
        ) : (
          tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              isSelected={selectedTableId === table.id}
              onSelect={onSelectTable}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
          ))
        )}
      </div>

      {/* 다이얼로그 */}
      <CreateTableDialog
        projectId={projectId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateTable}
      />

      <DeleteTableDialog
        table={tableToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

// 개별 테이블 카드 컴포넌트 - React.memo로 최적화
interface TableCardProps {
  table: Table;
  isSelected: boolean;
  onSelect: (tableId: string) => void;
  onDelete: (table: Table, e: React.MouseEvent) => void;
  isLoading: boolean;
}

const TableCard = memo(({ table, isSelected, onSelect, onDelete, isLoading }: TableCardProps) => {
  const handleClick = useCallback(() => {
    onSelect(table.id);
  }, [onSelect, table.id]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    onDelete(table, e);
  }, [onDelete, table]);

  // const formattedDate = useMemo(() => 
  //   new Date(table.createdAt).toLocaleDateString('ko-KR'),
  //   [table.createdAt]
  // );

  return (
    <div
      className={`px-3 py-2 cursor-pointer transition-all rounded-md ${
        isSelected
          ? 'bg-blue-50 border-l-2 border-blue-500'
          : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TableIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <h3 className="font-medium text-sm truncate">
              {table.name}
            </h3>
          </div>
          {table.description && (
            <p className="text-xs text-gray-500 mt-0.5 ml-5 truncate">
              {table.description}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
          onClick={handleDeleteClick}
          disabled={isLoading}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});

TableCard.displayName = 'TableCard';

// React.memo로 불필요한 리렌더링 방지
export const TableList = memo(TableListComponent);
