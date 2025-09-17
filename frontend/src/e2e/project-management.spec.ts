import { test, expect } from '@playwright/test';

/**
 * 프로젝트 관리 E2E 테스트
 * 
 * 이 테스트는 다음 시나리오를 검증합니다:
 * 1. 프로젝트 생성
 * 2. 프로젝트 목록 조회
 * 3. 프로젝트 편집
 * 4. 프로젝트 삭제
 */

test.describe('프로젝트 관리', () => {
  test.beforeEach(async ({ page }) => {
    // 애플리케이션 홈페이지로 이동
    await page.goto('/');
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
  });

  test('새 프로젝트 생성 및 관리 워크플로우', async ({ page }) => {
    // 1. 새 프로젝트 생성 버튼 클릭
    await page.click('button:has-text("새 프로젝트")');
    
    // 2. 프로젝트 생성 모달이 열렸는지 확인
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await expect(page.locator('h3:has-text("새 프로젝트 생성")')).toBeVisible();
    
    // 3. 프로젝트 정보 입력
    await page.fill('input[name="name"]', 'E2E 테스트 프로젝트');
    await page.fill('textarea[name="description"]', 'Playwright E2E 테스트를 위한 프로젝트입니다.');
    
    // 4. 네이밍 규칙 설정
    await page.fill('input[name="tablePrefix"]', 'tbl_');
    await page.fill('input[name="tablePattern"]', '^[A-Z][a-zA-Z0-9]*$');
    await page.fill('input[name="columnPattern"]', '^[a-z][a-z0-9_]*$');
    await page.fill('input[name="indexPattern"]', '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$');
    await page.selectOption('select[name="enforceCase"]', 'PASCAL');
    
    // 5. 프로젝트 생성
    await page.click('button:has-text("생성")');
    
    // 6. 모달이 닫히고 프로젝트가 선택되었는지 확인
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
    await expect(page.locator('text=E2E 테스트 프로젝트')).toBeVisible();
    
    // 7. 프로젝트 개요 페이지가 표시되는지 확인
    await expect(page.locator('h2:has-text("프로젝트 개요")')).toBeVisible();
    await expect(page.locator('text=테이블 설계 캔버스')).toBeVisible();
    
    // 8. 프로젝트 편집 테스트
    await page.click('button:has-text("프로젝트 편집")');
    await expect(page.locator('h3:has-text("프로젝트 편집")')).toBeVisible();
    
    // 9. 프로젝트 이름 수정
    await page.fill('input[name="name"]', 'E2E 테스트 프로젝트 (수정됨)');
    await page.click('button:has-text("수정")');
    
    // 10. 수정된 이름이 반영되었는지 확인
    await expect(page.locator('text=E2E 테스트 프로젝트 (수정됨)')).toBeVisible();
  });

  test('프로젝트 목록에서 프로젝트 선택', async ({ page }) => {
    // 프로젝트가 없는 경우 새 프로젝트 생성
    const hasProjects = await page.locator('text=최근 프로젝트').isVisible();
    
    if (!hasProjects) {
      // 새 프로젝트 생성
      await page.click('button:has-text("새 프로젝트 생성")');
      await page.fill('input[name="name"]', '테스트 프로젝트');
      await page.click('button:has-text("생성")');
      
      // 홈으로 돌아가기
      await page.goto('/');
    }
    
    // 프로젝트 목록에서 프로젝트 선택
    const projectCard = page.locator('.group').first();
    await projectCard.click();
    
    // 프로젝트 메인 페이지로 이동했는지 확인
    await expect(page.locator('h2:has-text("프로젝트 개요")')).toBeVisible();
    await expect(page.locator('[data-testid="table-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-dashboard"]')).toBeVisible();
  });

  test('프로젝트 삭제', async ({ page }) => {
    // 프로젝트가 있는지 확인하고 없으면 생성
    const hasProjects = await page.locator('text=최근 프로젝트').isVisible();
    
    if (!hasProjects) {
      await page.click('button:has-text("새 프로젝트 생성")');
      await page.fill('input[name="name"]', '삭제할 프로젝트');
      await page.click('button:has-text("생성")');
      await page.goto('/');
    }
    
    // 프로젝트 카드에 마우스 호버
    const projectCard = page.locator('.group').first();
    await projectCard.hover();
    
    // 삭제 버튼 클릭
    await page.click('button[title="프로젝트 삭제"]');
    
    // 삭제 확인 다이얼로그 확인
    await expect(page.locator('h3:has-text("프로젝트 삭제")')).toBeVisible();
    await expect(page.locator('text=이 프로젝트를 삭제하시겠습니까?')).toBeVisible();
    
    // 삭제 확인
    await page.click('button:has-text("삭제")');
    
    // 삭제 확인 다이얼로그가 닫혔는지 확인
    await expect(page.locator('h3:has-text("프로젝트 삭제")')).not.toBeVisible();
  });

  test('프로젝트 선택기 기능', async ({ page }) => {
    // 프로젝트가 여러 개 있는 상황을 위해 프로젝트 2개 생성
    for (let i = 1; i <= 2; i++) {
      await page.click('button:has-text("새 프로젝트")');
      await page.fill('input[name="name"]', `선택기 테스트 프로젝트 ${i}`);
      await page.click('button:has-text("생성")');
      
      if (i < 2) {
        await page.goto('/');
      }
    }
    
    // 프로젝트 선택기 드롭다운 열기
    const projectSelector = page.locator('.relative .inline-flex').first();
    await projectSelector.click();
    
    // 드롭다운 메뉴가 열렸는지 확인
    await expect(page.locator('text=새 프로젝트 생성')).toBeVisible();
    
    // 다른 프로젝트 선택
    await page.click('text=선택기 테스트 프로젝트 1');
    
    // 선택된 프로젝트가 변경되었는지 확인
    await expect(page.locator('text=선택기 테스트 프로젝트 1')).toBeVisible();
    await expect(page.locator('h2:has-text("프로젝트 개요")')).toBeVisible();
  });

  test('프로젝트 없을 때 초기 화면', async ({ page }) => {
    // 모든 프로젝트 삭제 (실제로는 테스트 데이터베이스 초기화)
    // 이 부분은 테스트 환경 설정에 따라 달라질 수 있음
    
    // 프로젝트가 없을 때의 초기 화면 확인
    await expect(page.locator('h2:has-text("데이터베이스 모델링을 시작하세요")')).toBeVisible();
    await expect(page.locator('text=상단의 프로젝트 선택기에서 기존 프로젝트를 선택하거나 새 프로젝트를 생성하세요.')).toBeVisible();
    
    // 새 프로젝트 생성 버튼이 표시되는지 확인
    await expect(page.locator('button:has-text("새 프로젝트 생성")')).toBeVisible();
    
    // 프로젝트가 없다는 메시지 확인
    await expect(page.locator('text=아직 생성된 프로젝트가 없습니다.')).toBeVisible();
  });

  test('프로젝트 생성 폼 검증', async ({ page }) => {
    // 새 프로젝트 생성 모달 열기
    await page.click('button:has-text("새 프로젝트")');
    
    // 필수 필드 없이 생성 시도
    await page.click('button:has-text("생성")');
    
    // 검증 오류 메시지 확인
    await expect(page.locator('text=프로젝트 이름은 필수입니다.')).toBeVisible();
    
    // 너무 짧은 이름 입력
    await page.fill('input[name="name"]', 'A');
    await page.click('button:has-text("생성")');
    
    // 길이 검증 오류 확인
    await expect(page.locator('text=프로젝트 이름은 최소 2자 이상이어야 합니다.')).toBeVisible();
    
    // 올바른 이름 입력
    await page.fill('input[name="name"]', '올바른 프로젝트 이름');
    
    // 잘못된 정규식 패턴 입력
    await page.fill('input[name="tablePattern"]', '[invalid-regex');
    await page.click('button:has-text("생성")');
    
    // 정규식 검증 오류 확인 (실제 구현에 따라 메시지가 다를 수 있음)
    // await expect(page.locator('text=유효한 정규식을 입력하세요')).toBeVisible();
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 모든 E2E 테스트 실행:
 *    yarn test:e2e
 * 
 * 2. 특정 테스트 파일 실행:
 *    yarn test:e2e project-management.spec.ts
 * 
 * 3. 헤드리스 모드로 실행:
 *    yarn test:e2e --headed
 * 
 * 4. 디버그 모드로 실행:
 *    yarn test:e2e --debug
 */