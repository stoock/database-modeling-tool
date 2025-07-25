import { chromium, FullConfig } from '@playwright/test';

/**
 * Playwright 전역 정리
 * 
 * 모든 테스트 실행 후에 한 번 실행되는 정리 작업입니다.
 * - 테스트 데이터 정리
 * - 임시 파일 삭제
 * - 리소스 해제
 */

async function globalTeardown(config: FullConfig) {
  console.log('🧹 E2E 테스트 전역 정리 시작...');
  
  const { baseURL } = config.projects[0].use;
  
  // 브라우저 시작
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 애플리케이션 연결
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');
    
    // 테스트 데이터 정리
    await cleanupTestData(page);
    
    console.log('✅ E2E 테스트 전역 정리 완료');
    
  } catch (error) {
    console.error('❌ E2E 테스트 전역 정리 실패:', error);
    // 정리 작업 실패는 치명적이지 않으므로 에러를 던지지 않음
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * 테스트 데이터 정리
 */
async function cleanupTestData(page: any) {
  console.log('🗑️ 테스트 데이터 정리 중...');
  
  try {
    // 브라우저 저장소 정리
    await page.evaluate(() => {
      // localStorage 정리
      localStorage.clear();
      
      // sessionStorage 정리
      sessionStorage.clear();
      
      // 쿠키 정리
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    });
    
    // API를 통한 테스트 데이터 정리 (백엔드가 준비된 경우)
    // await page.request.delete('/api/test/cleanup');
    
    // 다운로드된 파일 정리 (필요한 경우)
    // const fs = require('fs');
    // const path = require('path');
    // const downloadsDir = path.join(__dirname, '../../downloads');
    // if (fs.existsSync(downloadsDir)) {
    //   fs.rmSync(downloadsDir, { recursive: true, force: true });
    // }
    
    console.log('✅ 테스트 데이터 정리 완료');
    
  } catch (error) {
    console.warn('⚠️ 테스트 데이터 정리 중 오류:', error);
  }
}

export default globalTeardown;