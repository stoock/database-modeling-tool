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
import { deleteIndex } from '@/lib/api';
import type { Index } from '@/types';

interface DeleteIndexDialogProps {
  index: Index | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteIndexDialog({
  index,
  open,
  onOpenChange,
  onSuccess,
}: DeleteIndexDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!index) return;

    setIsDeleting(true);
    try {
      await deleteIndex(index.id);
      onSuccess();
    } catch (error) {
      console.error('인덱스 삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!index) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>인덱스 삭제</DialogTitle>
              <DialogDescription>
                이 작업은 되돌릴 수 없습니다
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800 mb-2">
              다음 인덱스를 삭제하시겠습니까?
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-red-700">인덱스명:</span>
                <span className="font-mono text-sm text-red-900">{index.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-red-700">타입:</span>
                <span className="text-sm text-red-900">
                  {index.type === 'CLUSTERED' ? '클러스터드' : '논클러스터드'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-red-700">컬럼:</span>
                <span className="text-sm text-red-900">
                  {index.columns.map((col) => col.columnName).join(', ')}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
            <p className="text-xs text-yellow-800">
              ⚠️ 인덱스를 삭제하면 해당 인덱스를 사용하는 쿼리의 성능이 저하될 수 있습니다.
              삭제 전에 영향을 받는 쿼리를 확인하세요.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
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
