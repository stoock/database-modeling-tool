import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ValidationBadge } from '@/components/validation/ValidationBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { useTableStore } from '@/stores/tableStore';
import {
  validateTableName,
  validateTableDescription,
  type ValidationResult,
} from '@/lib/validation';
import { createColumn } from '@/lib/api';
import type { CreateTableRequest, CreateColumnRequest } from '@/types';
import { SYSTEM_COLUMNS } from '@/types';

// Zod 스키마
const createTableSchema = z.object({
  name: z.string().min(1, '테이블명을 입력하세요').max(100, '테이블명은 100자 이하여야 합니다'),
  description: z.string().min(1, 'Description을 입력하세요').max(500, 'Description은 500자 이하여야 합니다'),
  addSystemColumns: z.boolean(),
});

type CreateTableFormData = z.infer<typeof createTableSchema>;

interface CreateTableDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTableDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: CreateTableDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameValidation, setNameValidation] = useState<ValidationResult | null>(null);
  const [descriptionValidation, setDescriptionValidation] = useState<ValidationResult | null>(null);

  const { createTable } = useTableStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTableFormData>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      name: '',
      description: '',
      addSystemColumns: true,
    },
  });

  const watchName = watch('name');
  const watchDescription = watch('description');
  const watchAddSystemColumns = watch('addSystemColumns');

  // 500ms 디바운스
  const debouncedName = useDebounce(watchName, 500);
  const debouncedDescription = useDebounce(watchDescription, 500);

  // 테이블명 실시간 검증
  useEffect(() => {
    if (debouncedName && debouncedName.trim() !== '') {
      const result = validateTableName(debouncedName);
      setNameValidation(result);
    } else {
      setNameValidation(null);
    }
  }, [debouncedName]);

  // Description 실시간 검증
  useEffect(() => {
    if (debouncedDescription && debouncedDescription.trim() !== '' && debouncedName) {
      const result = validateTableDescription(debouncedDescription, debouncedName);
      setDescriptionValidation(result);
    } else {
      setDescriptionValidation(null);
    }
  }, [debouncedDescription, debouncedName]);

  // 다이얼로그가 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      reset();
      setNameValidation(null);
      setDescriptionValidation(null);
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateTableFormData) => {
    // 명명 규칙 검증 실패 시 경고만 표시하고 저장은 허용
    // (nameValidation, descriptionValidation은 체크하지 않음)

    setIsSubmitting(true);
    try {
      const requestData: CreateTableRequest = {
        projectId,
        name: data.name.toUpperCase(),
        description: data.description,
      };

      const newTable = await createTable(requestData);

      // 시스템 속성 컬럼 자동 추가
      if (data.addSystemColumns && newTable?.id) {
        // 시스템 컬럼을 순차적으로 생성
        for (let i = 0; i < SYSTEM_COLUMNS.length; i++) {
          const sysCol = SYSTEM_COLUMNS[i];
          const columnRequest: CreateColumnRequest = {
            tableId: newTable.id,
            name: sysCol.name,
            description: sysCol.description,
            dataType: sysCol.dataType,
            maxLength: sysCol.dataType === 'VARCHAR' ? 25 : undefined,
            nullable: sysCol.nullable,
            primaryKey: false,
            identity: false,
            defaultValue: sysCol.defaultValue,
            orderIndex: i,
          };
          
          await createColumn(columnRequest);
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('테이블 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>테이블 생성</DialogTitle>
          <DialogDescription>
            새로운 테이블을 생성합니다. 테이블명은 대문자 형식을 사용하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              테이블명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="예: USER, ORDER_ITEM"
              {...register('name')}
              className={errors.name || (nameValidation && !nameValidation.isValid) ? 'border-red-500' : ''}
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => {
                const upperValue = e.target.value.toUpperCase();
                e.target.value = upperValue;
              }}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
            <ValidationBadge 
              result={nameValidation} 
              onSuggestionClick={(suggestion) => setValue('name', suggestion)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description (한글 설명) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              placeholder="예: 사용자 정보, 주문 항목"
              {...register('description')}
              className={errors.description || (descriptionValidation && !descriptionValidation.isValid) ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
            <ValidationBadge 
              result={descriptionValidation} 
              onSuggestionClick={(suggestion) => setValue('description', suggestion)}
            />
            <p className="text-xs text-gray-500">
              테이블명을 그대로 복사하지 말고 의미 있는 한글 설명을 입력하세요
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-3">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="addSystemColumns"
                checked={watchAddSystemColumns}
                onCheckedChange={(checked) => setValue('addSystemColumns', checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1 space-y-1.5">
                <Label
                  htmlFor="addSystemColumns"
                  className="text-sm font-medium leading-tight cursor-pointer"
                >
                  시스템 속성 컬럼 자동 추가
                </Label>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  REG_ID, REG_DT, CHG_ID, CHG_DT 컬럼을 자동으로 추가합니다
                </p>
                {watchAddSystemColumns && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">추가될 컬럼:</p>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span><span className="font-mono font-medium">REG_ID</span> (VARCHAR(25), NOT NULL) - 등록자ID</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span><span className="font-mono font-medium">REG_DT</span> (DATETIME, NOT NULL, DEFAULT GETDATE()) - 등록일시</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span><span className="font-mono font-medium">CHG_ID</span> (VARCHAR(25), NULL) - 수정자ID</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span><span className="font-mono font-medium">CHG_DT</span> (DATETIME, NULL) - 수정일시</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
