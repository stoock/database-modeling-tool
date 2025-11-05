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
import { useProjectStore } from '@/stores/projectStore';
import { useState } from 'react';

// Zod 검증 스키마
const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, '프로젝트명을 입력하세요')
    .max(100, '프로젝트명은 100자 이내로 입력하세요'),
  description: z
    .string()
    .max(500, '설명은 500자 이내로 입력하세요')
    .optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateProjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectDialogProps) {
  const { createProject } = useProjectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true);
    try {
      await createProject({
        name: data.name,
        description: data.description || '',
      });
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 프로젝트 생성</DialogTitle>
          <DialogDescription>
            새로운 데이터베이스 모델링 프로젝트를 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* 프로젝트명 */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                프로젝트명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="예: 고객관리시스템"
                {...register('name')}
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* 설명 */}
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                {...register('description')}
                aria-invalid={errors.description ? 'true' : 'false'}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && (
                <p id="description-error" className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
