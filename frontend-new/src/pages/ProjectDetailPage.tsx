import { useParams } from 'react-router-dom';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">프로젝트 상세</h1>
      <p className="text-muted-foreground">프로젝트 ID: {projectId}</p>
    </div>
  );
}
