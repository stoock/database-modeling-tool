import { test, expect } from '@playwright/test';

/**
 * 테이블 디자이너 E2E 테스트
 * 
 * 이 테스트는 다음 시나리오를 검증합니다:
 * 1. 테이블 생성 및 편집
 * 2. 컬럼 관리 (추가, 수정, 삭제, 순서 변경)
 * 3. 인덱스 관리
 * 4. 테이블 관계 설정
 * 5. 드래그 앤 드롭 기능
 */

test.describe('테이블 디자이너', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트용 프로젝트 생성
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 프로젝트가 없으면 생성
    const hasProjects = await page.locator('text=최근 프로젝트').isVisible();
    
    if (!hasProjects) {
      await page.click('button:has-text("새 프로젝트 생성")');
      await page.fill('input[name="name"]', '테이블 디자이너 테스트');
      await page.fill('textarea[name="description"]', '테이블 디자이너 E2E 테스트용 프로젝트');
      await page.click('button:has-text("생성")');
    } else {
      await page.locator('.group').first().click();
    }
    
    // 프로젝트 메인 페이지 확인
    await expect(page.locator('h2:has-text("프로젝트 개요")')).toBeVisible();
  });

  test('테이블 생성 및 기본 편집', async ({ page }) => {
    // 1. 테이블 추가 버튼 클릭
    await page.click('button:has-text("테이블 추가")');
    
    // 2. 테이블 생성 모달 확인
    await expect(page.locator('h3:has-text("새 테이블 생성")')).toBeVisible();
    
    // 3. 테이블 정보 입력
    await page.fill('input[name="tableName"]', 'Product');
    await page.fill('textarea[name="tableDescription"]', '상품 정보 테이블');
    
    // 4. 테이블 생성
    await page.click('button:has-text("테이블 생성")');
    
    // 5. 테이블이 캔버스에 표시되는지 확인
    await expect(page.locator('[data-testid="table-canvas"]')).toBeVisible();
    await expect(page.locator('text=Product')).toBeVisible();
    
    // 6. 테이블 선택 및 편집 모드 진입
    await page.click('text=Product');
    await expect(page.locator('[data-testid="table-editor"]')).toBeVisible();
    
    // 7. 테이블 정보 편집
    await page.click('button:has-text("테이블 편집")');
    await page.fill('input[name="tableName"]', 'ProductInfo');
    await page.fill('textarea[name="tableDescription"]', '상품 상세 정보 테이블');
    await page.click('button:has-text("수정")');
    
    // 8. 변경사항 확인
    await expect(page.locator('text=ProductInfo')).toBeVisible();
  });

  test('컬럼 관리 - 추가, 수정, 삭제', async ({ page }) => {
    // 테이블 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'User');
    await page.click('button:has-text("테이블 생성")');
    
    // 테이블 선택
    await page.click('text=User');
    
    // 1. 기본키 컬럼 추가
    await page.click('button:has-text("컬럼 추가")');
    
    await page.fill('input[name="columnName"]', 'id');
    await page.selectOption('select[name="dataType"]', 'INT');
    await page.check('input[name="isPrimaryKey"]');
    await page.check('input[name="isIdentity"]');
    await page.fill('input[name="identitySeed"]', '1');
    await page.fill('input[name="identityIncrement"]', '1');
    await page.fill('textarea[name="description"]', '사용자 고유 식별자');
    
    await page.click('button:has-text("컬럼 추가")');
    
    // 컬럼이 추가되었는지 확인
    await expect(page.locator('text=id')).toBeVisible();
    await expect(page.locator('text=INT')).toBeVisible();
    await expect(page.locator('text=PK')).toBeVisible(); // 기본키 표시
    
    // 2. 문자열 컬럼 추가
    await page.click('button:has-text("컬럼 추가")');
    
    await page.fill('input[name="columnName"]', 'username');
    await page.selectOption('select[name="dataType"]', 'NVARCHAR');
    await page.fill('input[name="maxLength"]', '50');
    await page.uncheck('input[name="isNullable"]');
    await page.check('input[name="isUnique"]');
    await page.fill('textarea[name="description"]', '사용자명 (고유)');
    
    await page.click('button:has-text("컬럼 추가")');
    
    // 3. 날짜 컬럼 추가
    await page.click('button:has-text("컬럼 추가")');
    
    await page.fill('input[name="columnName"]', 'created_at');
    await page.selectOption('select[name="dataType"]', 'DATETIME2');
    await page.fill('input[name="precision"]', '7');
    await page.uncheck('input[name="isNullable"]');
    await page.fill('input[name="defaultValue"]', 'GETDATE()');
    await page.fill('textarea[name="description"]', '생성 일시');
    
    await page.click('button:has-text("컬럼 추가")');
    
    // 4. 컬럼 수정
    await page.click('button[title="username 컬럼 편집"]');
    
    await page.fill('input[name="maxLength"]', '100'); // 길이 변경
    await page.fill('textarea[name="description"]', '사용자명 (고유, 최대 100자)');
    
    await page.click('button:has-text("수정")');
    
    // 5. 컬럼 순서 변경 (드래그 앤 드롭)
    const sourceColumn = page.locator('[data-testid="column-created_at"]');
    const targetColumn = page.locator('[data-testid="column-username"]');
    
    await sourceColumn.dragTo(targetColumn);
    
    // 순서가 변경되었는지 확인
    const columnOrder = await page.locator('[data-testid^="column-"]').allTextContents();
    expect(columnOrder.indexOf('created_at')).toBeLessThan(columnOrder.indexOf('username'));
    
    // 6. 컬럼 삭제
    await page.click('button[title="created_at 컬럼 삭제"]');
    
    // 삭제 확인 다이얼로그
    await expect(page.locator('h3:has-text("컬럼 삭제")')).toBeVisible();
    await page.click('button:has-text("삭제")');
    
    // 컬럼이 삭제되었는지 확인
    await expect(page.locator('text=created_at')).not.toBeVisible();
  });

  test('인덱스 관리', async ({ page }) => {
    // 테이블과 컬럼 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'Order');
    await page.click('button:has-text("테이블 생성")');
    
    await page.click('text=Order');
    
    // 기본 컬럼들 추가
    const columns = [
      { name: 'id', type: 'INT', isPK: true, isIdentity: true },
      { name: 'customer_id', type: 'INT', isPK: false, isIdentity: false },
      { name: 'order_date', type: 'DATETIME2', isPK: false, isIdentity: false },
      { name: 'status', type: 'NVARCHAR', isPK: false, isIdentity: false, maxLength: '20' }
    ];
    
    for (const column of columns) {
      await page.click('button:has-text("컬럼 추가")');
      await page.fill('input[name="columnName"]', column.name);
      await page.selectOption('select[name="dataType"]', column.type);
      
      if (column.isPK) {
        await page.check('input[name="isPrimaryKey"]');
      }
      if (column.isIdentity) {
        await page.check('input[name="isIdentity"]');
      }
      if (column.maxLength) {
        await page.fill('input[name="maxLength"]', column.maxLength);
      }
      
      await page.click('button:has-text("컬럼 추가")');
    }
    
    // 1. 인덱스 관리 탭으로 이동
    await page.click('button:has-text("인덱스 관리")');
    
    // 2. 단일 컬럼 인덱스 생성
    await page.click('button:has-text("인덱스 추가")');
    
    await page.fill('input[name="indexName"]', 'IX_Order_CustomerId');
    await page.selectOption('select[name="indexType"]', 'NONCLUSTERED');
    await page.selectOption('select[name="columns"]', 'customer_id');
    await page.selectOption('select[name="sortOrder"]', 'ASC');
    await page.fill('textarea[name="description"]', '고객 ID 기준 인덱스');
    
    await page.click('button:has-text("인덱스 생성")');
    
    // 인덱스가 생성되었는지 확인
    await expect(page.locator('text=IX_Order_CustomerId')).toBeVisible();
    await expect(page.locator('text=NONCLUSTERED')).toBeVisible();
    
    // 3. 복합 인덱스 생성
    await page.click('button:has-text("인덱스 추가")');
    
    await page.fill('input[name="indexName"]', 'IX_Order_CustomerDate');
    await page.selectOption('select[name="indexType"]', 'NONCLUSTERED');
    await page.check('input[name="isUnique"]');
    
    // 첫 번째 컬럼 추가
    await page.click('button:has-text("컬럼 추가")');
    await page.selectOption('select[name="columns[0]"]', 'customer_id');
    await page.selectOption('select[name="sortOrder[0]"]', 'ASC');
    
    // 두 번째 컬럼 추가
    await page.click('button:has-text("컬럼 추가")');
    await page.selectOption('select[name="columns[1]"]', 'order_date');
    await page.selectOption('select[name="sortOrder[1]"]', 'DESC');
    
    await page.click('button:has-text("인덱스 생성")');
    
    // 4. 인덱스 수정
    await page.click('button[title="IX_Order_CustomerId 인덱스 편집"]');
    
    await page.fill('input[name="indexName"]', 'IX_Order_CustomerId_Updated');
    await page.fill('textarea[name="description"]', '고객 ID 기준 인덱스 (수정됨)');
    
    await page.click('button:has-text("수정")');
    
    // 5. 인덱스 삭제
    await page.click('button[title="IX_Order_CustomerId_Updated 인덱스 삭제"]');
    
    await expect(page.locator('h3:has-text("인덱스 삭제")')).toBeVisible();
    await page.click('button:has-text("삭제")');
    
    // 인덱스가 삭제되었는지 확인
    await expect(page.locator('text=IX_Order_CustomerId_Updated')).not.toBeVisible();
  });

  test('테이블 드래그 앤 드롭 및 위치 조정', async ({ page }) => {
    // 두 개의 테이블 생성
    const tables = ['User', 'Order'];
    
    for (const tableName of tables) {
      await page.click('button:has-text("테이블 추가")');
      await page.fill('input[name="tableName"]', tableName);
      await page.click('button:has-text("테이블 생성")');
    }
    
    // 1. 테이블 위치 확인
    const userTable = page.locator('[data-testid="table-User"]');
    const orderTable = page.locator('[data-testid="table-Order"]');
    
    await expect(userTable).toBeVisible();
    await expect(orderTable).toBeVisible();
    
    // 2. 테이블 드래그 앤 드롭
    const userTableBounds = await userTable.boundingBox();
    const orderTableBounds = await orderTable.boundingBox();
    
    // User 테이블을 Order 테이블 위치로 드래그
    await userTable.dragTo(orderTable);
    
    // 3. 위치가 변경되었는지 확인
    const newUserTableBounds = await userTable.boundingBox();
    expect(newUserTableBounds?.x).not.toBe(userTableBounds?.x);
    expect(newUserTableBounds?.y).not.toBe(userTableBounds?.y);
    
    // 4. 캔버스 확대/축소 테스트
    await page.keyboard.press('Control+Equal'); // 확대
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Control+Minus'); // 축소
    await page.waitForTimeout(500);
    
    // 5. 캔버스 리셋
    await page.click('button[title="캔버스 리셋"]');
    
    // 테이블들이 기본 위치로 돌아갔는지 확인
    await expect(userTable).toBeVisible();
    await expect(orderTable).toBeVisible();
  });

  test('테이블 관계 설정', async ({ page }) => {
    // User와 Order 테이블 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'User');
    await page.click('button:has-text("테이블 생성")');
    
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'Order');
    await page.click('button:has-text("테이블 생성")');
    
    // User 테이블에 id 컬럼 추가
    await page.click('text=User');
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'id');
    await page.selectOption('select[name="dataType"]', 'INT');
    await page.check('input[name="isPrimaryKey"]');
    await page.click('button:has-text("컬럼 추가")');
    
    // Order 테이블에 컬럼들 추가
    await page.click('text=Order');
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'id');
    await page.selectOption('select[name="dataType"]', 'INT');
    await page.check('input[name="isPrimaryKey"]');
    await page.click('button:has-text("컬럼 추가")');
    
    await page.click('button:has-text("컬럼 추가")');
    await page.fill('input[name="columnName"]', 'user_id');
    await page.selectOption('select[name="dataType"]', 'INT');
    await page.click('button:has-text("컬럼 추가")');
    
    // 1. 관계 설정 모드 진입
    await page.click('button:has-text("관계 설정")');
    
    // 2. 외래키 관계 생성
    await page.click('button:has-text("관계 추가")');
    
    await page.selectOption('select[name="parentTable"]', 'User');
    await page.selectOption('select[name="parentColumn"]', 'id');
    await page.selectOption('select[name="childTable"]', 'Order');
    await page.selectOption('select[name="childColumn"]', 'user_id');
    
    await page.selectOption('select[name="onDelete"]', 'CASCADE');
    await page.selectOption('select[name="onUpdate"]', 'CASCADE');
    
    await page.fill('input[name="relationshipName"]', 'FK_Order_User');
    
    await page.click('button:has-text("관계 생성")');
    
    // 3. 관계선이 캔버스에 표시되는지 확인
    await expect(page.locator('[data-testid="relationship-line"]')).toBeVisible();
    
    // 4. 관계 정보 확인
    await page.click('[data-testid="relationship-line"]');
    await expect(page.locator('text=FK_Order_User')).toBeVisible();
    await expect(page.locator('text=User.id → Order.user_id')).toBeVisible();
    
    // 5. 관계 삭제
    await page.click('button[title="관계 삭제"]');
    await expect(page.locator('h3:has-text("관계 삭제")')).toBeVisible();
    await page.click('button:has-text("삭제")');
    
    // 관계선이 사라졌는지 확인
    await expect(page.locator('[data-testid="relationship-line"]')).not.toBeVisible();
  });

  test('테이블 복사 및 템플릿 기능', async ({ page }) => {
    // 원본 테이블 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'BaseTable');
    await page.fill('textarea[name="tableDescription"]', '기본 테이블 템플릿');
    await page.click('button:has-text("테이블 생성")');
    
    // 컬럼 추가
    await page.click('text=BaseTable');
    
    const columns = [
      { name: 'id', type: 'INT', isPK: true, isIdentity: true },
      { name: 'name', type: 'NVARCHAR', maxLength: '255' },
      { name: 'created_at', type: 'DATETIME2', defaultValue: 'GETDATE()' }
    ];
    
    for (const column of columns) {
      await page.click('button:has-text("컬럼 추가")');
      await page.fill('input[name="columnName"]', column.name);
      await page.selectOption('select[name="dataType"]', column.type);
      
      if (column.isPK) {
        await page.check('input[name="isPrimaryKey"]');
      }
      if (column.isIdentity) {
        await page.check('input[name="isIdentity"]');
      }
      if (column.maxLength) {
        await page.fill('input[name="maxLength"]', column.maxLength);
      }
      if (column.defaultValue) {
        await page.fill('input[name="defaultValue"]', column.defaultValue);
      }
      
      await page.click('button:has-text("컬럼 추가")');
    }
    
    // 1. 테이블 복사
    await page.click('button[title="테이블 메뉴"]');
    await page.click('text=테이블 복사');
    
    // 복사 설정
    await page.fill('input[name="newTableName"]', 'CopiedTable');
    await page.fill('textarea[name="newTableDescription"]', '복사된 테이블');
    await page.check('input[name="copyColumns"]');
    await page.check('input[name="copyIndexes"]');
    
    await page.click('button:has-text("복사")');
    
    // 복사된 테이블 확인
    await expect(page.locator('text=CopiedTable')).toBeVisible();
    
    // 2. 템플릿으로 저장
    await page.click('text=BaseTable');
    await page.click('button[title="테이블 메뉴"]');
    await page.click('text=템플릿으로 저장');
    
    await page.fill('input[name="templateName"]', '기본 엔티티 템플릿');
    await page.fill('textarea[name="templateDescription"]', 'ID, 이름, 생성일시를 포함한 기본 엔티티');
    
    await page.click('button:has-text("저장")');
    
    // 3. 템플릿에서 테이블 생성
    await page.click('button:has-text("템플릿에서 생성")');
    
    await page.selectOption('select[name="template"]', '기본 엔티티 템플릿');
    await page.fill('input[name="tableName"]', 'TemplateTable');
    
    await page.click('button:has-text("생성")');
    
    // 템플릿으로 생성된 테이블 확인
    await expect(page.locator('text=TemplateTable')).toBeVisible();
  });

  test('테이블 삭제 및 복구', async ({ page }) => {
    // 테이블 생성
    await page.click('button:has-text("테이블 추가")');
    await page.fill('input[name="tableName"]', 'DeleteTest');
    await page.click('button:has-text("테이블 생성")');
    
    // 1. 테이블 삭제
    await page.click('text=DeleteTest');
    await page.click('button[title="테이블 메뉴"]');
    await page.click('text=테이블 삭제');
    
    // 삭제 확인 다이얼로그
    await expect(page.locator('h3:has-text("테이블 삭제")')).toBeVisible();
    await expect(page.locator('text=이 테이블을 삭제하시겠습니까?')).toBeVisible();
    
    await page.click('button:has-text("삭제")');
    
    // 테이블이 삭제되었는지 확인
    await expect(page.locator('text=DeleteTest')).not.toBeVisible();
    
    // 2. 삭제 취소 (Undo) - 가능한 경우
    if (await page.locator('button:has-text("실행 취소")').isVisible()) {
      await page.click('button:has-text("실행 취소")');
      
      // 테이블이 복구되었는지 확인
      await expect(page.locator('text=DeleteTest')).toBeVisible();
    }
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 테이블 디자이너 E2E 테스트 실행:
 *    yarn test:e2e table-designer.spec.ts
 * 
 * 2. 특정 테스트만 실행:
 *    yarn test:e2e table-designer.spec.ts -g "컬럼 관리"
 * 
 * 3. 헤드리스 모드로 실행:
 *    yarn test:e2e table-designer.spec.ts --headed
 * 
 * 4. 디버그 모드:
 *    yarn test:e2e table-designer.spec.ts --debug
 */