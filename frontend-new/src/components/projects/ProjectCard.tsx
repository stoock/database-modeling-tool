import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export default function ProjectCard({ project, onSelect, onDelete }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-500"
      onClick={() => onSelect(project)}
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
            aria-label={`${project.name} 프로젝트 삭제`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>생성일: {formatDate(project.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
