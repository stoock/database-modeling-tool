import { test, expect } from '@playwright/test';

/**
 * 스키마 내보내기 E2E 테스트
 * 
 * 이 테스트는 다음 시나리오를 검증합니다:
 * 1. 스키마 내보내기 페이지 접근
 * 2. 다양한 형식으로 스키마 미리보기
 * 3. 내보내기 옵션 설정
 * 4. 파일 다운로드
 * 5. 내보내기 히스토리 관리
 */

test.describe('스키마 내보내기', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트용 프로젝트 생성
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 프로젝트가 없으면 생성
    const hasProjects = await page.locator('text=최근 프로젝트').isVisible();
    
    if (!hasProjects) {
      await page.click('button:has-text("새 프로젝트 생성")');
      await page.fill('input[name="name"]', '스키마 내보내기 테스트');
      await page.fill('textarea[name="description"]', '스키마 내보내기 E2E 테스트용 프로젝트');
      await page.click('button:has-text("생성")');
    } else {
      // 첫 번째 프로젝트 선택
      await page.locator('.group').first().click();
    }
    
    // 프로젝트 메인 페이지에서 스키마 내보내기 링크 클릭
    await page.click('text=스키마 내보내기');
    await page.waitForLoadState('networkidle');
  });

  test('스키마 내보내기 페이지 기본 구성 요소 확인', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('스키마 내보내기');
    
    // 주요 섹션들 확인
    await expect(page.locator('h3:has-text("내보내기 옵션")')).toBeVisible();
    await expect(page.locator('h3:has-text("내보내기 기록")')).toBeVisible();
    await expect(page.locator('h3:has-text("미리보기")')).toBeVisible();
    await expect(page.locator('h3:has-text("스키마 문서화")')).toBeVisible();
    
    // 스키마 검증 버튼 확인
    await expect(page.locator('button:has-text("스키마 검증")')).toBeVisible();
  });

  test('스키마 검증 기능', async ({ page }) => {
    // 스키마 검증 버튼 클릭
    await page.click('button:has-text("스키마 검증")');
    
    // 검증 결과 표시 대기
    await page.waitForSelector('.bg-green-50, .bg-red-50', { timeout: 10000 });
    
    // 검증 결과 메시지 확인 (성공 또는 오류)
    const validationResult = page.locator('.bg-green-50, .bg-red-50');
    await expect(validationResult).toBeVisible();
    
    // 검증 성공 시
    if (await page.locator('.bg-green-50').isVisible()) {
      await expect(page.locator('text=스키마가 유효합니다')).toBeVisible();
    }
    // 검증 실패 시
    else if (await page.locator('.bg-red-50').isVisible()) {
      await expect(page.locator('text=스키마에')).toBeVisible();
      await expect(page.locator('text=개의 오류가 있습니다')).toBeVisible();
    }
  });

  test('다양한 출력 형식 선택 및 미리보기', async ({ page }) => {
    const formats = ['SQL', 'MARKDOWN', 'HTML', 'JSON', 'CSV'];
    
    for (const format of formats) {
      // 출력 형식 선택
      await page.click(`button:has-text("${format}")`);
      
      // 선택된 형식이 활성화되었는지 확인
      await expect(page.locator(`button:has-text("${format}").bg-blue-600`)).toBeVisible();
      
      // 미리보기 제목 변경 확인
      if (format === 'SQL') {
        await expect(page.locator('h3:has-text("SQL 스크립트 미리보기")')).toBeVisible();
      } else {
        await expect(page.locator(`h3:has-text("${format} 미리보기")`)).toBeVisible();
      }
      
      // 미리보기 내용이 로드되는지 확인
      await page.waitForSelector('pre', { timeout: 5000 });
      await expect(page.locator('pre')).toBeVisible();
    }
  });

  test('내보내기 옵션 설정', async ({ page }) => {
    // 포함 옵션 체크박스들 확인
    const commentsCheckbox = page.locator('input[id="includeComments"]');
    const indexesCheckbox = page.locator('input[id="includeIndexes"]');
    const constraintsCheckbox = page.locator('input[id="includeConstraints"]');
    
    // 기본적으로 모든 옵션이 체크되어 있는지 확인
    await expect(commentsCheckbox).toBeChecked();
    await expect(indexesCheckbox).toBeChecked();
    await expect(constraintsCheckbox).toBeChecked();
    
    // 주석 포함 옵션 해제
    await commentsCheckbox.uncheck();
    await expect(commentsCheckbox).not.toBeChecked();
    
    // 인덱스 포함 옵션 해제
    await indexesCheckbox.uncheck();
    await expect(indexesCheckbox).not.toBeChecked();
    
    // 제약조건 포함 옵션 해제
    await constraintsCheckbox.uncheck();
    await expect(constraintsCheckbox).not.toBeChecked();
    
    // 옵션 변경 후 미리보기가 업데이트되는지 확인
    await page.waitForTimeout(1000); // 디바운싱 대기
    await expect(page.locator('pre')).toBeVisible();
  });

  test('파일 다운로드 기능', async ({ page }) => {
    // 다운로드 이벤트 리스너 설정
    const downloadPromise = page.waitForEvent('download');
    
    // SQL 형식 선택
    await page.click('button:has-text("SQL")');
    
    // 다운로드 버튼 클릭
    await page.click('button:has-text("다운로드")');
    
    // 다운로드 완료 대기
    const download = await downloadPromise;
    
    // 파일명 확인
    expect(download.suggestedFilename()).toMatch(/.*\.sql$/);
    
    // 파일 내용 확인 (옵션)
    // const path = await download.path();
    // const content = await fs.readFile(path, 'utf8');
    // expect(content).toContain('CREATE TABLE');
  });

  test('다양한 형식으로 파일 다운로드', async ({ page }) => {
    const formats = [
      { name: 'SQL', extension: '.sql' },
      { name: 'JSON', extension: '.json' },
      { name: 'MARKDOWN', extension: '.md' },
      { name: 'HTML', extension: '.html' },
      { name: 'CSV', extension: '.csv' }
    ];
    
    for (const format of formats) {
      // 형식 선택
      await page.click(`button:has-text("${format.name}")`);
      
      // 다운로드 이벤트 대기
      const downloadPromise = page.waitForEvent('download');
      
      // 다운로드 버튼 클릭
      await page.click('button:has-text("다운로드")');
      
      // 다운로드 완료 및 파일명 확인
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(new RegExp(`.*\\${format.extension}$`));
    }
  });

  test('SQL 미리보기 복사 기능', async ({ page }) => {
    // SQL 형식 선택
    await page.click('button:has-text("SQL")');
    
    // 미리보기 로딩 대기
    await page.waitForSelector('pre', { timeout: 5000 });
    
    // 복사 버튼 클릭
    await page.click('button:has-text("복사")');
    
    // 복사 완료 피드백 확인
    await expect(page.locator('text=복사됨')).toBeVisible();
    
    // 일정 시간 후 원래 텍스트로 돌아가는지 확인
    await page.waitForTimeout(2500);
    await expect(page.locator('button:has-text("복사")')).toBeVisible();
  });

  test('스키마 문서화 기능', async ({ page }) => {
    // 스키마 문서화 섹션 확인
    await expect(page.locator('h3:has-text("스키마 문서화")')).toBeVisible();
    
    // 마크다운 탭이 기본으로 선택되어 있는지 확인
    await expect(page.locator('button:has-text("마크다운").border-blue-500')).toBeVisible();
    
    // HTML 탭으로 전환
    await page.click('button:has-text("HTML")');
    await expect(page.locator('button:has-text("HTML").border-blue-500')).toBeVisible();
    
    // 문서화 내용이 표시되는지 확인
    await expect(page.locator('pre').last()).toBeVisible();
    
    // 문서화 복사 버튼 테스트
    await page.click('button:has-text("복사")').last();
    await expect(page.locator('text=복사됨').last()).toBeVisible();
    
    // 문서화 다운로드 버튼 테스트
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("다운로드")').last();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.html$/);
  });

  test('내보내기 기록 관리', async ({ page }) => {
    // 초기에는 기록이 없을 수 있음
    const hasHistory = await page.locator('text=내보내기 기록이 없습니다.').isVisible();
    
    if (hasHistory) {
      // 파일 다운로드로 기록 생성
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("다운로드")');
      await downloadPromise;
      
      // 페이지 새로고침하여 기록 확인
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
    
    // 내보내기 기록 섹션 확인
    await expect(page.locator('h3:has-text("내보내기 기록")')).toBeVisible();
    
    // 기록이 있는 경우 목록 확인
    const historyItems = page.locator('.space-y-3 > div');
    if (await historyItems.count() > 0) {
      // 첫 번째 기록 항목 확인
      const firstItem = historyItems.first();
      await expect(firstItem).toBeVisible();
      
      // 다운로드 버튼 확인
      await expect(firstItem.locator('button[title="다운로드"]')).toBeVisible();
      
      // 기록에서 다시 다운로드 테스트
      const downloadPromise = page.waitForEvent('download');
      await firstItem.locator('button[title="다운로드"]').click();
      await downloadPromise;
    }
  });

  test('프로젝트로 돌아가기 기능', async ({ page }) => {
    // 프로젝트로 돌아가기 링크 클릭
    await page.click('text=프로젝트로 돌아가기');
    
    // 프로젝트 메인 페이지로 이동했는지 확인
    await expect(page.locator('h2:has-text("프로젝트 개요")')).toBeVisible();
    await expect(page.locator('text=테이블 설계 캔버스')).toBeVisible();
  });

  test('빈 프로젝트 내보내기', async ({ page }) => {
    // 테이블이 없는 프로젝트의 경우
    // 미리보기에 적절한 메시지가 표시되는지 확인
    const previewContent = page.locator('pre');
    
    if (await previewContent.isVisible()) {
      // 내용이 있는 경우는 정상
      await expect(previewContent).toBeVisible();
    } else {
      // 내용이 없는 경우 적절한 메시지 확인
      await expect(page.locator('text=내보낼 스키마가 없습니다')).toBeVisible();
    }
  });

  test.skip('내보내기 오류 처리', async () => {
    // 네트워크 오류 시뮬레이션 (옵션)
    // await page.route('**/api/projects/*/export', route => route.abort());
    
    // 다운로드 시도
    // await page.click('button:has-text("다운로드")');
    
    // 오류 메시지 확인
    // await expect(page.locator('.bg-red-50')).toBeVisible();
    // await expect(page.locator('text=스키마 내보내기 중 오류가 발생했습니다')).toBeVisible();
  });
});

/**
 * 테스트 실행 방법:
 * 
 * 1. 스키마 내보내기 E2E 테스트 실행:
 *    yarn test:e2e schema-export.spec.ts
 * 
 * 2. 헤드리스 모드로 실행:
 *    yarn test:e2e schema-export.spec.ts --headed
 * 
 * 3. 특정 테스트만 실행:
 *    yarn test:e2e schema-export.spec.ts -g "파일 다운로드"
 * 
 * 4. 디버그 모드:
 *    yarn test:e2e schema-export.spec.ts --debug
 */