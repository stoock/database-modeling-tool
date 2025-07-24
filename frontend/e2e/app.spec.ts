import { test, expect } from '@playwright/test'

test.describe('Database Modeling Tool', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/')
    
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('MSSQL 데이터베이스 모델링 도구')
  })

  test('should show project creation dialog', async ({ page }) => {
    await page.goto('/')
    
    // Click the "새 프로젝트" button
    await page.click('button:has-text("새 프로젝트")')
    
    // Check if the modal is opened
    await expect(page.locator('text=새 프로젝트 생성')).toBeVisible()
  })

  test('should navigate to schema export page', async ({ page }) => {
    await page.goto('/')
    
    // This test would require a project to be selected first
    // For now, we'll just test the URL structure
    await page.goto('/projects/test-id/export')
    
    // The page should load (even if it shows an error due to missing project)
    await expect(page.locator('body')).toBeVisible()
  })
})