import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Key, List as ListIcon } from 'lucide-react';
import { DeleteIndexDialog } from './DeleteIndexDialog';
import { CreateIndexDialog } from './CreateIndexDialog';
import type { Index, Column } from '@/types';

interface IndexListProps {
  tableId: string;
  tableName: string;
  indexes: Index[];
  columns: Column[];
  onIndexCreated: () => void;
  onIndexDeleted: () => void;
}

export function IndexList({
  tableId,
  tableName,
  indexes,
  columns,
  onIndexCreated,
  onIndexDeleted,
}: IndexListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<Index | null>(null);

  // 인덱스 삭제 핸들러
  const handleDeleteIndex = (index: Index) => {
    setDeletingIndex(index);
    setIsDeleteDialogOpen(true);
  };

  // 인덱스 생성 성공 핸들러
  const handleCreateSuccess = () => {
    onIndexCreated();
    setIsCreateDialogOpen(false);
  };

  // 인덱스 삭제 성공 핸들러
  const handleDeleteSuccess = () => {
    onIndexDeleted();
    setIsDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  // 컬럼 이름 가져오기
  const getColumnName = (columnId: string): string => {
    const column = columns.find((col) => col.id === columnId);
    return column?.name || columnId;
  };

  // 인덱스 타입 배지 색상
  const getTypeColor = (type: 'CLUSTERED' | 'NONCLUSTERED') => {
    return type === 'CLUSTERED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">인덱스 목록</h3>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          인덱스 추가
        </Button>
      </div>

      {/* 인덱스가 없는 경우 */}
      {indexes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">인덱스가 없습니다</p>
          <p className="text-sm text-gray-400 mb-4">
            테이블 "{tableName}"에 인덱스를 추가하여 쿼리 성능을 최적화하세요
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            첫 번째 인덱스 추가
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {indexes.map((index) => (
            <Card key={index.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-base">{index.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteIndex(index)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    aria-label={`${index.name} 인덱스 삭제`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 인덱스 타입 및 UNIQUE 정보 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                      index.type
                    )}`}
                  >
                    {index.type === 'CLUSTERED' ? '클러스터드' : '논클러스터드'}
                  </span>
                  {index.unique && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      UNIQUE
                    </span>
                  )}
                </div>

                {/* 컬럼 목록 */}
                <div>
                  <CardDescription className="text-xs font-medium mb-2">
                    포함 컬럼:
                  </CardDescription>
                  <div className="space-y-1">
                    {index.columns.map((indexColumn, idx) => {
                      const column = columns.find(c => c.id === indexColumn.columnId);
                      return (
                        <div
                          key={`${indexColumn.columnId}-${idx}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-sm font-medium">
                              {column?.name || indexColumn.columnId}
                            </span>
                            {column?.description && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({column.description})
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                              indexColumn.order === 'ASC'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {indexColumn.order}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 생성일 */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    생성일:{' '}
                    {new Date(index.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 안내 메시지 */}
      {indexes.length > 0 && (
        <p className="text-xs text-gray-500 mt-4">
          💡 클러스터드 인덱스는 테이블당 하나만 생성할 수 있으며, 데이터의 물리적 정렬을
          결정합니다
        </p>
      )}

      {/* 인덱스 생성 다이얼로그 */}
      <CreateIndexDialog
        tableId={tableId}
        tableName={tableName}
        columns={columns}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* 인덱스 삭제 다이얼로그 */}
      <DeleteIndexDialog
        index={deletingIndex}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
