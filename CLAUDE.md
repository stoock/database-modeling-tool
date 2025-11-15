# CLAUDE.md - AI Assistant Guide

**Version**: 1.0
**Last Updated**: 2025-11-15
**Purpose**: Comprehensive guide for AI assistants working on the MSSQL Database Modeling Tool

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Architecture Principles](#architecture-principles)
4. [Development Workflows](#development-workflows)
5. [Coding Conventions](#coding-conventions)
6. [Testing Guidelines](#testing-guidelines)
7. [Common Patterns](#common-patterns)
8. [Pitfalls to Avoid](#pitfalls-to-avoid)
9. [Quick Reference](#quick-reference)

---

## Project Overview

### What is this project?

A web-based **MSSQL database schema design and management platform** that provides:

- **Simplified one-page UI**: All features integrated in a single dashboard
- **ERD-style editing**: 20-column grid inline editing for fast column management
- **MSSQL expertise**: Support for 27 MSSQL data types including IDENTITY, DECIMAL precision/scale
- **Korean-friendly**: Dual management of Korean names and English names
- **Real-time validation**: Instant detection of naming rule violations
- **Multi-format export**: SQL, JSON, Markdown, HTML, CSV export support

### Tech Stack Summary

**Backend**: Java 21 + Spring Boot 3.2.0 + PostgreSQL 15 + Clean Architecture
**Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Zustand
**Testing**: JUnit 5 + Mockito (backend), Vitest + Playwright (frontend)
**Database**: PostgreSQL for metadata storage, Flyway for migrations

### Key Value Propositions

- **Fast workflow**: ERD-style inline editing provides exerd-level convenience
- **Korean support**: Separate management of Korean and English names optimized for domestic environments
- **Real-time validation**: Immediate detection of naming rule violations prevents errors
- **Automated SQL**: Auto-generation of MSSQL DDL scripts eliminates manual errors
- **One-page UI**: All features integrated in one screen for quick access
- **Persistent storage**: Stable project management with PostgreSQL backend

---

## Codebase Structure

### Root Directory Layout

```
database-modeling-tool/
├── backend/                 # Spring Boot backend (Clean Architecture)
├── frontend/                # React frontend (NEW version)
├── simple-frontend/         # Legacy simplified version
├── docker/                  # Docker configurations
├── scripts/                 # PowerShell automation scripts
├── docs/                    # Project documentation
├── .kiro/                   # Kiro IDE settings & specs
├── .claude/                 # Claude Code settings
├── README.md                # User-facing documentation
├── DEVELOPMENT.md           # Developer guide
├── API.md                   # API documentation
├── CLAUDE.md                # This file - AI assistant guide
└── docker-compose.yml       # Docker services configuration
```

### Backend Structure (Clean Architecture)

```
backend/src/main/java/com/dbmodeling/
├── domain/                         # LAYER 1: Pure business logic
│   ├── model/                      # Domain models (Project, Table, Column, Index)
│   ├── service/                    # Domain services (SqlGeneratorService)
│   └── repository/                 # Repository interfaces (ProjectRepository)
│
├── application/                    # LAYER 2: Use case orchestration
│   ├── service/                    # Application services (ProjectService)
│   ├── port/                       # Port interfaces
│   │   ├── in/                     # Input ports (CreateProjectUseCase)
│   │   └── out/                    # Output ports (LoadProjectPort)
│   └── dto/                        # Internal DTOs
│
├── infrastructure/                 # LAYER 3: External integrations
│   ├── persistence/                # Data access layer
│   │   ├── entity/                 # JPA entities (ProjectEntity)
│   │   ├── repository/             # JPA repositories
│   │   └── mapper/                 # Entity ↔ Domain mappers
│   ├── config/                     # Configuration classes
│   │   ├── DatabaseConfig.java
│   │   ├── JpaConfig.java
│   │   ├── WebConfig.java
│   │   ├── SwaggerConfig.java
│   │   ├── CacheConfig.java
│   │   └── PerformanceMonitoringConfig.java
│   └── external/                   # External system integrations
│       └── MSSQLTypeMapper.java
│
└── presentation/                   # LAYER 4: API layer
    ├── controller/                 # REST controllers
    │   ├── ProjectController.java
    │   ├── TableController.java
    │   ├── ColumnController.java
    │   ├── IndexController.java
    │   ├── ValidationController.java
    │   ├── ExportController.java
    │   └── HealthController.java
    ├── dto/                        # API DTOs
    │   ├── request/                # Request DTOs
    │   └── response/               # Response DTOs
    ├── mapper/                     # DTO ↔ Domain mappers
    └── exception/                  # Exception handling
        ├── GlobalExceptionHandler.java
        ├── ResourceNotFoundException.java
        └── BusinessException.java
```

### Frontend Structure (React + TypeScript)

```
frontend/src/
├── pages/                          # Route pages
│   ├── ProjectsPage.tsx           # Project list view
│   ├── ProjectDetailPage.tsx      # Project detail with tables
│   └── ERDPage.tsx                # ERD visualization
│
├── components/                     # Feature components
│   ├── projects/                  # Project management
│   │   ├── CreateProjectDialog.tsx
│   │   ├── DeleteProjectDialog.tsx
│   │   └── ProjectCard.tsx
│   ├── tables/                    # Table management
│   │   ├── CreateTableDialog.tsx
│   │   ├── TableList.tsx
│   │   └── TableDetail.tsx
│   ├── columns/                   # Column management
│   │   ├── ColumnList.tsx
│   │   ├── CreateColumnDialog.tsx
│   │   ├── EditColumnDialog.tsx
│   │   └── SortableRow.tsx        # Drag-and-drop
│   ├── indexes/                   # Index management
│   ├── validation/                # Validation UI
│   ├── erd/                       # ERD diagram (ReactFlow)
│   ├── export/                    # Export dialogs
│   ├── common/                    # Shared components
│   └── ui/                        # Radix UI wrappers
│
├── stores/                         # Zustand state management
│   ├── projectStore.ts
│   ├── tableStore.ts
│   └── toastStore.ts
│
├── lib/                            # Core utilities
│   ├── api.ts                     # Axios API client
│   ├── errorHandler.ts            # Centralized error handling
│   ├── validation.ts              # Validation utilities
│   └── utils.ts                   # General utilities
│
├── hooks/                          # Custom React hooks
│   ├── useDebounce.ts
│   ├── useAsyncError.ts
│   ├── useFocusManagement.ts
│   ├── useKeyboardShortcuts.ts
│   └── useNetworkStatus.ts
│
├── types/                          # TypeScript definitions
│   └── index.ts                   # Centralized type definitions
│
├── test/                           # Test utilities
│   ├── setup.ts
│   └── integration/               # Integration tests
│
└── utils/                          # Helpers
    └── accessibility.ts
```

### Database Migrations

```
backend/src/main/resources/db/migration/
├── V1__create_initial_tables.sql
├── V2__add_indexes_and_constraints.sql
└── V3__add_naming_rules_column.sql
```

**Important**: Never modify existing migration files. Always create new versioned files.

---

## Architecture Principles

### Clean Architecture (Backend)

The backend follows **Clean Architecture** (Hexagonal Architecture) with strict layer separation:

#### 1. Domain Layer (Innermost - No Dependencies)

**Purpose**: Pure business logic, framework-agnostic

**Components**:
- **Models**: Rich domain models with business methods
  - `Project`, `Table`, `Column`, `Index`, `NamingRules`, `MSSQLDataType`
- **Repositories**: Interfaces only (implementation in infrastructure)
- **Domain Services**: Complex business logic spanning multiple aggregates

**Rules**:
- ✅ NO external dependencies (pure Java)
- ✅ Contains business rules and invariants
- ✅ Rich domain models with methods like `project.addTable()`, `table.getPrimaryKeyColumns()`
- ❌ NO annotations except Java standard library
- ❌ NO database, framework, or external library dependencies

**Example**:
```java
// domain/model/Project.java
public class Project {
    private UUID id;
    private String name;
    private List<Table> tables = new ArrayList<>();

    public void addTable(Table table) {
        // Business rule: Table name must be unique within project
        if (tables.stream().anyMatch(t -> t.getName().equals(table.getName()))) {
            throw new BusinessException("Table name must be unique");
        }
        tables.add(table);
    }
}
```

#### 2. Application Layer (Use Case Orchestration)

**Purpose**: Orchestrate use cases, manage transactions

**Components**:
- **Services**: Implement use case interfaces
- **Ports**: Input (use cases) and Output (repository interfaces)
- **Commands**: Immutable command objects for mutations

**Rules**:
- ✅ Use domain models and repositories
- ✅ Define transaction boundaries with `@Transactional`
- ✅ Orchestrate multiple domain operations
- ❌ NO direct dependency on infrastructure or presentation
- ❌ NO HTTP, database, or external system code

**Example**:
```java
// application/service/ProjectService.java
@Service
@Transactional
public class ProjectService implements CreateProjectUseCase {
    private final ProjectRepository projectRepository;

    @Override
    public Project createProject(CreateProjectCommand command) {
        Project project = new Project(command.getName(), command.getDescription());
        return projectRepository.save(project);
    }
}
```

#### 3. Infrastructure Layer (External Systems)

**Purpose**: Implement interfaces, integrate external systems

**Components**:
- **Persistence**: JPA entities, repositories, mappers
- **Configuration**: Spring configuration classes
- **External**: External API clients, message queues, etc.

**Rules**:
- ✅ Implement domain repository interfaces
- ✅ Map between entities and domain models
- ✅ Handle database-specific concerns
- ❌ NO business logic (delegate to domain/application)

**Example**:
```java
// infrastructure/persistence/repository/ProjectRepositoryImpl.java
@Repository
public class ProjectRepositoryImpl implements ProjectRepository {
    private final ProjectJpaRepository jpaRepository;
    private final ProjectEntityMapper mapper;

    @Override
    public Project save(Project project) {
        ProjectEntity entity = mapper.toEntity(project);
        ProjectEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
```

#### 4. Presentation Layer (API)

**Purpose**: Handle HTTP requests, return responses

**Components**:
- **Controllers**: REST endpoints
- **DTOs**: Request/Response objects
- **Mappers**: DTO ↔ Domain model conversion
- **Exception Handlers**: Global error handling

**Rules**:
- ✅ Use application services via interfaces
- ✅ Convert between DTOs and domain models
- ✅ Return `ApiResponse<T>` wrapper
- ❌ NO business logic
- ❌ NO direct database access

**Example**:
```java
// presentation/controller/ProjectController.java
@RestController
@RequestMapping("/api/projects")
public class ProjectController extends BaseController {
    private final CreateProjectUseCase createProjectUseCase;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody CreateProjectRequest request) {
        Project project = createProjectUseCase.create(mapper.toCommand(request));
        return created(mapper.toResponse(project), "프로젝트 생성 완료");
    }
}
```

### Frontend Architecture Principles

#### Component Design

- **Single Responsibility**: One component, one purpose
- **Composition over Inheritance**: Build complex UIs from simple components
- **Props Down, Events Up**: Data flows down, events flow up
- **Controlled Components**: Form inputs controlled by React state

#### State Management (Zustand)

- **Single Store per Domain**: `projectStore`, `tableStore`, `toastStore`
- **Actions in Stores**: Async logic lives in store actions, not components
- **Store Composition**: Stores can call other stores (e.g., `projectStore` resets `tableStore`)
- **Optimistic Updates**: Update UI immediately, rollback on error

**Example**:
```typescript
// stores/projectStore.ts
interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectApi.fetchProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

#### API Integration

- **Centralized API Client**: All API calls go through `/lib/api.ts`
- **Axios Interceptors**: Request/response interceptors for auth, error handling
- **Automatic Error Handling**: Interceptor shows toast notifications
- **Success Toasts**: Built-in success messages for mutations

**Example**:
```typescript
// lib/api.ts
export const createProject = async (data: CreateProjectRequest): Promise<Project> => {
  const response = await apiClient.post<Project>('/projects', data);
  useToastStore.getState().success('프로젝트 생성 완료', `"${data.name}" 프로젝트가 생성되었습니다`);
  return response.data;
};
```

---

## Development Workflows

### Quick Start

#### Using Integrated Scripts (Recommended - Windows PowerShell)

```powershell
# 1. Setup environment (PostgreSQL + pgAdmin)
.\scripts\01-env-setup.ps1

# 2. Run application (backend + frontend)
.\scripts\02-run-app.ps1

# 3. Health check (100-point system check)
.\scripts\03-health-check.ps1

# Stop all services
.\scripts\env-stop.ps1

# Reset environment (delete all data)
.\scripts\env-reset.ps1
```

#### Manual Startup

**Backend**:
```bash
cd backend
./gradlew bootRunDev  # Runs on http://localhost:8080
```

**Frontend**:
```bash
cd frontend
yarn install
yarn dev  # Runs on http://localhost:3001
```

**Database**:
```bash
cd docker
docker-compose up -d
# PostgreSQL: localhost:5432
# pgAdmin: http://localhost:5050
```

### Adding a New Feature (Step-by-Step)

#### Backend Development Flow

1. **Create Domain Model** (if needed)
   ```java
   // domain/model/YourDomain.java
   public class YourDomain {
       private UUID id;
       private String name;
       // Business methods here
   }
   ```

2. **Create Repository Interface**
   ```java
   // domain/repository/YourDomainRepository.java
   public interface YourDomainRepository {
       YourDomain save(YourDomain domain);
       Optional<YourDomain> findById(UUID id);
   }
   ```

3. **Create Application Service**
   ```java
   // application/service/YourDomainService.java
   @Service
   @Transactional
   public class YourDomainService {
       private final YourDomainRepository repository;

       public YourDomain create(CreateCommand command) {
           // Orchestrate use case
       }
   }
   ```

4. **Implement Infrastructure**
   ```java
   // infrastructure/persistence/entity/YourDomainEntity.java
   @Entity
   @Table(name = "your_domains")
   public class YourDomainEntity { /* JPA entity */ }

   // infrastructure/persistence/repository/YourDomainJpaRepository.java
   public interface YourDomainJpaRepository extends JpaRepository<YourDomainEntity, UUID> { }

   // infrastructure/persistence/repository/YourDomainRepositoryImpl.java
   @Repository
   public class YourDomainRepositoryImpl implements YourDomainRepository { /* Implementation */ }
   ```

5. **Create API Layer**
   ```java
   // presentation/dto/request/CreateYourDomainRequest.java
   public record CreateYourDomainRequest(
       @NotBlank String name
   ) { }

   // presentation/controller/YourDomainController.java
   @RestController
   @RequestMapping("/api/your-domains")
   public class YourDomainController extends BaseController {
       // REST endpoints
   }
   ```

6. **Write Tests**
   ```java
   // src/test/java/.../YourDomainServiceTest.java (unit test)
   // src/test/java/.../YourDomainControllerIntegrationTest.java (integration test)
   ```

#### Frontend Development Flow

1. **Define Types**
   ```typescript
   // types/index.ts
   export interface YourDomain {
     id: string;
     name: string;
     createdAt: string;
   }

   export interface CreateYourDomainRequest {
     name: string;
   }
   ```

2. **Create API Client Functions**
   ```typescript
   // lib/api.ts
   export const createYourDomain = async (data: CreateYourDomainRequest): Promise<YourDomain> => {
     const response = await apiClient.post<YourDomain>('/your-domains', data);
     useToastStore.getState().success('생성 완료');
     return response.data;
   };
   ```

3. **Create Zustand Store**
   ```typescript
   // stores/yourDomainStore.ts
   interface YourDomainStore {
     items: YourDomain[];
     isLoading: boolean;
     fetchItems: () => Promise<void>;
     createItem: (data: CreateYourDomainRequest) => Promise<YourDomain>;
   }

   export const useYourDomainStore = create<YourDomainStore>((set) => ({
     // Implementation
   }));
   ```

4. **Create Components**
   ```typescript
   // components/your-domain/YourDomainList.tsx
   // components/your-domain/CreateYourDomainDialog.tsx
   ```

5. **Write Tests**
   ```typescript
   // components/your-domain/CreateYourDomainDialog.test.tsx
   ```

### Testing Workflow

#### Backend Tests

```bash
cd backend

# Run unit tests only
./gradlew test

# Run integration tests
./gradlew integrationTest

# Run all tests
./gradlew check

# Generate coverage report
./gradlew jacocoTestReport
# Report: build/reports/jacoco/test/html/index.html
```

**Test Structure**:
```java
@ExtendWith(MockitoExtension.class)
@DisplayName("프로젝트 서비스 테스트")
class ProjectServiceTest {
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    @DisplayName("프로젝트 생성 성공")
    void createProject_Success() {
        // Given
        // When
        // Then
    }
}
```

#### Frontend Tests

```bash
cd frontend

# Run unit tests (watch mode)
yarn test

# Run tests once
yarn test run

# Run with UI
yarn test:ui

# Run E2E tests
yarn test:e2e

# Type checking
yarn type-check

# Linting
yarn lint
```

**Test Structure**:
```typescript
describe('CreateProjectDialog', () => {
  it('should create project when form is submitted', async () => {
    // Given
    render(<CreateProjectDialog />);

    // When
    await userEvent.type(screen.getByLabelText('프로젝트명'), 'Test Project');
    await userEvent.click(screen.getByText('생성'));

    // Then
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ name: 'Test Project' });
    });
  });
});
```

### Database Migration Workflow

**IMPORTANT**: Never modify existing migration files!

```bash
cd backend

# Create new migration file
# File: src/main/resources/db/migration/V{VERSION}__description.sql
# Example: V4__add_user_preferences.sql

# Run migrations
./gradlew flywayMigrate

# Check migration status
./gradlew flywayInfo

# Validate migrations
./gradlew flywayValidate
```

**Migration File Example**:
```sql
-- V4__add_user_preferences.sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push -u origin feature/your-feature-name

# Create Pull Request
# (Use GitHub UI or gh CLI)
```

**Commit Message Convention**:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Add tests
- `docs:` Documentation
- `chore:` Maintenance tasks
- `style:` Code style changes

---

## Coding Conventions

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|----------|
| **Backend (Java)** |
| Classes | PascalCase | `ProjectService`, `TableEntity` |
| Methods/Variables | camelCase | `createProject`, `projectName` |
| Constants | UPPER_SNAKE_CASE | `MAX_NAME_LENGTH`, `API_BASE_PATH` |
| Packages | lowercase | `com.dbmodeling.domain.model` |
| **Frontend (TypeScript)** |
| Components | PascalCase | `CreateProjectDialog`, `TableList` |
| Functions/Variables | camelCase | `handleSubmit`, `selectedProject` |
| Hooks | `use` prefix | `useProjectStore`, `useDebounce` |
| Types/Interfaces | PascalCase | `Project`, `CreateProjectRequest` |
| Constants | UPPER_SNAKE_CASE | `MAX_TABLE_COUNT`, `API_BASE_URL` |
| **Database (PostgreSQL)** |
| Tables | snake_case | `projects`, `table_columns` |
| Columns | snake_case | `project_id`, `created_at` |
| **Domain (MSSQL)** |
| Tables | PascalCase | `User`, `OrderDetail` |
| Columns | snake_case | `user_id`, `order_date` |

### Backend File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Controller | `[Entity]Controller` | `ProjectController.java` |
| Service | `[Entity]Service` | `ProjectService.java` |
| Repository | `[Entity]Repository` | `ProjectRepository.java` |
| Entity | `[Entity]Entity` | `ProjectEntity.java` |
| DTO Request | `[Action][Entity]Request` | `CreateProjectRequest.java` |
| DTO Response | `[Entity]Response` | `ProjectResponse.java` |
| Exception | `[Type]Exception` | `ResourceNotFoundException.java` |
| Mapper | `[Entity]Mapper` | `ProjectEntityMapper.java` |

### Frontend File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Component | `[Feature][Type].tsx` | `CreateProjectDialog.tsx` |
| Hook | `use[Feature].ts` | `useProjectStore.ts` |
| Store | `[feature]Store.ts` | `projectStore.ts` |
| Test | `[Component].test.tsx` | `CreateProjectDialog.test.tsx` |
| Utility | `[feature].ts` | `errorHandler.ts` |

### Code Style Guidelines

#### Backend (Java)

```java
// Class structure order:
public class ProjectService {
    // 1. Constants
    private static final int MAX_NAME_LENGTH = 255;

    // 2. Fields (dependencies injected via constructor)
    private final ProjectRepository projectRepository;
    private final ValidationService validationService;

    // 3. Constructor
    public ProjectService(ProjectRepository projectRepository,
                         ValidationService validationService) {
        this.projectRepository = projectRepository;
        this.validationService = validationService;
    }

    // 4. Public methods (use cases)
    public Project createProject(CreateProjectCommand command) {
        // Implementation
    }

    // 5. Private helper methods
    private void validateProjectName(String name) {
        // Implementation
    }
}

// Use constructor injection (NOT field injection)
✅ Good:
public class ProjectService {
    private final ProjectRepository repository;

    public ProjectService(ProjectRepository repository) {
        this.repository = repository;
    }
}

❌ Bad:
public class ProjectService {
    @Autowired
    private ProjectRepository repository;
}

// Use records for immutable DTOs
public record CreateProjectRequest(
    @NotBlank String name,
    String description
) { }

// Use Optional for potentially absent values
public Optional<Project> findById(UUID id) {
    return projectRepository.findById(id);
}

// Logging format
log.info("Project created: id={}, name={}", project.getId(), project.getName());
log.error("Failed to create project", exception);
```

#### Frontend (TypeScript)

```typescript
// Component structure
export const CreateProjectDialog: React.FC = () => {
  // 1. Hooks (state, stores, etc.)
  const [isOpen, setIsOpen] = useState(false);
  const { createProject, isLoading } = useProjectStore();

  // 2. Event handlers
  const handleSubmit = async (data: CreateProjectRequest) => {
    await createProject(data);
    setIsOpen(false);
  };

  // 3. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 4. Render
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* JSX */}
    </Dialog>
  );
};

// Use const for components (NOT function)
✅ Good: export const MyComponent: React.FC = () => { };
❌ Bad: export function MyComponent() { }

// Type imports
import type { Project, Table } from '@/types';

// Path aliases
import { useProjectStore } from '@/stores/projectStore';
import { ProjectCard } from '@/components/projects/ProjectCard';

// Destructure props
✅ Good: const MyComponent = ({ name, onSave }: Props) => { };
❌ Bad: const MyComponent = (props: Props) => { const name = props.name; };

// Async handlers with proper error handling
const handleSave = async () => {
  try {
    await saveProject(data);
    // Success is handled by API interceptor
  } catch (error) {
    // Error is handled by API interceptor
    // Only handle specific errors here if needed
  }
};
```

### API Design Conventions

#### REST Endpoints

```
# Resource naming
GET    /api/projects              # List all
GET    /api/projects/{id}         # Get one
POST   /api/projects              # Create
PUT    /api/projects/{id}         # Update (full)
PATCH  /api/projects/{id}         # Update (partial)
DELETE /api/projects/{id}         # Delete

# Nested resources
GET    /api/projects/{id}/tables
POST   /api/projects/{id}/tables
GET    /api/tables/{id}
PUT    /api/tables/{id}
DELETE /api/tables/{id}

# Actions (non-CRUD)
POST   /api/projects/{id}/export
POST   /api/tables/{id}/validate
```

#### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Project Name"
  },
  "message": "프로젝트 생성 완료"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 유효하지 않습니다",
    "details": {
      "name": ["이름은 필수입니다", "이름은 100자 이하여야 합니다"]
    }
  }
}
```

#### HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| `200 OK` | Successful GET, PUT, PATCH | Get project details |
| `201 Created` | Successful POST | Create project |
| `204 No Content` | Successful DELETE | Delete project |
| `400 Bad Request` | Validation errors | Invalid input |
| `404 Not Found` | Resource not found | Project ID doesn't exist |
| `409 Conflict` | Duplicate data | Table name already exists |
| `500 Internal Server Error` | Server errors | Unexpected exception |
| `503 Service Unavailable` | Database connection failed | PostgreSQL down |

#### Validation

**Backend**:
```java
// Use Bean Validation on DTOs
public record CreateProjectRequest(
    @NotBlank(message = "프로젝트명은 필수입니다")
    @Size(max = 100, message = "프로젝트명은 100자 이하여야 합니다")
    String name,

    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    String description
) { }

// Controller validates with @Valid
@PostMapping
public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
        @Valid @RequestBody CreateProjectRequest request) {
    // ...
}
```

**Frontend**:
```typescript
// Use Zod for validation
const createProjectSchema = z.object({
  name: z.string()
    .min(1, '프로젝트명을 입력하세요')
    .max(100, '프로젝트명은 100자 이하여야 합니다'),
  description: z.string()
    .max(500, '설명은 500자 이하여야 합니다')
    .optional(),
});

// React Hook Form with zodResolver
const form = useForm<CreateProjectRequest>({
  resolver: zodResolver(createProjectSchema),
});
```

---

## Testing Guidelines

### Backend Testing

#### Unit Tests (Mockito)

**What to test**: Individual service methods in isolation

**Pattern**:
```java
@ExtendWith(MockitoExtension.class)
@DisplayName("프로젝트 서비스 테스트")
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ValidationService validationService;

    @InjectMocks
    private ProjectService projectService;

    @Test
    @DisplayName("프로젝트 생성 성공")
    void createProject_Success() {
        // Given
        CreateProjectCommand command = new CreateProjectCommand("Test Project", null);
        Project expectedProject = new Project("Test Project");
        when(projectRepository.save(any(Project.class))).thenReturn(expectedProject);

        // When
        Project result = projectService.createProject(command);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Project");
        verify(projectRepository, times(1)).save(any(Project.class));
        verify(validationService, times(1)).validateProjectName("Test Project");
    }

    @Test
    @DisplayName("프로젝트 생성 실패 - 중복 이름")
    void createProject_Fail_DuplicateName() {
        // Given
        CreateProjectCommand command = new CreateProjectCommand("Existing", null);
        when(projectRepository.existsByName("Existing")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> projectService.createProject(command))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("이미 존재하는 프로젝트명입니다");
    }
}
```

**Best Practices**:
- Use `@DisplayName` with Korean descriptions
- Follow Given-When-Then structure
- Use AssertJ fluent assertions (`assertThat`)
- Verify mock interactions with `verify()`
- Test both success and failure scenarios

#### Integration Tests

**What to test**: Full request-response cycle with real database

**Pattern**:
```java
@SpringBootTest
@AutoConfigureMockMvc
@Tag("integration")
@Transactional  // Rollback after each test
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("프로젝트 생성 API 테스트")
    void createProject_API_Success() throws Exception {
        // Given
        CreateProjectRequest request = new CreateProjectRequest("Test Project", "Description");
        String requestBody = objectMapper.writeValueAsString(request);

        // When & Then
        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Test Project"))
            .andExpect(jsonPath("$.data.description").value("Description"));
    }

    @Test
    @DisplayName("프로젝트 조회 API 테스트 - 존재하지 않는 ID")
    void getProject_NotFound() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/api/projects/{id}", nonExistentId))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }
}
```

**Best Practices**:
- Use `@Tag("integration")` to separate from unit tests
- Use `@Transactional` to rollback database changes
- Test full HTTP request/response cycle
- Test error scenarios (404, 400, etc.)
- Use `MockMvc` for HTTP testing

### Frontend Testing

#### Component Tests (Vitest + RTL)

**What to test**: User interactions, rendering, state changes

**Pattern**:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProjectDialog } from './CreateProjectDialog';

// Mock store
vi.mock('@/stores/projectStore', () => ({
  useProjectStore: () => ({
    createProject: vi.fn(),
    isLoading: false,
  }),
}));

describe('CreateProjectDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    // Given & When
    render(<CreateProjectDialog />);

    // Then
    expect(screen.getByText('새 프로젝트')).toBeInTheDocument();
    expect(screen.getByLabelText('프로젝트명')).toBeInTheDocument();
  });

  it('should call createProject when form is submitted', async () => {
    // Given
    const mockCreate = vi.fn();
    vi.mocked(useProjectStore).mockReturnValue({
      createProject: mockCreate,
      isLoading: false,
    });

    render(<CreateProjectDialog />);
    const user = userEvent.setup();

    // When
    await user.type(screen.getByLabelText('프로젝트명'), 'Test Project');
    await user.type(screen.getByLabelText('설명'), 'Test Description');
    await user.click(screen.getByText('생성'));

    // Then
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test Description',
      });
    });
  });

  it('should show validation error for empty name', async () => {
    // Given
    render(<CreateProjectDialog />);
    const user = userEvent.setup();

    // When
    await user.click(screen.getByText('생성'));

    // Then
    await waitFor(() => {
      expect(screen.getByText('프로젝트명을 입력하세요')).toBeInTheDocument();
    });
  });
});
```

**Best Practices**:
- Use `@testing-library/user-event` for user interactions
- Mock stores with `vi.mock()`
- Test user flows, not implementation details
- Use `waitFor()` for async assertions
- Test accessibility (use `getByRole`, `getByLabelText`)
- Clear mocks in `beforeEach`

#### Integration Tests

**What to test**: Full user flows across multiple components

**Pattern**:
```typescript
// test/integration/project-table-column-flow.test.tsx
describe('Project-Table-Column Flow', () => {
  it('should create project, add table, and add column', async () => {
    // Given
    render(<App />);
    const user = userEvent.setup();

    // When: Create project
    await user.click(screen.getByText('+ 새 프로젝트'));
    await user.type(screen.getByLabelText('프로젝트명'), 'E-Commerce');
    await user.click(screen.getByText('생성'));

    // Then: Project created
    await waitFor(() => {
      expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    });

    // When: Add table
    await user.click(screen.getByText('+ 새 테이블'));
    await user.type(screen.getByLabelText('테이블명'), 'User');
    await user.click(screen.getByText('추가'));

    // Then: Table created
    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    // When: Add column
    await user.click(screen.getByText('+ 컬럼 추가'));
    // ... add column steps
  });
});
```

#### E2E Tests (Playwright)

**What to test**: Critical user journeys in real browser

```typescript
import { test, expect } from '@playwright/test';

test('should complete full database modeling flow', async ({ page }) => {
  // 1. Navigate to app
  await page.goto('http://localhost:3001');

  // 2. Create project
  await page.click('text=+ 새 프로젝트');
  await page.fill('input[name="name"]', 'E-Commerce System');
  await page.click('button:has-text("생성")');
  await expect(page.locator('text=E-Commerce System')).toBeVisible();

  // 3. Add table
  await page.click('text=+ 새 테이블');
  await page.fill('input[name="name"]', 'User');
  await page.click('button:has-text("추가")');

  // 4. Add columns
  await page.click('text=+ 컬럼 추가');
  await page.fill('input[name="columnName"]', 'user_id');
  await page.selectOption('select[name="dataType"]', 'INT');
  await page.check('input[name="primaryKey"]');
  await page.click('button:has-text("저장")');

  // 5. Export SQL
  await page.click('text=SQL 내보내기');
  await expect(page.locator('text=CREATE TABLE User')).toBeVisible();
  await expect(page.locator('text=user_id INT PRIMARY KEY')).toBeVisible();
});
```

### Test Coverage Goals

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| Domain Services | 90%+ | Critical |
| Application Services | 80%+ | High |
| Controllers | 70%+ | Medium |
| Components | 70%+ | Medium |
| Utilities | 80%+ | High |

---

## Common Patterns

### Backend Patterns

#### Repository Pattern

```java
// Domain layer - Interface
public interface ProjectRepository {
    Project save(Project project);
    Optional<Project> findById(UUID id);
    List<Project> findAll();
    void delete(UUID id);
}

// Infrastructure layer - Implementation
@Repository
public class ProjectRepositoryImpl implements ProjectRepository {
    private final ProjectJpaRepository jpaRepository;
    private final ProjectEntityMapper mapper;

    @Override
    public Project save(Project project) {
        ProjectEntity entity = mapper.toEntity(project);
        ProjectEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
```

#### Mapper Pattern

```java
@Component
public class ProjectEntityMapper {
    public ProjectEntity toEntity(Project domain) {
        return ProjectEntity.builder()
            .id(domain.getId())
            .name(domain.getName())
            .description(domain.getDescription())
            .build();
    }

    public Project toDomain(ProjectEntity entity) {
        return new Project(
            entity.getId(),
            entity.getName(),
            entity.getDescription()
        );
    }
}
```

#### Exception Handling

```java
// Custom exception
public class BusinessException extends RuntimeException {
    private final String errorCode;

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}

// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("RESOURCE_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, List<String>> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.computeIfAbsent(error.getField(), k -> new ArrayList<>())
                  .add(error.getDefaultMessage());
        });
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.validationError(errors));
    }
}
```

#### AOP for Cross-Cutting Concerns

```java
@Configuration
@EnableAspectJAutoProxy
public class PerformanceMonitoringConfig {

    @Around("execution(* com.dbmodeling.presentation.controller..*(..))")
    public Object logControllerPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long duration = System.currentTimeMillis() - start;
            String methodName = joinPoint.getSignature().toShortString();
            log.debug("API completed: {} - {}ms", methodName, duration);
            if (duration > 500) {
                log.warn("Slow API detected: {} - {}ms", methodName, duration);
            }
        }
    }
}
```

### Frontend Patterns

#### Custom Hooks

```typescript
// useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const searchTerm = useDebounce(inputValue, 300);
```

#### Compound Component Pattern

```typescript
// Dialog compound component
export const Dialog = ({ children, ...props }: DialogProps) => {
  return <RadixDialog.Root {...props}>{children}</RadixDialog.Root>;
};

Dialog.Trigger = RadixDialog.Trigger;
Dialog.Content = RadixDialog.Content;
Dialog.Title = RadixDialog.Title;

// Usage
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Title</Dialog.Title>
    {/* Content */}
  </Dialog.Content>
</Dialog>
```

#### Error Boundary Pattern

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

#### Optimistic Updates

```typescript
// stores/projectStore.ts
export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],

  deleteProject: async (id: string) => {
    // Optimistic update
    const previousProjects = get().projects;
    set({ projects: previousProjects.filter(p => p.id !== id) });

    try {
      await projectApi.deleteProject(id);
      // Success - no need to update again
    } catch (error) {
      // Rollback on error
      set({ projects: previousProjects });
      throw error;
    }
  },
}));
```

---

## Pitfalls to Avoid

### Backend Pitfalls

❌ **DON'T: Mix layers**
```java
// BAD - Controller directly accessing repository
@RestController
public class ProjectController {
    @Autowired
    private ProjectRepository repository;  // ❌ Skip service layer
}
```

✅ **DO: Respect layer boundaries**
```java
// GOOD - Controller uses service
@RestController
public class ProjectController {
    private final ProjectService projectService;  // ✅ Use service layer
}
```

---

❌ **DON'T: Put business logic in infrastructure**
```java
// BAD - Business logic in repository implementation
@Repository
public class ProjectRepositoryImpl implements ProjectRepository {
    public Project save(Project project) {
        // ❌ Validation logic in infrastructure layer
        if (project.getName().length() > 100) {
            throw new ValidationException("Name too long");
        }
        return jpaRepository.save(mapper.toEntity(project));
    }
}
```

✅ **DO: Keep business logic in domain/application**
```java
// GOOD - Validation in domain or application layer
@Service
public class ProjectService {
    public Project createProject(CreateProjectCommand command) {
        // ✅ Business logic in application layer
        validateProjectName(command.getName());
        Project project = new Project(command.getName());
        return projectRepository.save(project);
    }
}
```

---

❌ **DON'T: Modify existing Flyway migrations**
```sql
-- V1__create_projects.sql (ALREADY APPLIED)
-- ❌ Never modify this file after it's been applied!
```

✅ **DO: Create new migration files**
```sql
-- V2__add_project_status.sql (NEW FILE)
-- ✅ Create new versioned migration
ALTER TABLE projects ADD COLUMN status VARCHAR(20);
```

---

❌ **DON'T: Return entities from controllers**
```java
// BAD
@GetMapping("/{id}")
public ProjectEntity getProject(@PathVariable UUID id) {
    return repository.findById(id);  // ❌ Exposing entity
}
```

✅ **DO: Return DTOs**
```java
// GOOD
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<ProjectResponse>> getProject(@PathVariable UUID id) {
    Project project = projectService.findById(id);
    return ok(mapper.toResponse(project));  // ✅ Return DTO
}
```

---

❌ **DON'T: Use field injection**
```java
// BAD
@Service
public class ProjectService {
    @Autowired  // ❌ Field injection
    private ProjectRepository repository;
}
```

✅ **DO: Use constructor injection**
```java
// GOOD
@Service
public class ProjectService {
    private final ProjectRepository repository;

    public ProjectService(ProjectRepository repository) {  // ✅ Constructor injection
        this.repository = repository;
    }
}
```

### Frontend Pitfalls

❌ **DON'T: Put API logic in components**
```typescript
// BAD
const CreateProjectDialog = () => {
  const handleSubmit = async (data) => {
    // ❌ API call directly in component
    const response = await axios.post('/api/projects', data);
    setProjects([...projects, response.data]);
  };
};
```

✅ **DO: Use stores for API calls**
```typescript
// GOOD
const CreateProjectDialog = () => {
  const { createProject } = useProjectStore();

  const handleSubmit = async (data) => {
    await createProject(data);  // ✅ Use store action
  };
};
```

---

❌ **DON'T: Handle errors in every component**
```typescript
// BAD
try {
  await createProject(data);
} catch (error) {
  // ❌ Manual error handling everywhere
  toast.error(error.message);
}
```

✅ **DO: Let interceptor handle errors**
```typescript
// GOOD - Interceptor handles errors automatically
await createProject(data);  // ✅ Error handling is automatic
```

---

❌ **DON'T: Use relative imports beyond 2 levels**
```typescript
// BAD
import { ProjectCard } from '../../../components/projects/ProjectCard';  // ❌
```

✅ **DO: Use path aliases**
```typescript
// GOOD
import { ProjectCard } from '@/components/projects/ProjectCard';  // ✅
```

---

❌ **DON'T: Forget to clean up effects**
```typescript
// BAD
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  // ❌ No cleanup - memory leak!
}, []);
```

✅ **DO: Always return cleanup function**
```typescript
// GOOD
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  return () => clearInterval(interval);  // ✅ Cleanup
}, []);
```

---

❌ **DON'T: Create circular dependencies between stores**
```typescript
// BAD
// projectStore.ts
import { useTableStore } from './tableStore';

// tableStore.ts
import { useProjectStore } from './projectStore';  // ❌ Circular dependency
```

✅ **DO: Use one-way dependencies**
```typescript
// GOOD
// projectStore.ts - can import tableStore
import { useTableStore } from './tableStore';  // ✅ One-way

// tableStore.ts - does NOT import projectStore
// ✅ No circular dependency
```

---

❌ **DON'T: Mutate state directly**
```typescript
// BAD
const projects = useProjectStore((state) => state.projects);
projects.push(newProject);  // ❌ Direct mutation
```

✅ **DO: Use immutable updates**
```typescript
// GOOD
set((state) => ({
  projects: [...state.projects, newProject]  // ✅ Immutable update
}));
```

### Database Pitfalls

❌ **DON'T: Use SELECT N+1 queries**
```java
// BAD - N+1 problem
@Query("SELECT p FROM ProjectEntity p")
List<ProjectEntity> findAll();  // ❌ Lazy loading causes N+1

// Later...
projects.forEach(p -> p.getTables());  // ❌ N queries for tables
```

✅ **DO: Use fetch joins**
```java
// GOOD - Fetch join
@Query("SELECT p FROM ProjectEntity p LEFT JOIN FETCH p.tables")
List<ProjectEntity> findAll();  // ✅ Single query with join
```

---

❌ **DON'T: Forget indexes on foreign keys**
```sql
-- BAD
CREATE TABLE table_columns (
    id UUID PRIMARY KEY,
    table_id UUID NOT NULL  -- ❌ No index on foreign key
);
```

✅ **DO: Add indexes on foreign keys**
```sql
-- GOOD
CREATE TABLE table_columns (
    id UUID PRIMARY KEY,
    table_id UUID NOT NULL
);
CREATE INDEX idx_columns_table_id ON table_columns(table_id);  -- ✅ Index
```

---

## Quick Reference

### Essential Commands

```bash
# Backend
cd backend
./gradlew bootRunDev              # Run backend (PostgreSQL)
./gradlew test                    # Unit tests
./gradlew integrationTest         # Integration tests
./gradlew build                   # Build JAR
./gradlew clean                   # Clean build

# Frontend
cd frontend
yarn dev                          # Run dev server
yarn test                         # Run tests
yarn test:ui                      # Vitest UI
yarn test:e2e                     # E2E tests
yarn build                        # Production build
yarn type-check                   # TypeScript check
yarn lint                         # ESLint

# Database
cd docker
docker-compose up -d              # Start PostgreSQL + pgAdmin
docker-compose down               # Stop services
docker-compose logs postgres      # View PostgreSQL logs

# Integrated (PowerShell)
.\scripts\01-env-setup.ps1        # Setup environment
.\scripts\02-run-app.ps1          # Run app
.\scripts\03-health-check.ps1     # Health check
.\scripts\env-stop.ps1            # Stop all
.\scripts\env-reset.ps1           # Reset data
```

### Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | - |
| Backend API | http://localhost:8080/api | - |
| Health Check | http://localhost:8080/api/health | - |
| Swagger UI | http://localhost:8080/api/swagger-ui.html | - |
| pgAdmin | http://localhost:5050 | admin@admin.com / admin |
| PostgreSQL | localhost:5432 | postgres / postgres |

### Key Domain Models

```typescript
// Project
interface Project {
  id: string;
  name: string;
  description?: string;
  namingRules?: NamingRules;
  tables: Table[];
  createdAt: string;
  updatedAt: string;
}

// Table
interface Table {
  id: string;
  projectId: string;
  name: string;
  koreanName?: string;
  description?: string;
  positionX: number;
  positionY: number;
  columns: Column[];
  indexes: Index[];
}

// Column
interface Column {
  id: string;
  tableId: string;
  name: string;
  koreanName?: string;
  dataType: MSSQLDataType;
  maxLength?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  primaryKey: boolean;
  identity: boolean;
  identitySeed?: number;
  identityIncrement?: number;
  defaultValue?: string;
  description?: string;
  orderIndex: number;
}
```

### MSSQL Data Types (27 types)

**Exact Numeric**: `BIT`, `TINYINT`, `SMALLINT`, `INT`, `BIGINT`, `DECIMAL`, `NUMERIC`, `MONEY`, `SMALLMONEY`

**Approximate Numeric**: `REAL`, `FLOAT`

**Date/Time**: `DATE`, `TIME`, `DATETIME`, `DATETIME2`, `SMALLDATETIME`, `DATETIMEOFFSET`

**Character**: `CHAR`, `VARCHAR`, `TEXT`

**Unicode**: `NCHAR`, `NVARCHAR`, `NTEXT`

**Binary**: `BINARY`, `VARBINARY`, `IMAGE`

**Other**: `UNIQUEIDENTIFIER`, `XML`

### Common Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `RESOURCE_NOT_FOUND` | Resource doesn't exist | 404 |
| `DUPLICATE_RESOURCE` | Resource already exists | 409 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `SERVICE_UNAVAILABLE` | Database connection failed | 503 |

### Performance Monitoring Thresholds

- **Slow API**: > 500ms
- **Slow Query**: > 500ms
- **Warning Log**: Automatic for slow operations

### File Locations Reference

| What | Where |
|------|-------|
| API Documentation | `API.md` |
| Development Guide | `DEVELOPMENT.md` |
| User README | `README.md` |
| Backend Source | `backend/src/main/java/com/dbmodeling/` |
| Frontend Source | `frontend/src/` |
| Backend Tests | `backend/src/test/java/` |
| Frontend Tests | `frontend/src/**/*.test.tsx` |
| Database Migrations | `backend/src/main/resources/db/migration/` |
| API Client | `frontend/src/lib/api.ts` |
| Error Handler | `frontend/src/lib/errorHandler.ts` |
| Type Definitions | `frontend/src/types/index.ts` |
| Stores | `frontend/src/stores/` |

---

## When Working on This Project

### Before Starting Work

1. ✅ Read this CLAUDE.md file thoroughly
2. ✅ Check `README.md` for project overview
3. ✅ Review `DEVELOPMENT.md` for setup instructions
4. ✅ Explore existing code in the relevant layer/component
5. ✅ Understand the Clean Architecture boundaries
6. ✅ Check existing tests for patterns

### While Working

1. ✅ Follow layer boundaries (don't skip layers)
2. ✅ Write tests for new code
3. ✅ Use existing patterns (don't invent new ones)
4. ✅ Keep naming conventions consistent
5. ✅ Add appropriate error handling
6. ✅ Update migrations (never modify existing ones)
7. ✅ Document complex logic with comments
8. ✅ Check performance impact of database queries

### Before Committing

1. ✅ Run tests: `./gradlew test` (backend), `yarn test` (frontend)
2. ✅ Check types: `yarn type-check` (frontend)
3. ✅ Run linter: `yarn lint` (frontend)
4. ✅ Verify no console errors/warnings
5. ✅ Test manually in browser
6. ✅ Write clear commit message
7. ✅ Review changes one more time

### When Stuck

1. Check this CLAUDE.md file
2. Review similar existing code
3. Check `DEVELOPMENT.md` for troubleshooting
4. Review test files for usage examples
5. Check `.kiro/specs/` for requirements
6. Ask user for clarification

---

## Version History

- **v1.0** (2025-11-15): Initial comprehensive guide created

---

**End of CLAUDE.md**

This guide is maintained for AI assistants working on this project. Keep it updated as the project evolves.
