import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { deleteColumn } from '@/lib/api';
import type { Column } from '@/types';

interface DeleteColumnDialogProps {
  column: Column | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteColumnDialog({
  column,
  open,
  onOpenChange,
  onSuccess,
}: DeleteColumnDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!column) return;

    setIsDeleting(true);
    try {
      await deleteColumn(column.id);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('컬럼 삭제 실패:', error);
      // 에러는 API 인터셉터에서 토스트로 표시됨
    } finally {
      setIsDeleting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>컬럼 삭제 확인</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            정말로 이 컬럼을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 컬럼 정보 표시 */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                컬럼명: <span className="font-mono">{column.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                한글명: {column.description.split('||')[0].trim()}
              </p>
              <p className="text-sm text-gray-600">
                데이터 타입: <span className="font-mono">{column.dataType}</span>
                {column.maxLength && ` (${column.maxLength})`}
                {column.precision && ` (${column.precision}, ${column.scale})`}
              </p>
            </div>
          </div>

          {/* 경고 메시지 */}
          {column.primaryKey && (
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                이 컬럼은 기본키(PK)입니다. 삭제하면 테이블의 무결성에 영향을 줄 수 있습니다.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
