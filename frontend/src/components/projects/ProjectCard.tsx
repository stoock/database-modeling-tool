import { memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectCard({ project, onSelect, onDelete }: ProjectCardProps) {
  // 날짜 포맷팅을 useMemo로 캐싱
  const formattedDate = useMemo(() => {
    const date = new Date(project.createdAt);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [project.createdAt]);

  // 이벤트 핸들러를 useCallback으로 메모이제이션
  const handleSelect = useCallback(() => {
    onSelect(project);
  }, [onSelect, project]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project);
  }, [onDelete, project]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(project);
    }
  }, [onSelect, project]);

  // ARIA 레이블을 useMemo로 캐싱
  const ariaLabel = useMemo(() => 
    `${project.name} 프로젝트 - ${project.description || '설명 없음'} - 생성일: ${formattedDate}`,
    [project.name, project.description, formattedDate]
  );

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-500"
      onClick={handleSelect}
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <CardDescription className="mt-2">
              {project.description || '설명이 없습니다'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            aria-label={`${project.name} 프로젝트 삭제`}
            tabIndex={0}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
          <time dateTime={project.createdAt}>
            생성일: {formattedDate}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}

// React.memo로 불필요한 리렌더링 방지
export default memo(ProjectCard);
