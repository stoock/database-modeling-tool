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
import { ValidationBadge } from '@/components/validation/ValidationBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { useTableStore } from '@/stores/tableStore';
import {
  validateTableName,
  validateTableDescription,
  type ValidationResult,
} from '@/lib/validation';
import type { CreateTableRequest } from '@/types';

// Zod 스키마
const createTableSchema = z.object({
  name: z.string().min(1, '테이블명을 입력하세요').max(100, '테이블명은 100자 이하여야 합니다'),
  description: z.string().min(1, 'Description을 입력하세요').max(500, 'Description은 500자 이하여야 합니다'),
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
    formState: { errors },
  } = useForm<CreateTableFormData>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const watchName = watch('name');
  const watchDescription = watch('description');

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
    // 검증 실패 시 제출 방지
    if (nameValidation && !nameValidation.isValid) {
      return;
    }
    if (descriptionValidation && !descriptionValidation.isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: CreateTableRequest = {
        projectId,
        name: data.name,
        description: data.description,
      };

      await createTable(requestData);
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
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
            <ValidationBadge result={nameValidation} />
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
            <ValidationBadge result={descriptionValidation} />
            <p className="text-xs text-gray-500">
              테이블명을 그대로 복사하지 말고 의미 있는 한글 설명을 입력하세요
            </p>
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
              disabled={
                isSubmitting ||
                (nameValidation !== null && !nameValidation.isValid) ||
                (descriptionValidation !== null && !descriptionValidation.isValid)
              }
            >
              {isSubmitting ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
