import { test, expect } from '@playwright/test'

test.describe('Login test', () => {
  test('displays the login page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Login').first()).toBeVisible()
    await expect(
      page.locator('text=This is the development version of eCamp v3.')
    ).toBeVisible()
    await expect(page.locator('text=Register now')).toBeVisible()
  })

  test('can login with default user', async ({ page }) => {
    await page.goto('/')

    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('test')
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/camps/, { timeout: 60000 })

    await expect(page.locator('text=Meine Lager')).toBeVisible()
    await expect(page.locator('text=GRGR').first()).toBeVisible()
    await expect(page.locator('text=Harry Potter Lager').first()).toBeVisible()
  })
})
