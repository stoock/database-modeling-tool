# ValidationPanel 통합 가이드

## ProjectDetailPage에 통합하기

ValidationPanel을 프로젝트 상세 페이지에 통합하는 방법입니다.

### 1. 기본 통합

```tsx
// frontend-new/src/pages/ProjectDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useTableStore } from '@/stores/tableStore';
import { ValidationPanel } from '@/components/validation';
import { TableList } from '@/components/tables';
import { TableDetail } from '@/components/tables';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { selectedProject } = useProjectStore();
  const { selectedTable, setSelectedTable, tables } = useTableStore();

  // 엔티티로 이동하는 핸들러
  const handleNavigateToEntity = (
    entityType: 'TABLE' | 'COLUMN' | 'INDEX',
    entityId: string
  ) => {
    if (entityType === 'TABLE') {
      // 테이블 선택
      const table = tables.find(t => t.id === entityId);
      if (table) {
        setSelectedTable(table);
        // 스크롤 이동
        setTimeout(() => {
          document.getElementById(`table-${entityId}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
    
    if (entityType === 'COLUMN') {
      // 컬럼이 속한 테이블을 먼저 찾아서 선택
      // 그 다음 컬럼으로 스크롤
      // 실제 구현은 컬럼 데이터 구조에 따라 다름
    }
    
    if (entityType === 'INDEX') {
      // 인덱스가 속한 테이블을 먼저 찾아서 선택
      // 인덱스 탭으로 전환 후 스크롤
    }
  };

  if (!projectId) {
    return <div>프로젝트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 */}
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">{selectedProject?.name}</h1>
        <p className="text-gray-600">{selectedProject?.description}</p>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* 좌측: 테이블 목록 (30%) */}
        <div className="col-span-4 overflow-y-auto">
          <TableList projectId={projectId} />
        </div>

        {/* 우측: 테이블 상세 및 검증 패널 (70%) */}
        <div className="col-span-8 overflow-y-auto space-y-6">
          {/* 테이블 상세 */}
          {selectedTable && (
            <TableDetail table={selectedTable} />
          )}

          {/* 검증 패널 */}
          <ValidationPanel
            projectId={projectId}
            onNavigateToEntity={handleNavigateToEntity}
          />
        </div>
      </div>
    </div>
  );
}
```

### 2. 탭 기반 레이아웃에 통합

```tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ValidationPanel } from '@/components/validation';

export function ProjectDetailPageWithTabs() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState('design');

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="design">설계</TabsTrigger>
          <TabsTrigger value="validation">검증</TabsTrigger>
          <TabsTrigger value="export">내보내기</TabsTrigger>
        </TabsList>

        <TabsContent value="design">
          {/* 테이블 설계 UI */}
        </TabsContent>

        <TabsContent value="validation">
          <ValidationPanel
            projectId={projectId!}
            onNavigateToEntity={(type, id) => {
              // 설계 탭으로 전환 후 해당 엔티티로 이동
              setActiveTab('design');
              setTimeout(() => {
                // 네비게이션 로직
              }, 100);
            }}
          />
        </TabsContent>

        <TabsContent value="export">
          {/* 내보내기 UI */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 3. 사이드바에 통합

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ValidationPanel } from '@/components/validation';
import { AlertCircle } from 'lucide-react';

export function ProjectDetailPageWithSidebar() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isValidationOpen, setIsValidationOpen] = useState(false);

  return (
    <div className="relative">
      {/* 메인 컨텐츠 */}
      <div className="p-6">
        {/* 테이블 설계 UI */}
      </div>

      {/* 검증 패널 사이드바 */}
      <Sheet open={isValidationOpen} onOpenChange={setIsValidationOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-6 right-6 shadow-lg"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            검증
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[600px] overflow-y-auto">
          <ValidationPanel
            projectId={projectId!}
            onNavigateToEntity={(type, id) => {
              // 사이드바 닫고 해당 엔티티로 이동
              setIsValidationOpen(false);
              setTimeout(() => {
                // 네비게이션 로직
              }, 300);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

### 4. 자동 검증 통합

```tsx
import { useEffect } from 'react';
import { ValidationPanel } from '@/components/validation';
import { useDebounce } from '@/hooks/useDebounce';

export function ProjectDetailPageWithAutoValidation() {
  const { projectId } = useParams<{ projectId: string }>();
  const { tables } = useTableStore();
  const [shouldValidate, setShouldValidate] = useState(false);
  
  // 테이블 변경 시 검증 트리거 (디바운스 적용)
  const debouncedTables = useDebounce(tables, 2000);
  
  useEffect(() => {
    if (debouncedTables.length > 0) {
      setShouldValidate(true);
    }
  }, [debouncedTables]);

  return (
    <div className="p-6">
      <ValidationPanel
        projectId={projectId!}
        onNavigateToEntity={handleNavigateToEntity}
      />
      
      {/* 자동 검증 트리거 */}
      {shouldValidate && (
        <AutoValidationTrigger
          projectId={projectId!}
          onComplete={() => setShouldValidate(false)}
        />
      )}
    </div>
  );
}
```

### 5. 컨텍스트 메뉴 통합

```tsx
import { ValidationPanel } from '@/components/validation';

export function TableListWithValidation() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tableId: string;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tableId });
  };

  return (
    <div>
      {tables.map(table => (
        <div
          key={table.id}
          onContextMenu={(e) => handleContextMenu(e, table.id)}
        >
          {table.name}
        </div>
      ))}

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-white shadow-lg rounded-lg p-2"
        >
          <button onClick={() => {
            // 해당 테이블만 검증
            validateTable(contextMenu.tableId);
          }}>
            이 테이블 검증
          </button>
        </div>
      )}
    </div>
  );
}
```

## 네비게이션 구현 예시

### 테이블로 이동

```typescript
const navigateToTable = (tableId: string) => {
  // 1. 테이블 선택
  const table = tables.find(t => t.id === tableId);
  if (table) {
    setSelectedTable(table);
  }

  // 2. 스크롤 이동
  setTimeout(() => {
    const element = document.getElementById(`table-${tableId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // 3. 하이라이트 효과
      element.classList.add('highlight-animation');
      setTimeout(() => {
        element.classList.remove('highlight-animation');
      }, 2000);
    }
  }, 100);
};
```

### 컬럼으로 이동

```typescript
const navigateToColumn = async (columnId: string) => {
  // 1. 컬럼 정보 조회
  const column = await getColumn(columnId);
  
  // 2. 해당 테이블 선택
  const table = tables.find(t => t.id === column.tableId);
  if (table) {
    setSelectedTable(table);
  }

  // 3. 컬럼 탭으로 전환
  setActiveTab('columns');

  // 4. 스크롤 이동
  setTimeout(() => {
    const element = document.getElementById(`column-${columnId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // 5. 하이라이트 효과
      element.classList.add('highlight-animation');
      setTimeout(() => {
        element.classList.remove('highlight-animation');
      }, 2000);
    }
  }, 200);
};
```

### 인덱스로 이동

```typescript
const navigateToIndex = async (indexId: string) => {
  // 1. 인덱스 정보 조회
  const index = await getIndex(indexId);
  
  // 2. 해당 테이블 선택
  const table = tables.find(t => t.id === index.tableId);
  if (table) {
    setSelectedTable(table);
  }

  // 3. 인덱스 탭으로 전환
  setActiveTab('indexes');

  // 4. 스크롤 이동
  setTimeout(() => {
    const element = document.getElementById(`index-${indexId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // 5. 하이라이트 효과
      element.classList.add('highlight-animation');
      setTimeout(() => {
        element.classList.remove('highlight-animation');
      }, 2000);
    }
  }, 200);
};
```

## CSS 하이라이트 애니메이션

```css
/* globals.css 또는 tailwind.config.js */
@keyframes highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    background-color: rgba(59, 130, 246, 0.2);
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    background-color: transparent;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.highlight-animation {
  animation: highlight 2s ease-in-out;
}
```

## 상태 관리 통합

```typescript
// validationStore.ts
import { create } from 'zustand';
import type { ValidationResult } from '@/types';

interface ValidationStore {
  validationResults: Record<string, ValidationResult>;
  isValidating: boolean;
  lastValidated: Record<string, string>;
  
  setValidationResult: (projectId: string, result: ValidationResult) => void;
  setValidating: (isValidating: boolean) => void;
  getValidationResult: (projectId: string) => ValidationResult | null;
}

export const useValidationStore = create<ValidationStore>((set, get) => ({
  validationResults: {},
  isValidating: false,
  lastValidated: {},
  
  setValidationResult: (projectId, result) => {
    set((state) => ({
      validationResults: {
        ...state.validationResults,
        [projectId]: result,
      },
      lastValidated: {
        ...state.lastValidated,
        [projectId]: new Date().toISOString(),
      },
    }));
  },
  
  setValidating: (isValidating) => set({ isValidating }),
  
  getValidationResult: (projectId) => {
    return get().validationResults[projectId] || null;
  },
}));
```

## 테스트 예시

```typescript
// ValidationPanel.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValidationPanel } from './ValidationPanel';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

describe('ValidationPanel', () => {
  it('검증 실행 버튼을 클릭하면 API를 호출한다', async () => {
    const mockValidate = jest.spyOn(api, 'validateProject').mockResolvedValue({
      valid: false,
      errors: [],
      warnings: [],
    });

    render(<ValidationPanel projectId="test-project" />);
    
    await userEvent.click(screen.getByText('검증 실행'));
    
    expect(mockValidate).toHaveBeenCalledWith('test-project');
  });

  it('검증 결과를 올바르게 표시한다', async () => {
    jest.spyOn(api, 'validateProject').mockResolvedValue({
      valid: false,
      errors: [
        {
          type: 'NAMING',
          severity: 'ERROR',
          entity: 'TABLE',
          entityId: 'table-1',
          entityName: 'user',
          message: '테이블명은 대문자를 사용해야 합니다',
        },
      ],
      warnings: [],
    });

    render(<ValidationPanel projectId="test-project" />);
    
    await userEvent.click(screen.getByText('검증 실행'));
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // 에러 1개
      expect(screen.getByText('테이블명은 대문자를 사용해야 합니다')).toBeInTheDocument();
    });
  });
});
```
