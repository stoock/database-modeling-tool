import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { GripVertical, Sparkles, X } from 'lucide-react';
import { ValidationBadge } from '@/components/validation/ValidationBadge';
import { createIndex } from '@/lib/api';
import { validateIndexName, generateIndexName } from '@/lib/validation';
import type { Column, CreateIndexRequest } from '@/types';

interface CreateIndexDialogProps {
  tableId: string;
  tableName: string;
  columns: Column[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface SelectedColumn {
  columnId: string;
  columnName: string;
  order: 'ASC' | 'DESC';
}

export function CreateIndexDialog({
  tableId,
  tableName,
  columns,
  open,
  onOpenChange,
  onSuccess,
}: CreateIndexDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'CLUSTERED' | 'NONCLUSTERED'>('NONCLUSTERED');
  const [unique, setUnique] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumn[]>([]);
  const [availableColumnId, setAvailableColumnId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameValidation, setNameValidation] = useState<{
    isValid: boolean;
    message: string;
    suggestion?: string;
  } | null>(null);

  // 사용 가능한 컬럼 목록 (이미 선택된 컬럼 제외)
  const availableColumns = useMemo(() => {
    const selectedIds = selectedColumns.map((col) => col.columnId);
    return columns.filter((col) => !selectedIds.includes(col.id));
  }, [columns, selectedColumns]);

  // 인덱스명 자동 생성
  const handleAutoGenerateName = () => {
    if (selectedColumns.length === 0) {
      return;
    }

    const columnNames = selectedColumns.map((col) => col.columnName);
    const generatedName = generateIndexName(tableName, columnNames, type, unique);
    setName(generatedName);
  };

  // 인덱스명 검증 (디바운스)
  useEffect(() => {
    if (!name) {
      setNameValidation(null);
      return;
    }

    const timer = setTimeout(() => {
      const result = validateIndexName(name, type, unique, tableName);
      setNameValidation(result);
    }, 500);

    return () => clearTimeout(timer);
  }, [name, type, unique, tableName]);

  // 컬럼 추가
  const handleAddColumn = () => {
    if (!availableColumnId) return;

    const column = columns.find((col) => col.id === availableColumnId);
    if (!column) return;

    setSelectedColumns([
      ...selectedColumns,
      {
        columnId: column.id,
        columnName: column.name,
        order: 'ASC',
      },
    ]);
    setAvailableColumnId('');
  };

  // 컬럼 제거
  const handleRemoveColumn = (columnId: string) => {
    setSelectedColumns(selectedColumns.filter((col) => col.columnId !== columnId));
  };

  // 컬럼 정렬 순서 변경
  const handleChangeOrder = (columnId: string, order: 'ASC' | 'DESC') => {
    setSelectedColumns(
      selectedColumns.map((col) =>
        col.columnId === columnId ? { ...col, order } : col
      )
    );
  };

  // 컬럼 순서 위로 이동
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...selectedColumns];
    [newColumns[index - 1], newColumns[index]] = [newColumns[index], newColumns[index - 1]];
    setSelectedColumns(newColumns);
  };

  // 컬럼 순서 아래로 이동
  const handleMoveDown = (index: number) => {
    if (index === selectedColumns.length - 1) return;
    const newColumns = [...selectedColumns];
    [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    setSelectedColumns(newColumns);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || selectedColumns.length === 0) {
      return;
    }

    if (nameValidation && !nameValidation.isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateIndexRequest = {
        tableId,
        name,
        type,
        unique,
        columns: selectedColumns.map((col) => ({
          columnId: col.columnId,
          order: col.order,
        })),
      };

      await createIndex(data);
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('인덱스 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    setName('');
    setType('NONCLUSTERED');
    setUnique(false);
    setSelectedColumns([]);
    setAvailableColumnId('');
    setNameValidation(null);
    onOpenChange(false);
  };

  // 제출 가능 여부
  const canSubmit =
    name &&
    selectedColumns.length > 0 &&
    (!nameValidation || nameValidation.isValid) &&
    !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>인덱스 추가</DialogTitle>
          <DialogDescription>
            테이블 "{tableName}"에 새로운 인덱스를 추가합니다
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 인덱스명 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="index-name">
                인덱스명 <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAutoGenerateName}
                disabled={selectedColumns.length === 0}
                className="h-7 text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                자동 생성
              </Button>
            </div>
            <Input
              id="index-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: IDX__USER__USER_ID"
              className={
                nameValidation
                  ? nameValidation.isValid
                    ? 'border-green-500 focus-visible:ring-green-500'
                    : 'border-red-500 focus-visible:ring-red-500'
                  : ''
              }
            />
            <ValidationBadge result={nameValidation} />
          </div>

          {/* 인덱스 타입 */}
          <div className="space-y-2">
            <Label htmlFor="index-type">
              인덱스 타입 <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={(value: 'CLUSTERED' | 'NONCLUSTERED') => setType(value)}>
              <SelectTrigger id="index-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONCLUSTERED">논클러스터드 (NONCLUSTERED)</SelectItem>
                <SelectItem value="CLUSTERED">클러스터드 (CLUSTERED)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {type === 'CLUSTERED'
                ? '⚠️ 클러스터드 인덱스는 테이블당 하나만 생성할 수 있으며, 데이터의 물리적 정렬을 결정합니다'
                : '논클러스터드 인덱스는 별도의 인덱스 구조를 생성하여 쿼리 성능을 향상시킵니다'}
            </p>
          </div>

          {/* UNIQUE 옵션 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="index-unique"
              checked={unique}
              onCheckedChange={(checked) => setUnique(checked as boolean)}
            />
            <Label
              htmlFor="index-unique"
              className="text-sm font-normal cursor-pointer"
            >
              UNIQUE 제약조건 (중복 값 허용 안 함)
            </Label>
          </div>

          {/* 컬럼 선택 */}
          <div className="space-y-3">
            <Label>
              포함 컬럼 <span className="text-red-500">*</span>
            </Label>

            {/* 컬럼 추가 */}
            <div className="flex gap-2">
              <Select
                value={availableColumnId}
                onValueChange={setAvailableColumnId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="컬럼 선택..." />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      선택 가능한 컬럼이 없습니다
                    </div>
                  ) : (
                    availableColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.name}
                        {column.primaryKey && (
                          <span className="ml-2 text-xs text-blue-600">(PK)</span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddColumn}
                disabled={!availableColumnId}
              >
                추가
              </Button>
            </div>

            {/* 선택된 컬럼 목록 */}
            {selectedColumns.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">
                  인덱스에 포함할 컬럼을 선택하세요
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedColumns.map((selectedColumn, index) => (
                  <div
                    key={selectedColumn.columnId}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                  >
                    {/* 순서 변경 버튼 */}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="위로 이동"
                      >
                        <GripVertical className="h-3 w-3 text-gray-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === selectedColumns.length - 1}
                        className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="아래로 이동"
                      >
                        <GripVertical className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>

                    {/* 순서 번호 */}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                      {index + 1}
                    </div>

                    {/* 컬럼명 */}
                    <div className="flex-1 font-mono text-sm">
                      {selectedColumn.columnName}
                    </div>

                    {/* 정렬 순서 */}
                    <Select
                      value={selectedColumn.order}
                      onValueChange={(value: 'ASC' | 'DESC') =>
                        handleChangeOrder(selectedColumn.columnId, value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASC">ASC ↑</SelectItem>
                        <SelectItem value="DESC">DESC ↓</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* 제거 버튼 */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveColumn(selectedColumn.columnId)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label="컬럼 제거"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              💡 복합 인덱스의 경우 컬럼 순서가 중요합니다. 위/아래 버튼으로 순서를
              조정하세요
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? '생성 중...' : '인덱스 생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
