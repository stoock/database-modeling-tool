import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * 
 * 이 설정은 다음을 포함합니다:
 * - 다양한 브라우저 환경에서의 테스트
 * - 테스트 서버 자동 시작/종료
 * - 스크린샷 및 비디오 녹화
 * - 병렬 테스트 실행
 */

export default defineConfig({
  // 테스트 파일 위치
  testDir: './src/e2e',
  
  // 전역 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 리포터 설정
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // 전역 테스트 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:3000',
    
    // 브라우저 설정
    headless: true,
    viewport: { width: 1280, height: 720 },
    
    // 스크린샷 및 비디오
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 추적 설정
    trace: 'on-first-retry',
    
    // 네트워크 설정
    ignoreHTTPSErrors: true,
    
    // 타임아웃 설정
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // 프로젝트별 설정 (브라우저별)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // 모바일 테스트 (선택사항)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Microsoft Edge
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],

  // 테스트 서버 설정
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // 테스트 타임아웃
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  
  // 출력 디렉토리
  outputDir: 'test-results/',
  
  // 테스트 매칭 패턴
  testMatch: '**/*.spec.ts',
  
  // 전역 설정 파일
  globalSetup: './src/e2e/global-setup.ts',
  globalTeardown: './src/e2e/global-teardown.ts',
});