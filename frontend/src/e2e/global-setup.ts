import { chromium, FullConfig } from '@playwright/test';

/**
 * Playwright 전역 설정
 * 
 * 모든 테스트 실행 전에 한 번 실행되는 설정입니다.
 * - 테스트 데이터베이스 초기화
 * - 인증 상태 설정
 * - 기본 데이터 생성
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 E2E 테스트 전역 설정 시작...');
  
  const { baseURL } = config.projects[0].use;
  
  // 브라우저 시작
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 애플리케이션이 시작될 때까지 대기
    console.log('📡 애플리케이션 연결 대기 중...');
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');
    
    // 애플리케이션이 정상적으로 로드되었는지 확인
    await page.waitForSelector('h1, [data-testid="app-loaded"]', { timeout: 30000 });
    console.log('✅ 애플리케이션 연결 성공');
    
    // 테스트 데이터 초기화 (필요한 경우)
    await setupTestData(page);
    
    console.log('✅ E2E 테스트 전역 설정 완료');
    
  } catch (error) {
    console.error('❌ E2E 테스트 전역 설정 실패:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * 테스트 데이터 설정
 */
async function setupTestData(page: any) {
  console.log('📊 테스트 데이터 설정 중...');
  
  try {
    // 기존 테스트 데이터 정리 (localStorage 등)
    await page.evaluate(() => {
      // localStorage 정리
      localStorage.clear();
      
      // sessionStorage 정리
      sessionStorage.clear();
      
      // IndexedDB 정리 (필요한 경우)
      if (window.indexedDB) {
        // IndexedDB 정리 로직
      }
    });
    
    // API를 통한 테스트 데이터 정리 (백엔드가 준비된 경우)
    // await page.request.delete('/api/test/cleanup');
    
    console.log('✅ 테스트 데이터 설정 완료');
    
  } catch (error) {
    console.warn('⚠️ 테스트 데이터 설정 중 오류 (계속 진행):', error);
  }
}

export default globalSetup;