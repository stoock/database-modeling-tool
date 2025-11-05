import { useState } from 'react';
import { Plus, Trash2, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

export function TableList({
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

  const handleCreateTable = async () => {
    // CreateTableDialog에서 폼 데이터를 받아 처리
    // 실제 API 호출은 여기서 수행
    onTableCreated();
  };

  const handleDeleteClick = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation(); // 테이블 선택 이벤트 방지
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tableToDelete) return;

    try {
      await deleteTable(tableToDelete.id);
      onTableDeleted();
    } catch (error) {
      console.error('테이블 삭제 실패:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            테이블 목록
          </h2>
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          총 {tables.length}개의 테이블
        </p>
      </div>

      {/* 테이블 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {tables.length === 0 ? (
          <div className="text-center py-12">
            <TableIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">
              아직 테이블이 없습니다
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              첫 테이블 만들기
            </Button>
          </div>
        ) : (
          tables.map((table) => (
            <Card
              key={table.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedTableId === table.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => onSelectTable(table.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {table.name}
                  </h3>
                  {table.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {table.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    생성일: {new Date(table.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => handleDeleteClick(table, e)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
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
