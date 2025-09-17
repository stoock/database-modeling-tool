import { test, expect } from '@playwright/test';

/**
 * 실시간 검증 E2E 테스트
 * 
 * 이 테스트는 다음 시나리오를 검증합니다:
 * 1. 네이밍 규칙 검증
 * 2. 실시간 피드백
 * 3. 검증 결과 표시
 * 4. 오류 해결 가이드
 * 5. 자동 수정 제안
 */

test.describe('실시간 검증', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트용 프로젝트 생성 (엄격한 네이밍 규칙 포함)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("새 프로젝트 생성")');
    
    await page.fill('input[name="name"]', '검증 테스트 프로젝트');
    await page.fill('textarea[name="description"]', '실시간 검증 E2E 테스트용 프로젝트');
    
    // 엄격한 네이밍 규칙 설정
    await page.fill('input[name="tablePrefix"]', 'tbl_');
    await page.fill('input[name="tableSuffix"]', '_entity');
    await page.fill('input[name="tablePattern"]', '^[A-Z][a-zA-Z0-9]*$');
    await page.fill('input[name="columnPattern"]', '^[a-z][a-z0-9_]*$');
    await page.fill('input[name="indexPattern"]', '^IX_[A-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+$');
    await page.selectOption('select[name="enforceCase"]', 'PASCAL');
    
    await page.click('button:has-text("생성")');
    
    // 프로젝트 메인 페이지 확인
    await expect(page.locator('h2:has-text("프로젝트 개요")')).toBeVisible();
  });

  test('테이블명 실시간 검증', async ({ page }) => {
    // 1. 테이블 추가 모달 열기
    await page.click('button:has-text("테이블 추가")');
    
    // 2. 잘못된 테이블명 입력 (접두사 없음)
    await page.fill('input[name="tableName"]', 'User');
    
    // 실시간 검증 오류 메시지 확인
    await expect(page.locator('.text-red-600')).toBeVisible();
    await expect(page.locator('text=테이블명이 필수 접두사로 시작하지 않습니다')).toBeVisible();
    
    // 생성 버튼이 비활성화되었는지 확인
    await expect(page.locator('button:has-text("테이블 생성"):disabled')).toBeVisible();
    
    // 3. 접두사 추가하지만 접미사 없음
    await page.fill('input[name="tableName"]', 'tbl_User');
    
    await expect(page.locator('text=테이블명이 필수 접미사로 끝나지 않습니다')).toBeVisible();
    
    // 4. 접미사 추가하지만 케이스 규칙 위반
    await page.fill('input[name="tableName"]', 'tbl_user_entity');
    
    await expect(page.locator('text=테이블명이 PascalCase 규칙을 위반했습니다')).toBeVisible();
    
    // 5. 올바른 테이블명 입력
    await page.fill('input[name="tableName"]', 'tbl_User_entity');
    
    // 검증 성공 메시지 확인
    await expect(page.locator('.text-green-600')).toBeVisible();
    await expect(page.locator('text=테이블명이 네이밍 규칙을 준수합니다')).toBeVisible();
    
    // 생성 버튼이 활성화되었는지 확인
    await expect(page.locator('button:has-text("테이블 생성"):not(:disabled)')).toBeVisible();
    
    // 6. 테이블 생성
    await page.click('button:has-text("테이블 생성")');
    
    // 테이블이 성공적으로 생성되었는지 확인
    await expect(page.locator('text=tbl_User_entity')).toBeVisible();
  });

  test('컬럼명 실시간 검증', async ({ page }) => {
    // 테이블 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'tbl_Product_entity');
    await page.click('button:has-text("테이블 생성")');
    
    // 테이블 선택 및 컬럼 추가
    await page.click('text=tbl_Product_entity');
    await page.click('button:has-text("컬럼 추가")');
    
    // 1. 잘못된 컬럼명 입력 (PascalCase)
    await page.fill('input[name="columnName"]', 'ProductName');
    
    // 실시간 검증 오류 메시지 확인
    await expect(page.locator('.text-red-600')).toBeVisible();
    await expect(page.locator('text=컬럼명이 snake_case 규칙을 위반했습니다')).toBeVisible();
    
    // 2. 수정 제안 확인
    await expect(page.locator('text=제안: product_name')).toBeVisible();
    
    // 3. 제안 적용 버튼 클릭
    await page.click('button:has-text("제안 적용")');
    
    // 제안된 이름이 적용되었는지 확인
    await expect(page.locator('input[name="columnName"]')).toHaveValue('product_name');
    
    // 검증 성공 메시지 확인
    await expect(page.locator('.text-green-600')).toBeVisible();
    
    // 4. 컬럼 추가
    await page.selectOption('select[name="dataType"]', 'NVARCHAR');
    await page.fill('input[name="maxLength"]', '255');
    await page.click('button:has-text("컬럼 추가")');
    
    // 컬럼이 성공적으로 추가되었는지 확인
    await expect(page.locator('text=product_name')).toBeVisible();
  });

  test('인덱스명 실시간 검증', async ({ page }) => {
    // 테이블과 컬럼 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'tbl_Order_entity');
    await page.click('button:has-text("테이블 생성")');
    
    await page.click('text=tbl_Order_entity');
    
    // 컬럼 추가
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'customer_id');
    await page.selectOption('select[name="dataType"]', 'INT');
    await page.click('button:has-text("컬럼 추가")');
    
    // 인덱스 관리 탭으로 이동
    await page.click('button:has-text("인덱스 관리")');
    await page.click('button:has-text("인덱스 추가")');
    
    // 1. 잘못된 인덱스명 입력 (패턴 위반)
    await page.fill('input[name="indexName"]', 'idx_order_customer');
    
    // 실시간 검증 오류 메시지 확인
    await expect(page.locator('.text-red-600')).toBeVisible();
    await expect(page.locator('text=인덱스명이 네이밍 패턴을 위반했습니다')).toBeVisible();
    
    // 2. 수정 제안 확인
    await expect(page.locator('text=제안: IX_Order_CustomerId')).toBeVisible();
    
    // 3. 제안 적용
    await page.click('button:has-text("제안 적용")');
    
    // 제안된 이름이 적용되었는지 확인
    await expect(page.locator('input[name="indexName"]')).toHaveValue('IX_Order_CustomerId');
    
    // 검증 성공 메시지 확인
    await expect(page.locator('.text-green-600')).toBeVisible();
    
    // 4. 인덱스 생성
    await page.selectOption('select[name="columns"]', 'customer_id');
    await page.click('button:has-text("인덱스 생성")');
    
    // 인덱스가 성공적으로 생성되었는지 확인
    await expect(page.locator('text=IX_Order_CustomerId')).toBeVisible();
  });

  test('검증 대시보드 기능', async ({ page }) => {
    // 네이밍 규칙을 위반하는 여러 요소 생성
    
    // 1. 잘못된 테이블 생성 (규칙 무시하고 강제 생성)
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'user'); // 규칙 위반
    await page.check('input[name="ignoreValidation"]'); // 검증 무시 옵션
    await page.click('button:has-text("테이블 생성")');
    
    // 2. 잘못된 컬럼 추가
    await page.click('text=user');
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'UserName'); // 규칙 위반
    await page.selectOption('select[name="dataType"]', 'NVARCHAR');
    await page.check('input[name="ignoreValidation"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // 3. 검증 대시보드 확인
    await expect(page.locator('[data-testid="validation-dashboard"]')).toBeVisible();
    
    // 오류 카운트 확인
    await expect(page.locator('text=2개의 오류')).toBeVisible();
    
    // 4. 검증 결과 탭 클릭
    await page.click('button:has-text("검증 결과")');
    
    // 오류 목록 확인
    await expect(page.locator('text=테이블명 네이밍 규칙 위반')).toBeVisible();
    await expect(page.locator('text=컬럼명 네이밍 규칙 위반')).toBeVisible();
    
    // 5. 개별 오류 상세 정보 확인
    await page.click('button:has-text("상세 보기")').first();
    
    await expect(page.locator('text=위반된 규칙')).toBeVisible();
    await expect(page.locator('text=수정 제안')).toBeVisible();
    await expect(page.locator('text=영향도')).toBeVisible();
    
    // 6. 일괄 수정 기능
    await page.click('button:has-text("모든 제안 적용")');
    
    // 확인 다이얼로그
    await expect(page.locator('h3:has-text("일괄 수정 적용")')).toBeVisible();
    await page.click('button:has-text("적용")');
    
    // 7. 수정 후 재검증
    await page.click('button:has-text("지금 검증")');
    
    // 오류가 해결되었는지 확인
    await expect(page.locator('.text-green-600')).toBeVisible();
    await expect(page.locator('text=모든 네이밍 규칙을 준수합니다')).toBeVisible();
  });

  test('해결 가이드 기능', async ({ page }) => {
    // 1. 해결 가이드 탭 클릭
    await page.click('button:has-text("해결 가이드")');
    
    // 2. 가이드 섹션들 확인
    await expect(page.locator('h3:has-text("검증 오류 해결 가이드")')).toBeVisible();
    
    // 테이블 네이밍 규칙 섹션
    await expect(page.locator('text=테이블 네이밍 규칙')).toBeVisible();
    await page.click('text=테이블 네이밍 규칙');
    
    await expect(page.locator('text=올바른 예시')).toBeVisible();
    await expect(page.locator('text=tbl_User_entity')).toBeVisible();
    
    await expect(page.locator('text=잘못된 예시')).toBeVisible();
    await expect(page.locator('text=user, User, userTable')).toBeVisible();
    
    await expect(page.locator('text=유용한 팁')).toBeVisible();
    
    // 컬럼 네이밍 규칙 섹션
    await page.click('text=컬럼 네이밍 규칙');
    
    await expect(page.locator('text=snake_case 사용')).toBeVisible();
    await expect(page.locator('text=user_name, created_at')).toBeVisible();
    
    // 인덱스 네이밍 규칙 섹션
    await page.click('text=인덱스 네이밍 규칙');
    
    await expect(page.locator('text=IX_ 접두사 사용')).toBeVisible();
    await expect(page.locator('text=IX_User_Email, IX_Order_CustomerId')).toBeVisible();
    
    // 3. 일반적인 오류와 해결책 섹션
    await page.click('text=일반적인 오류와 해결책');
    
    await expect(page.locator('text=접두사/접미사 누락')).toBeVisible();
    await expect(page.locator('text=케이스 규칙 위반')).toBeVisible();
    await expect(page.locator('text=패턴 불일치')).toBeVisible();
    
    // 4. 베스트 프랙티스 섹션
    await page.click('text=베스트 프랙티스');
    
    await expect(page.locator('text=일관성 유지')).toBeVisible();
    await expect(page.locator('text=의미 있는 이름 사용')).toBeVisible();
    await expect(page.locator('text=약어 사용 지양')).toBeVisible();
  });

  test('자동 수정 제안 및 적용', async ({ page }) => {
    // 잘못된 테이블 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'product');
    await page.check('input[name="ignoreValidation"]');
    await page.click('button:has-text("테이블 생성")');
    
    // 검증 실행
    await page.click('button:has-text("지금 검증")');
    
    // 1. 수정 제안 확인
    await page.click('button:has-text("검증 결과")');
    
    const errorItem = page.locator('.bg-red-50').first();
    await expect(errorItem).toBeVisible();
    
    // 제안 보기 버튼 클릭
    await errorItem.locator('button:has-text("제안 보기")').click();
    
    // 2. 제안 내용 확인
    await expect(page.locator('text=수정 제안: tbl_Product_entity')).toBeVisible();
    await expect(page.locator('text=변경 사항:')).toBeVisible();
    await expect(page.locator('text=접두사 추가: tbl_')).toBeVisible();
    await expect(page.locator('text=접미사 추가: _entity')).toBeVisible();
    await expect(page.locator('text=케이스 변경: PascalCase')).toBeVisible();
    
    // 3. 영향도 분석 확인
    await expect(page.locator('text=영향도 분석')).toBeVisible();
    await expect(page.locator('text=관련 컬럼: 0개')).toBeVisible();
    await expect(page.locator('text=관련 인덱스: 0개')).toBeVisible();
    await expect(page.locator('text=관련 관계: 0개')).toBeVisible();
    
    // 4. 제안 적용
    await page.click('button:has-text("이 제안 적용하기")');
    
    // 확인 다이얼로그
    await expect(page.locator('h3:has-text("수정 제안 적용")')).toBeVisible();
    await expect(page.locator('text=product → tbl_Product_entity')).toBeVisible();
    
    await page.click('button:has-text("적용")');
    
    // 5. 적용 결과 확인
    await expect(page.locator('text=tbl_Product_entity')).toBeVisible();
    await expect(page.locator('text=product')).not.toBeVisible();
    
    // 6. 재검증으로 오류 해결 확인
    await page.click('button:has-text("지금 검증")');
    
    await expect(page.locator('.text-green-600')).toBeVisible();
    await expect(page.locator('text=검증 완료: 오류 없음')).toBeVisible();
  });

  test('실시간 검증 설정', async ({ page }) => {
    // 1. 검증 설정 페이지로 이동
    await page.click('button:has-text("검증 설정")');
    
    // 2. 실시간 검증 옵션 확인
    await expect(page.locator('h3:has-text("실시간 검증 설정")')).toBeVisible();
    
    // 자동 검증 활성화/비활성화
    const autoValidationToggle = page.locator('input[name="enableAutoValidation"]');
    await expect(autoValidationToggle).toBeChecked(); // 기본적으로 활성화
    
    // 3. 검증 빈도 설정
    await page.selectOption('select[name="validationFrequency"]', '1000'); // 1초마다
    
    // 4. 검증 범위 설정
    await page.check('input[name="validateTables"]');
    await page.check('input[name="validateColumns"]');
    await page.check('input[name="validateIndexes"]');
    await page.check('input[name="validateRelationships"]');
    
    // 5. 알림 설정
    await page.check('input[name="showNotifications"]');
    await page.selectOption('select[name="notificationLevel"]', 'error'); // 오류만 알림
    
    // 6. 설정 저장
    await page.click('button:has-text("설정 저장")');
    
    // 저장 확인 메시지
    await expect(page.locator('text=검증 설정이 저장되었습니다')).toBeVisible();
    
    // 7. 설정 적용 테스트
    await page.click('button:has-text("프로젝트로 돌아가기")');
    
    // 잘못된 테이블 생성 시도
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'invalid');
    
    // 실시간 검증이 즉시 작동하는지 확인 (1초 이내)
    await page.waitForSelector('.text-red-600', { timeout: 2000 });
    await expect(page.locator('text=테이블명이 네이밍 규칙을 위반했습니다')).toBeVisible();
  });

  test('검증 성능 및 대용량 데이터', async ({ page }) => {
    // 1. 많은 수의 테이블 생성 (성능 테스트)
    const tableCount = 10;
    
    for (let i = 1; i <= tableCount; i++) {
      await page.click('button:has-text("테이블 추가")');
      await page.fill('input[name="tableName"]', `table${i}`); // 의도적으로 잘못된 이름
      await page.check('input[name="ignoreValidation"]');
      await page.click('button:has-text("테이블 생성")');
    }
    
    // 2. 전체 검증 실행 및 성능 측정
    const startTime = Date.now();
    
    await page.click('button:has-text("지금 검증")');
    
    // 검증 완료 대기
    await page.waitForSelector('.text-red-600, .text-green-600', { timeout: 30000 });
    
    const endTime = Date.now();
    const validationTime = endTime - startTime;
    
    // 성능 확인 (30초 이내 완료)
    expect(validationTime).toBeLessThan(30000);
    
    // 3. 검증 결과 확인
    await page.click('button:has-text("검증 결과")');
    
    // 모든 테이블의 오류가 감지되었는지 확인
    const errorItems = page.locator('.bg-red-50');
    const errorCount = await errorItems.count();
    
    expect(errorCount).toBe(tableCount); // 각 테이블마다 하나씩 오류
    
    // 4. 일괄 수정 성능 테스트
    const batchFixStartTime = Date.now();
    
    await page.click('button:has-text("모든 제안 적용")');
    await page.click('button:has-text("적용")');
    
    // 일괄 수정 완료 대기
    await page.waitForSelector('.text-green-600', { timeout: 30000 });
    
    const batchFixEndTime = Date.now();
    const batchFixTime = batchFixEndTime - batchFixStartTime;
    
    // 일괄 수정 성능 확인 (30초 이내)
    expect(batchFixTime).toBeLessThan(30000);
    
    // 5. 최종 검증
    await page.click('button:has-text("지금 검증")');
    await expect(page.locator('text=모든 네이밍 규칙을 준수합니다')).toBeVisible();
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 실시간 검증 E2E 테스트 실행:
 *    yarn test:e2e validation.spec.ts
 * 
 * 2. 특정 테스트만 실행:
 *    yarn test:e2e validation.spec.ts -g "테이블명 실시간 검증"
 * 
 * 3. 헤드리스 모드로 실행:
 *    yarn test:e2e validation.spec.ts --headed
 * 
 * 4. 디버그 모드:
 *    yarn test:e2e validation.spec.ts --debug
 */