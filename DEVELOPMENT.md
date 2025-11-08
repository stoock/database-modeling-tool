# 개발 가이드

MSSQL 데이터베이스 모델링 도구 개발자를 위한 상세 가이드

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조](#프로젝트-구조)
3. [개발 워크플로우](#개발-워크플로우)
4. [코딩 규칙](#코딩-규칙)
5. [테스트 가이드](#테스트-가이드)
6. [디버깅](#디버깅)
7. [문제 해결](#문제-해결)

## 개발 환경 설정

### 필수 도구 설치

```bash
# Java 21 설치 확인
java -version

# Node.js 18+ 설치 확인
node -v
npm -v

# Docker 설치 확인
docker -v
docker-compose -v

# Gradle 설치 확인 (선택사항, gradlew 사용 가능)
gradle -v
```

### IDE 설정

#### IntelliJ IDEA (백엔드)
1. File → Open → backend 폴더 선택
2. Gradle 프로젝트로 자동 인식
3. Java 21 SDK 설정
4. Enable annotation processing (Lombok 사용 시)
5. 플러그인 설치:
   - Spring Boot
   - JPA Buddy
   - SonarLint

#### VS Code (프론트엔드)
1. File → Open Folder → frontend 폴더 선택
2. 권장 확장 프로그램 설치:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - TypeScript Vue Plugin (Volar)
   - Error Lens

### 데이터베이스 설정

```powershell
# Docker Compose로 PostgreSQL + pgAdmin 시작
cd docker
docker-compose up -d

# 데이터베이스 접속 정보
# Host: localhost
# Port: 5432
# Database: dbmodeling_dev
# Username: postgres
# Password: postgres

# pgAdmin 접속
# URL: http://localhost:5050
# Email: admin@admin.com
# Password: admin
```

### 환경 변수 설정

#### 백엔드 (.env 또는 application-dev.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dbmodeling_dev
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
```

#### 프론트엔드 (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=MSSQL 데이터베이스 모델링 도구
VITE_ENABLE_MOCK=false
```

## 프로젝트 구조

### 백엔드 (Clean Architecture)

```
backend/src/main/java/com/dbmodeling/
├── domain/                      # 도메인 계층 (비즈니스 로직)
│   ├── model/                   # 도메인 모델
│   ├── service/                 # 도메인 서비스
│   └── repository/              # 리포지토리 인터페이스
├── application/                 # 애플리케이션 계층 (유스케이스)
│   ├── service/                 # 애플리케이션 서비스
│   └── port/                    # 포트 인터페이스
├── infrastructure/              # 인프라스트럭처 계층 (외부 연동)
│   ├── persistence/             # 데이터 영속성
│   ├── config/                  # 설정
│   └── external/                # 외부 시스템
└── presentation/                # 프레젠테이션 계층 (API)
    ├── controller/              # REST 컨트롤러
    ├── dto/                     # DTO
    ├── mapper/                  # 매퍼
    └── exception/               # 예외 처리
```

### 프론트엔드 (React)

```
frontend/src/
├── pages/                       # 페이지 컴포넌트
│   └── Dashboard.tsx            # 메인 대시보드
├── components/                  # UI 컴포넌트
│   ├── project/                 # 프로젝트 관리
│   ├── table/                   # 테이블 관리
│   ├── column/                  # 컬럼 관리
│   ├── common/                  # 공통 컴포넌트
│   └── layout/                  # 레이아웃 컴포넌트
├── stores/                      # Zustand 상태 관리
├── services/                    # API 클라이언트
├── hooks/                       # 커스텀 훅
├── types/                       # TypeScript 타입
└── utils/                       # 유틸리티 함수
```

## 개발 워크플로우

### 1. 새 기능 개발

```bash
# 1. 기능 브랜치 생성
git checkout -b feature/새기능명

# 2. 백엔드 개발
cd backend
# - domain 계층: 도메인 모델 및 비즈니스 로직
# - application 계층: 유스케이스 구현
# - infrastructure 계층: 데이터 접근 구현
# - presentation 계층: REST API 구현

# 3. 백엔드 테스트
./gradlew test

# 4. 프론트엔드 개발
cd ../frontend
# - types: TypeScript 타입 정의
# - services: API 클라이언트 함수
# - stores: 상태 관리 로직
# - components: UI 컴포넌트

# 5. 프론트엔드 테스트
yarn test

# 6. 통합 테스트
yarn test:e2e

# 7. 커밋 및 푸시
git add .
git commit -m "feat: 새 기능 추가"
git push origin feature/새기능명
```

### 2. 버그 수정

```bash
# 1. 버그 브랜치 생성
git checkout -b fix/버그설명

# 2. 버그 재현 테스트 작성
# - 백엔드: src/test/java/...Test.java
# - 프론트엔드: src/...test.tsx

# 3. 버그 수정

# 4. 테스트 통과 확인

# 5. 커밋 및 푸시
git commit -m "fix: 버그 수정"
git push origin fix/버그설명
```

## 코딩 규칙

### Java (백엔드)

```java
// 클래스명: PascalCase
public class ProjectService {
    
    // 메서드명: camelCase
    public Project createProject(CreateProjectRequest request) {
        // 변수명: camelCase
        String projectName = request.getName();
        
        // 상수: UPPER_SNAKE_CASE
        private static final int MAX_NAME_LENGTH = 255;
        
        // 로깅
        log.info("프로젝트 생성: {}", projectName);
        
        return project;
    }
}
```

### TypeScript (프론트엔드)

```typescript
// 인터페이스/타입: PascalCase
interface Project {
  id: string;
  name: string;
}

// 컴포넌트: PascalCase
const SimpleDashboard: React.FC = () => {
  // 변수/함수: camelCase
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };
  
  return <div>...</div>;
};

// 상수: UPPER_SNAKE_CASE
const MAX_TABLE_COUNT = 100;
```

### 명명 규칙

#### 백엔드
- **Controller**: `[Entity]Controller` (예: `ProjectController`)
- **Service**: `[Entity]Service` (예: `ProjectService`)
- **Repository**: `[Entity]Repository` (예: `ProjectRepository`)
- **DTO**: `[Action][Entity]Request/Response` (예: `CreateProjectRequest`)
- **Entity**: `[Entity]Entity` (예: `ProjectEntity`)

#### 프론트엔드
- **Component**: `[Feature][Type]` (예: `ProjectSection`, `ColumnEditor`)
- **Hook**: `use[Feature]` (예: `useProjectStore`, `useDebounce`)
- **Store**: `[feature]Store` (예: `projectStore`, `tableStore`)
- **Service**: `[feature]Api` (예: `projectApi`, `tableApi`)

## 테스트 가이드

### 백엔드 테스트

#### 단위 테스트 (JUnit 5 + Mockito)

```java
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {
    
    @Mock
    private ProjectRepository projectRepository;
    
    @InjectMocks
    private ProjectService projectService;
    
    @Test
    @DisplayName("프로젝트 생성 성공")
    void createProject_Success() {
        // Given
        CreateProjectRequest request = new CreateProjectRequest("테스트 프로젝트");
        Project expectedProject = new Project("테스트 프로젝트");
        when(projectRepository.save(any())).thenReturn(expectedProject);
        
        // When
        Project result = projectService.createProject(request);
        
        // Then
        assertThat(result.getName()).isEqualTo("테스트 프로젝트");
        verify(projectRepository, times(1)).save(any());
    }
}
```

#### 통합 테스트 (Spring Boot Test)

```java
@SpringBootTest
@AutoConfigureMockMvc
class ProjectControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    @DisplayName("프로젝트 생성 API 테스트")
    void createProject_API_Success() throws Exception {
        // Given
        String requestBody = """
            {
                "name": "테스트 프로젝트",
                "description": "설명"
            }
            """;
        
        // When & Then
        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("테스트 프로젝트"));
    }
}
```

### 프론트엔드 테스트

#### 단위 테스트 (Vitest + React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectSection from './ProjectSection';

describe('ProjectSection', () => {
  it('프로젝트 생성 버튼 클릭 시 모달 열림', () => {
    // Given
    render(<ProjectSection />);
    
    // When
    const createButton = screen.getByText('+ 새 프로젝트');
    fireEvent.click(createButton);
    
    // Then
    expect(screen.getByText('프로젝트 생성')).toBeInTheDocument();
  });
});
```

#### E2E 테스트 (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('프로젝트 생성부터 스키마 내보내기까지 전체 플로우', async ({ page }) => {
  // 1. 대시보드 접속
  await page.goto('http://localhost:3000/simple');
  
  // 2. 프로젝트 생성
  await page.click('text=+ 새 프로젝트');
  await page.fill('input[name="name"]', '테스트 프로젝트');
  await page.click('text=생성');
  
  // 3. 테이블 추가
  await page.click('text=+ 새 테이블');
  await page.fill('input[name="name"]', 'User');
  await page.click('text=추가');
  
  // 4. 컬럼 추가
  await page.click('text=+ 컬럼 추가');
  // ... 컬럼 편집
  
  // 5. 스키마 내보내기
  await page.click('text=SQL 내보내기');
  await expect(page.locator('text=CREATE TABLE')).toBeVisible();
});
```

## 디버깅

### 백엔드 디버깅

#### IntelliJ IDEA
1. Run → Edit Configurations
2. Add New Configuration → Spring Boot
3. Main class: `com.dbmodeling.DatabaseModelingToolApplication`
4. Active profiles: `dev`
5. Debug 모드로 실행 (Shift + F9)

#### 로그 레벨 설정
```yaml
# application-dev.yml
logging:
  level:
    com.dbmodeling: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

### 프론트엔드 디버깅

#### Chrome DevTools
1. F12로 개발자 도구 열기
2. Sources 탭에서 브레이크포인트 설정
3. Console 탭에서 로그 확인

#### React DevTools
1. Chrome 확장 프로그램 설치
2. Components 탭에서 컴포넌트 트리 확인
3. Profiler 탭에서 성능 분석

#### VS Code 디버깅
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

## 문제 해결

### 백엔드 문제

#### 데이터베이스 연결 실패
```bash
# PostgreSQL 컨테이너 상태 확인
docker ps

# PostgreSQL 로그 확인
docker logs postgres-db

# 데이터베이스 재시작
docker-compose restart postgres
```

#### Gradle 빌드 실패
```bash
# Gradle 캐시 정리
./gradlew clean

# Gradle 데몬 중지
./gradlew --stop

# 의존성 다시 다운로드
./gradlew build --refresh-dependencies
```

### 프론트엔드 문제

#### 패키지 설치 실패
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
yarn install

# Yarn 캐시 정리
yarn cache clean
```

#### 빌드 오류
```bash
# TypeScript 타입 체크
yarn type-check

# ESLint 검사
yarn lint

# 빌드 캐시 정리
rm -rf dist
yarn build
```

### 통합 문제

#### CORS 오류
```java
// WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowCredentials(true);
    }
}
```

#### API 호출 실패
```typescript
// services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 네트워크 오류 처리
try {
  const response = await axios.get(`${API_BASE_URL}/projects`);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('API 오류:', error.response?.data);
  }
  throw error;
}
```

## 성능 최적화

### 백엔드 최적화

```java
// N+1 문제 해결
@EntityGraph(attributePaths = {"columns", "indexes"})
List<Table> findAllByProjectId(String projectId);

// 쿼리 최적화
@Query("SELECT t FROM TableEntity t " +
       "LEFT JOIN FETCH t.columns " +
       "WHERE t.projectId = :projectId")
List<TableEntity> findAllWithColumns(@Param("projectId") String projectId);
```

### 프론트엔드 최적화

```typescript
// React.memo로 불필요한 리렌더링 방지
const ColumnEditor = React.memo(({ columns }: Props) => {
  // ...
});

// useMemo로 계산 결과 캐싱
const sortedColumns = useMemo(() => {
  return columns.sort((a, b) => a.orderIndex - b.orderIndex);
}, [columns]);

// useCallback으로 함수 메모이제이션
const handleAddColumn = useCallback(() => {
  // ...
}, [dependencies]);
```

## 추가 리소스

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

**Happy Coding! 🚀**
