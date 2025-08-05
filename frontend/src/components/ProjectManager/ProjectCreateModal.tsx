import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input, ErrorMessage } from '../common';
import { useProjectStore } from '../../stores/projectStore';
import type { CreateProjectRequest, UpdateProjectRequest, Project, NamingRules, CaseType } from '../../types';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null; // 편집 모드일 때 전달
  onSuccess?: (project: Project) => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  tablePrefix: string;
  tableSuffix: string;
  tablePattern: string;
  columnPattern: string;
  indexPattern: string;
  enforceCase: 'UPPER' | 'LOWER' | 'PASCAL' | 'SNAKE';
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess
}) => {
  const { createProject, updateProject, isLoading } = useProjectStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const isEditMode = !!project;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      tablePrefix: '',
      tableSuffix: '',
      tablePattern: '^[A-Z][a-zA-Z0-9]*$',
      columnPattern: '^[a-z][a-z0-9_]*$',
      indexPattern: '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$',
      enforceCase: 'PASCAL'
    }
  });

  // 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (isEditMode && project) {
      setValue('name', project.name);
      setValue('description', project.description || '');
      setValue('tablePrefix', project.namingRules?.tablePrefix || '');
      setValue('tableSuffix', project.namingRules?.tableSuffix || '');
      setValue('tablePattern', project.namingRules?.tablePattern || '^[A-Z][a-zA-Z0-9]*$');
      setValue('columnPattern', project.namingRules?.columnPattern || '^[a-z][a-z0-9_]*$');
      setValue('indexPattern', project.namingRules?.indexPattern || '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$');
      setValue('enforceCase', project.namingRules?.enforceCase || 'PASCAL');
    }
  }, [isEditMode, project, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    setSubmitError(null);
    
    const namingRules: NamingRules = {
      tablePrefix: data.tablePrefix || undefined,
      tableSuffix: data.tableSuffix || undefined,
      tablePattern: data.tablePattern,
      columnPattern: data.columnPattern,
      indexPattern: data.indexPattern,
      enforceCase: data.enforceCase as CaseType
    };

    try {
      let result: Project | null = null;
      
      if (isEditMode && project) {
        const updateRequest: UpdateProjectRequest = {
          name: data.name,
          description: data.description || undefined,
          namingRules
        };
        result = await updateProject(project.id, updateRequest);
      } else {
        const createRequest: CreateProjectRequest = {
          name: data.name,
          description: data.description || undefined,
          namingRules
        };
        result = await createProject(createRequest);
      }

      if (result) {
        onSuccess?.(result);
        handleClose();
      }
    } catch (error) {
      setSubmitError(
        isEditMode 
          ? '프로젝트 수정 중 오류가 발생했습니다.' 
          : '프로젝트 생성 중 오류가 발생했습니다.'
      );
    }
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? '프로젝트 편집' : '새 프로젝트 생성'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <ErrorMessage message={submitError} />
        )}

        {/* 기본 정보 섹션 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">기본 정보</h4>
          
          <div>
            <Input
              label="프로젝트 이름"
              required
              {...register('name', {
                required: '프로젝트 이름은 필수입니다.',
                minLength: {
                  value: 2,
                  message: '프로젝트 이름은 최소 2자 이상이어야 합니다.'
                },
                maxLength: {
                  value: 100,
                  message: '프로젝트 이름은 100자를 초과할 수 없습니다.'
                }
              })}
              error={errors.name?.message}
              placeholder="예: 사용자 관리 시스템"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프로젝트 설명
            </label>
            <textarea
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: '설명은 500자를 초과할 수 없습니다.'
                }
              })}
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* 네이밍 규칙 섹션 */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900">네이밍 규칙</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="테이블 접두사"
                {...register('tablePrefix')}
                placeholder="예: tbl_"
              />
            </div>
            
            <div>
              <Input
                label="테이블 접미사"
                {...register('tableSuffix')}
                placeholder="예: _table"
              />
            </div>
          </div>

          <div>
            <Input
              label="테이블 명명 패턴 (정규식)"
              {...register('tablePattern', {
                required: '테이블 명명 패턴은 필수입니다.'
              })}
              error={errors.tablePattern?.message}
              placeholder="^[A-Z][a-zA-Z0-9]*$"
            />
            <p className="mt-1 text-xs text-gray-500">
              PascalCase 형식 (예: User, OrderItem)
            </p>
          </div>

          <div>
            <Input
              label="컬럼 명명 패턴 (정규식)"
              {...register('columnPattern', {
                required: '컬럼 명명 패턴은 필수입니다.'
              })}
              error={errors.columnPattern?.message}
              placeholder="^[a-z][a-z0-9_]*$"
            />
            <p className="mt-1 text-xs text-gray-500">
              snake_case 형식 (예: user_id, created_at)
            </p>
          </div>

          <div>
            <Input
              label="인덱스 명명 패턴 (정규식)"
              {...register('indexPattern', {
                required: '인덱스 명명 패턴은 필수입니다.'
              })}
              error={errors.indexPattern?.message}
              placeholder="^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$"
            />
            <p className="mt-1 text-xs text-gray-500">
              IX_테이블명_컬럼명 형식 (예: IX_User_Email)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대소문자 규칙
            </label>
            <select
              {...register('enforceCase')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="PASCAL">PascalCase</option>
              <option value="SNAKE">snake_case</option>
              <option value="UPPER">UPPERCASE</option>
              <option value="LOWER">lowercase</option>
            </select>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading 
              ? (isEditMode ? '수정 중...' : '생성 중...') 
              : (isEditMode ? '수정' : '생성')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectCreateModal;