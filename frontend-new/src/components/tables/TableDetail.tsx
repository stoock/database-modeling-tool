import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Columns3, List } from 'lucide-react';
import { ColumnList } from '@/components/columns';
import { getColumns } from '@/lib/api';
import type { Table, Column } from '@/types';

interface TableDetailProps {
  table: Table;
  onUpdate: () => void;
}

export function TableDetail({ table, onUpdate }: TableDetailProps) {
  const [activeTab, setActiveTab] = useState<'columns' | 'indexes'>('columns');
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false);

  // 탭 전환 시 데이터 로딩
  useEffect(() => {
    if (activeTab === 'columns') {
      loadColumns();
    } else if (activeTab === 'indexes') {
      loadIndexes();
    }
  }, [activeTab, table.id]);

  const loadColumns = async () => {
    setIsLoadingColumns(true);
    try {
      const data = await getColumns(table.id);
      setColumns(data);
    } catch (error) {
      console.error('컬럼 로딩 실패:', error);
    } finally {
      setIsLoadingColumns(false);
    }
  };

  const loadIndexes = async () => {
    setIsLoadingIndexes(true);
    try {
      // TODO: Task 14 - 인덱스 목록 API 호출
      // await fetchIndexes(table.id);
      console.log('인덱스 데이터 로딩:', table.id);
    } catch (error) {
      console.error('인덱스 로딩 실패:', error);
    } finally {
      setIsLoadingIndexes(false);
    }
  };

  // 컬럼 생성 핸들러
  const handleColumnCreated = () => {
    loadColumns();
    onUpdate();
  };

  // 컬럼 수정 핸들러
  const handleColumnUpdated = () => {
    loadColumns();
    onUpdate();
  };

  // 컬럼 삭제 핸들러
  const handleColumnDeleted = () => {
    loadColumns();
    onUpdate();
  };

  // 컬럼 편집 핸들러
  const handleEditColumn = (column: Column) => {
    // TODO: Task 12 - EditColumnDialog 열기
    console.log('컬럼 편집:', column);
  };

  // 컬럼 삭제 핸들러
  const handleDeleteColumn = (column: Column) => {
    // TODO: Task 13 - DeleteColumnDialog 열기
    console.log('컬럼 삭제:', column);
  };

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
          생성일: {new Date(table.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
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
              <div className="text-center py-12">
                <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  인덱스 관리 기능은 다음 태스크에서 구현됩니다
                </p>
                <p className="text-xs text-muted-foreground">
                  Task 14: 인덱스 목록 및 관리
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
