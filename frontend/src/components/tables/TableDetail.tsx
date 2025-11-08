import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Columns3, List } from 'lucide-react';
import { ColumnList, EditColumnDialog, DeleteColumnDialog } from '@/components/columns';
import { IndexList } from '@/components/indexes';
import { getColumns, getIndexes } from '@/lib/api';
import type { Table, Column, Index } from '@/types';

interface TableDetailProps {
  table: Table;
  onUpdate: () => void;
}

function TableDetailComponent({ table, onUpdate }: TableDetailProps) {
  const [activeTab, setActiveTab] = useState<'columns' | 'indexes'>('columns');
  const [columns, setColumns] = useState<Column[]>([]);
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false);
  
  // 컬럼 편집 다이얼로그 상태
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  
  // 컬럼 삭제 다이얼로그 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingColumn, setDeletingColumn] = useState<Column | null>(null);

  // 데이터 로딩 함수를 useCallback으로 메모이제이션
  const loadColumns = useCallback(async () => {
    setIsLoadingColumns(true);
    try {
      const data = await getColumns(table.id);
      setColumns(data);
    } catch (error) {
      console.error('컬럼 로딩 실패:', error);
    } finally {
      setIsLoadingColumns(false);
    }
  }, [table.id]);

  const loadIndexes = useCallback(async () => {
    setIsLoadingIndexes(true);
    try {
      const data = await getIndexes(table.id);
      setIndexes(data);
    } catch (error) {
      console.error('인덱스 로딩 실패:', error);
    } finally {
      setIsLoadingIndexes(false);
    }
  }, [table.id]);

  // 탭 전환 시 데이터 로딩
  useEffect(() => {
    if (activeTab === 'columns') {
      loadColumns();
    } else if (activeTab === 'indexes') {
      // 인덱스 탭에서는 인덱스와 컬럼 모두 로드
      loadColumns();
      loadIndexes();
    }
  }, [activeTab, loadColumns, loadIndexes]);

  // 테이블이 변경되면 데이터 초기화 및 재로드
  useEffect(() => {
    setColumns([]);
    setIndexes([]);
    if (activeTab === 'columns') {
      loadColumns();
    } else if (activeTab === 'indexes') {
      loadColumns();
      loadIndexes();
    }
  }, [table.id]); // table.id가 변경될 때마다 실행

  // 이벤트 핸들러를 useCallback으로 메모이제이션
  const handleColumnCreated = useCallback(() => {
    loadColumns();
    onUpdate();
  }, [loadColumns, onUpdate]);

  const handleColumnUpdated = useCallback(() => {
    loadColumns();
    onUpdate();
  }, [loadColumns, onUpdate]);

  const handleColumnDeleted = useCallback(() => {
    loadColumns();
    onUpdate();
  }, [loadColumns, onUpdate]);

  const handleEditColumn = useCallback((column: Column) => {
    setEditingColumn(column);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    loadColumns();
    onUpdate();
    setIsEditDialogOpen(false);
    setEditingColumn(null);
  }, [loadColumns, onUpdate]);

  const handleDeleteColumn = useCallback((column: Column) => {
    setDeletingColumn(column);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    loadColumns();
    onUpdate();
    setIsDeleteDialogOpen(false);
    setDeletingColumn(null);
  }, [loadColumns, onUpdate]);

  const handleIndexCreated = useCallback(() => {
    loadIndexes();
    onUpdate();
  }, [loadIndexes, onUpdate]);

  const handleIndexDeleted = useCallback(() => {
    loadIndexes();
    onUpdate();
  }, [loadIndexes, onUpdate]);

  // 포맷된 날짜를 useMemo로 캐싱
  const formattedDate = useMemo(() => 
    new Date(table.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    [table.createdAt]
  );

  return (
    <div className="space-y-4">
      {/* 테이블 정보 헤더 */}
      <div>
        <h2 className="text-xl font-semibold">{table.name}</h2>
        {table.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {table.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          생성일: {formattedDate}
        </p>
      </div>

      {/* 탭 구조 */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'columns' | 'indexes')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="columns" className="flex items-center gap-2">
            <Columns3 className="h-4 w-4" />
            컬럼
          </TabsTrigger>
          <TabsTrigger value="indexes" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            인덱스
          </TabsTrigger>
        </TabsList>

        {/* 컬럼 탭 */}
        <TabsContent value="columns" className="mt-4">
          <Card className="p-6">
            {isLoadingColumns ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">컬럼 목록을 불러오는 중...</p>
              </div>
            ) : (
              <ColumnList
                tableId={table.id}
                tableName={table.name}
                columns={columns}
                onColumnCreated={handleColumnCreated}
                onColumnUpdated={handleColumnUpdated}
                onColumnDeleted={handleColumnDeleted}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            )}
          </Card>
        </TabsContent>

        {/* 인덱스 탭 */}
        <TabsContent value="indexes" className="mt-4">
          <Card className="p-6">
            {isLoadingIndexes ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">인덱스 목록을 불러오는 중...</p>
              </div>
            ) : (
              <IndexList
                tableId={table.id}
                tableName={table.name}
                indexes={indexes}
                columns={columns}
                onIndexCreated={handleIndexCreated}
                onIndexDeleted={handleIndexDeleted}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* 컬럼 편집 다이얼로그 */}
      {editingColumn && (
        <EditColumnDialog
          column={editingColumn}
          tableName={table.name}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* 컬럼 삭제 다이얼로그 */}
      <DeleteColumnDialog
        column={deletingColumn}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const TableDetail = memo(TableDetailComponent);
