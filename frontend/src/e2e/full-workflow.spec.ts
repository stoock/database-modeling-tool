import { test, expect } from '@playwright/test';

/**
 * 전체 워크플로우 E2E 테스트
 * 
 * 이 테스트는 사용자가 실제로 사용할 수 있는 완전한 워크플로우를 검증합니다:
 * 1. 프로젝트 생성
 * 2. 테이블 생성 및 편집
 * 3. 컬럼 추가 및 관리
 * 4. 인덱스 생성
 * 5. 실시간 검증
 * 6. 스키마 내보내기
 */

test.describe('전체 워크플로우', () => {
  test('완전한 데이터베이스 모델링 워크플로우', async ({ page }) => {
    // 1. 애플리케이션 시작
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 2. 새 프로젝트 생성
    await page.click('button:has-text("새 프로젝트 생성")');
    
    await page.fill('input[name="name"]', '완전한 워크플로우 테스트');
    await page.fill('textarea[name="description"]', '사용자 관리 시스템 데이터베이스');
    
    // 네이밍 규칙 설정
    await page.fill('input[name="tablePrefix"]', 'tbl_');
    await page.fill('input[name="tablePattern"]', '^[A-Z][a-zA-Z0-9]*$');
    await page.fill('input[name="columnPattern"]', '^[a-z][a-z0-9_]*$');
    await page.fill('input[name="indexPattern"]', '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$');
    await page.selectOption('select[name="enforceCase"]', 'PASCAL');
    
    await page.click('button:has-text("생성")');
    
    // 프로젝트 생성 확인
    await expect(page.locator('h2:has-text("프로젝트 개요")')).toBeVisible();
    await expect(page.locator('text=완전한 워크플로우 테스트')).toBeVisible();
    
    // 3. 첫 번째 테이블 생성 (User 테이블)
    await page.click('button:has-text("테이블 추가")');
    
    await page.fill('input[name="tableName"]', 'tbl_User');
    await page.fill('textarea[name="tableDescription"]', '사용자 정보 테이블');
    await page.click('button:has-text("테이블 생성")');
    
    // 테이블이 캔버스에 표시되는지 확인
    await expect(page.locator('[data-testid="table-canvas"]')).toBeVisible();
    await expect(page.locator('text=tbl_User')).toBeVisible();
    
    // 4. User 테이블에 컬럼 추가
    await page.click('text=tbl_User'); // 테이블 선택
    await page.click('button:has-text("컬럼 추가")');
    
    // ID 컬럼 (기본키)
    await page.fill('input[name="columnName"]', 'id');
    await page.selectOption('select[name="dataType"]', 'INT');
    await page.check('input[name="isPrimaryKey"]');
    await page.check('input[name="isIdentity"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // name 컬럼
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'name');
    await page.selectOption('select[name="dataType"]', 'NVARCHAR');
    await page.fill('input[name="maxLength"]', '255');
    await page.uncheck('input[name="isNullable"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // email 컬럼
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'email');
    await page.selectOption('select[name="dataType"]', 'NVARCHAR');
    await page.fill('input[name="maxLength"]', '255');
    await page.check('input[name="isNullable"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // created_at 컬럼
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'created_at');
    await page.selectOption('select[name="dataType"]', 'DATETIME2');
    await page.uncheck('input[name="isNullable"]');
    await page.fill('input[name="defaultValue"]', 'GETDATE()');
    await page.click('button:has-text("컬럼 추가")');
    
    // 5. 두 번째 테이블 생성 (Order 테이블)
    await page.click('button:has-text("테이블 추가")');
    
    await page.fill('input[name="tableName"]', 'tbl_Order');
    await page.fill('textarea[name="tableDescription"]', '주문 정보 테이블');
    await page.click('button:has-text("테이블 생성")');
    
    // Order 테이블에 컬럼 추가
    await page.click('text=tbl_Order');
    
    // ID 컬럼
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'id');
    await page.selectOption('select[name="dataType"]', 'INT');
    await page.check('input[name="isPrimaryKey"]');
    await page.check('input[name="isIdentity"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // user_id 컬럼 (외래키)
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'user_id');
    await page.selectOption('select[name="dataType"]', 'INT');
    await page.uncheck('input[name="isNullable"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // order_date 컬럼
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'order_date');
    await page.selectOption('select[name="dataType"]', 'DATETIME2');
    await page.uncheck('input[name="isNullable"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // total_amount 컬럼
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'total_amount');
    await page.selectOption('select[name="dataType"]', 'DECIMAL');
    await page.fill('input[name="precision"]', '18');
    await page.fill('input[name="scale"]', '2');
    await page.uncheck('input[name="isNullable"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // 6. 인덱스 생성
    await page.click('text=tbl_User');
    await page.click('button:has-text("인덱스 관리")');
    
    // User 테이블의 email 컬럼에 유니크 인덱스 생성
    await page.click('button:has-text("인덱스 추가")');
    await page.fill('input[name="indexName"]', 'IX_User_Email');
    await page.selectOption('select[name="indexType"]', 'NONCLUSTERED');
    await page.check('input[name="isUnique"]');
    await page.selectOption('select[name="columns"]', 'email');
    await page.click('button:has-text("인덱스 생성")');
    
    // Order 테이블의 user_id 컬럼에 인덱스 생성
    await page.click('text=tbl_Order');
    await page.click('button:has-text("인덱스 관리")');
    
    await page.click('button:has-text("인덱스 추가")');
    await page.fill('input[name="indexName"]', 'IX_Order_UserId');
    await page.selectOption('select[name="indexType"]', 'NONCLUSTERED');
    await page.selectOption('select[name="columns"]', 'user_id');
    await page.click('button:has-text("인덱스 생성")');
    
    // 7. 실시간 검증 확인
    await expect(page.locator('[data-testid="validation-dashboard"]')).toBeVisible();
    
    // 검증 결과 탭 클릭
    await page.click('button:has-text("검증 결과")');
    
    // 검증 실행
    await page.click('button:has-text("지금 검증")');
    
    // 검증 결과 확인
    await page.waitForSelector('.bg-green-50, .bg-red-50', { timeout: 10000 });
    
    // 8. 네이밍 규칙 가이드 확인
    await page.click('button:has-text("해결 가이드")');
    await expect(page.locator('h3:has-text("검증 오류 해결 가이드")')).toBeVisible();
    
    // 가이드 섹션 확장
    if (await page.locator('text=테이블 네이밍 규칙').isVisible()) {
      await page.click('text=테이블 네이밍 규칙');
      await expect(page.locator('text=올바른 예시')).toBeVisible();
      await expect(page.locator('text=잘못된 예시')).toBeVisible();
      await expect(page.locator('text=유용한 팁')).toBeVisible();
    }
    
    // 9. 스키마 내보내기
    await page.click('text=스키마 내보내기');
    await page.waitForLoadState('networkidle');
    
    // 스키마 검증
    await page.click('button:has-text("스키마 검증")');
    await page.waitForSelector('.bg-green-50, .bg-red-50', { timeout: 10000 });
    
    // SQL 미리보기 확인
    await page.click('button:has-text("SQL")');
    await page.waitForSelector('pre', { timeout: 5000 });
    
    const sqlContent = await page.locator('pre').textContent();
    expect(sqlContent).toContain('CREATE TABLE [tbl_User]');
    expect(sqlContent).toContain('CREATE TABLE [tbl_Order]');
    expect(sqlContent).toContain('[id] INT IDENTITY(1,1) PRIMARY KEY');
    expect(sqlContent).toContain('[name] NVARCHAR(255) NOT NULL');
    expect(sqlContent).toContain('[email] NVARCHAR(255)');
    expect(sqlContent).toContain('CREATE NONCLUSTERED INDEX [IX_User_Email]');
    expect(sqlContent).toContain('CREATE NONCLUSTERED INDEX [IX_Order_UserId]');
    
    // 10. 다양한 형식으로 내보내기 테스트
    const formats = ['JSON', 'MARKDOWN', 'HTML', 'CSV'];
    
    for (const format of formats) {
      await page.click(`button:has-text("${format}")`);
      await page.waitForSelector('pre', { timeout: 5000 });
      
      const content = await page.locator('pre').textContent();
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
    }
    
    // 11. 파일 다운로드
    await page.click('button:has-text("SQL")');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("다운로드")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.sql$/);
    expect(download.suggestedFilename()).toContain('완전한_워크플로우_테스트');
    
    // 12. 내보내기 기록 확인
    await expect(page.locator('h3:has-text("내보내기 기록")')).toBeVisible();
    
    // 페이지 새로고침 후 기록 확인
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 기록이 저장되었는지 확인
    const historyItems = page.locator('.space-y-3 > div');
    if (await historyItems.count() > 0) {
      await expect(historyItems.first()).toBeVisible();
      await expect(historyItems.first().locator('text=SQL')).toBeVisible();
    }
    
    // 13. 스키마 문서화 확인
    await expect(page.locator('h3:has-text("스키마 문서화")')).toBeVisible();
    
    // 마크다운 문서 확인
    await page.click('button:has-text("마크다운")');
    const markdownContent = await page.locator('pre').last().textContent();
    expect(markdownContent).toContain('# 완전한 워크플로우 테스트');
    expect(markdownContent).toContain('## Tables');
    expect(markdownContent).toContain('### tbl_User');
    expect(markdownContent).toContain('### tbl_Order');
    
    // HTML 문서 확인
    await page.click('button:has-text("HTML")');
    const htmlContent = await page.locator('pre').last().textContent();
    expect(htmlContent).toContain('<html>');
    expect(htmlContent).toContain('<h1>완전한 워크플로우 테스트</h1>');
    expect(htmlContent).toContain('<h3>tbl_User</h3>');
    expect(htmlContent).toContain('<h3>tbl_Order</h3>');
    
    // 14. 프로젝트로 돌아가기
    await page.click('text=프로젝트로 돌아가기');
    
    // 최종 확인: 생성된 모든 요소들이 표시되는지 확인
    await expect(page.locator('h2:has-text("프로젝트 개요")')).toBeVisible();
    await expect(page.locator('text=완전한 워크플로우 테스트')).toBeVisible();
    
    // 통계 확인
    await expect(page.locator('text=2').first()).toBeVisible(); // 테이블 수
    await expect(page.locator('text=8')).toBeVisible(); // 총 컬럼 수 (4 + 4)
    await expect(page.locator('text=2').last()).toBeVisible(); // 인덱스 수
    
    // 테이블 캔버스에 두 테이블이 모두 표시되는지 확인
    await expect(page.locator('text=tbl_User')).toBeVisible();
    await expect(page.locator('text=tbl_Order')).toBeVisible();
  });

  test('오류 상황 처리 워크플로우', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 1. 잘못된 네이밍 규칙으로 프로젝트 생성
    await page.click('button:has-text("새 프로젝트 생성")');
    
    await page.fill('input[name="name"]', '오류 테스트 프로젝트');
    await page.fill('input[name="tablePattern"]', '^[a-z][a-z0-9_]*$'); // 소문자 패턴
    await page.fill('input[name="columnPattern"]', '^[A-Z][a-zA-Z0-9]*$'); // 대문자 패턴
    await page.selectOption('select[name="enforceCase"]', 'SNAKE');
    
    await page.click('button:has-text("생성")');
    
    // 2. 네이밍 규칙을 위반하는 테이블 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'UserTable'); // 패턴 위반 (PascalCase)
    await page.click('button:has-text("테이블 생성")');
    
    // 3. 실시간 검증에서 오류 확인
    await expect(page.locator('[data-testid="validation-dashboard"]')).toBeVisible();
    
    // 검증 실행
    await page.click('button:has-text("지금 검증")');
    await page.waitForSelector('.bg-red-50', { timeout: 10000 });
    
    // 오류 메시지 확인
    await expect(page.locator('text=네이밍 규칙 위반')).toBeVisible();
    
    // 4. 해결 가이드 확인
    await page.click('button:has-text("해결 가이드")');
    await expect(page.locator('text=검증 오류 해결 가이드')).toBeVisible();
    
    // 5. 제안된 수정사항 적용
    await page.click('button:has-text("검증 결과")');
    
    // 제안 보기 클릭 (있는 경우)
    if (await page.locator('button:has-text("제안 보기")').isVisible()) {
      await page.click('button:has-text("제안 보기")');
      
      // 제안 적용 버튼 클릭 (있는 경우)
      if (await page.locator('button:has-text("이 제안 적용하기")').isVisible()) {
        await page.click('button:has-text("이 제안 적용하기")');
      }
    }
    
    // 6. 스키마 내보내기에서 오류 상황 확인
    await page.click('text=스키마 내보내기');
    
    // 스키마 검증 시 오류 표시 확인
    await page.click('button:has-text("스키마 검증")');
    await page.waitForSelector('.bg-red-50', { timeout: 10000 });
    
    await expect(page.locator('text=개의 오류가 있습니다')).toBeVisible();
    await expect(page.locator('text=내보내기 전에 오류를 수정하는 것을 권장합니다')).toBeVisible();
    
    // 7. 오류가 있어도 내보내기는 가능한지 확인
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("다운로드")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.sql$/);
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 전체 워크플로우 테스트 실행:
 *    yarn test:e2e full-workflow.spec.ts
 * 
 * 2. 특정 테스트만 실행:
 *    yarn test:e2e full-workflow.spec.ts -g "완전한 데이터베이스 모델링"
 * 
 * 3. 헤드리스 모드로 실행:
 *    yarn test:e2e full-workflow.spec.ts --headed
 * 
 * 4. 슬로우 모션으로 실행 (디버깅용):
 *    yarn test:e2e full-workflow.spec.ts --headed --slowMo=1000
 */