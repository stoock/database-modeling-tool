/**
 * ValidationPanel 사용 예시
 * 
 * 이 파일은 ValidationPanel 컴포넌트의 사용 방법을 보여주는 예시입니다.
 * 실제 프로젝트에서는 ProjectDetailPage 등에서 사용됩니다.
 */

import { ValidationPanel } from './ValidationPanel';

export function ValidationPanelExample() {
  // 예시 프로젝트 ID
  const projectId = 'example-project-id';

  // 엔티티로 이동하는 핸들러
  const handleNavigateToEntity = (
    entityType: 'TABLE' | 'COLUMN' | 'INDEX',
    entityId: string
  ) => {
    console.log(`Navigate to ${entityType} with ID: ${entityId}`);
    
    // 실제 구현 예시:
    // 1. 테이블로 이동
    if (entityType === 'TABLE') {
      // tableStore.setSelectedTable(entityId);
      // 또는 스크롤 이동
      // document.getElementById(`table-${entityId}`)?.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 2. 컬럼으로 이동
    if (entityType === 'COLUMN') {
      // 해당 컬럼이 속한 테이블을 먼저 선택하고
      // 컬럼 목록에서 해당 컬럼으로 스크롤
      // const column = await getColumn(entityId);
      // tableStore.setSelectedTable(column.tableId);
      // setTimeout(() => {
      //   document.getElementById(`column-${entityId}`)?.scrollIntoView({ behavior: 'smooth' });
      // }, 100);
    }
    
    // 3. 인덱스로 이동
    if (entityType === 'INDEX') {
      // 해당 인덱스가 속한 테이블을 먼저 선택하고
      // 인덱스 탭으로 전환 후 해당 인덱스로 스크롤
      // const index = await getIndex(entityId);
      // tableStore.setSelectedTable(index.tableId);
      // setActiveTab('indexes');
      // setTimeout(() => {
      //   document.getElementById(`index-${entityId}`)?.scrollIntoView({ behavior: 'smooth' });
      // }, 100);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">검증 패널 예시</h1>
      
      <ValidationPanel
        projectId={projectId}
        onNavigateToEntity={handleNavigateToEntity}
      />
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">사용 방법</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>"검증 실행" 버튼을 클릭하여 프로젝트 전체를 검증합니다.</li>
          <li>에러와 경고가 엔티티별로 그룹화되어 표시됩니다.</li>
          <li>각 항목을 클릭하면 해당 엔티티로 이동합니다.</li>
          <li>준수율이 80% 이상이면 초록색, 50-79%는 노란색, 50% 미만은 빨간색으로 표시됩니다.</li>
          <li>섹션 헤더를 클릭하여 에러/경고 목록을 접거나 펼칠 수 있습니다.</li>
        </ol>
      </div>
    </div>
  );
}

/**
 * ProjectDetailPage에서의 실제 사용 예시
 */
export function ProjectDetailPageExample() {
  // const { projectId } = useParams();
  // const { selectedTable, setSelectedTable } = useTableStore();
  // const [activeTab, setActiveTab] = useState<'columns' | 'indexes'>('columns');

  const projectId = 'example-project-id';

  const handleNavigateToEntity = (
    entityType: 'TABLE' | 'COLUMN' | 'INDEX',
    entityId: string
  ) => {
    // 실제 네비게이션 로직 구현
    console.log(`Navigate to ${entityType} with ID: ${entityId}`);
    switch (entityType) {
      case 'TABLE':
        // setSelectedTable(entityId);
        break;
      case 'COLUMN':
        // 컬럼이 속한 테이블 찾기 및 선택
        // setActiveTab('columns');
        break;
      case 'INDEX':
        // 인덱스가 속한 테이블 찾기 및 선택
        // setActiveTab('indexes');
        break;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* 좌측: 테이블 목록 (30%) */}
      <div className="col-span-4">
        {/* <TableList /> */}
      </div>

      {/* 우측: 테이블 상세 및 검증 패널 (70%) */}
      <div className="col-span-8 space-y-6">
        {/* 테이블 상세 */}
        <div>
          {/* <TableDetail /> */}
        </div>

        {/* 검증 패널 */}
        <ValidationPanel
          projectId={projectId}
          onNavigateToEntity={handleNavigateToEntity}
        />
      </div>
    </div>
  );
}
