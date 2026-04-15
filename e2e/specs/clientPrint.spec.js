import { test, expect } from '@playwright/test'
import { getPdfProperties } from '../pdfHelpers'
import { loginViaApi } from '../helpers'

test.describe('Client print test', () => {
  test('downloads PDF', async ({ page, request }) => {
    await loginViaApi(request, 'test@example.com')

    // Set a cookie so the UI sees the user as authenticated
    // Note: API authentication sets standard symfony cookies, Playwright uses the context
    // Better to login via UI for standard UI tests or restore state.
    // For simplicity, we just use the UI login since `cy.login` was essentially an API login.
    // If the API login sets a cookie, Playwright will carry it over if we reuse the context,
    // but the `cy.session` sets it globally. Let's do UI login to be safe, or just use the same API request.
    // Let's modify helpers to handle cookie context if needed, but since eCamp uses an httpOnly JWT cookie, it should just work if we use `page.request`.
    // Actually, `loginViaApi` uses `request` which is tied to the context!

    await page.goto('/')
    await page.locator('[type="email"]').fill('test@example.com')
    await page.locator('[type="password"]').fill('test')
    await page.locator('[type="submit"]').click()
    await page.waitForURL('**/camps')

    await page.locator('a:has-text("GRGR")').click()
    await page.locator('a:has-text("Admin")').click()
    await page.locator('a:has-text("Drucken")').click()

    const downloadPromise = page.waitForEvent('download')
    await page.locator('button:has-text("PDF herunterladen (Layout #2)")').click()
    const download = await downloadPromise

    // Wait for the download process to complete and get the path to the downloaded file
    const path = await download.path()
    const buffer = require('fs').readFileSync(path)
    const pdfProps = await getPdfProperties(buffer)

    expect(download.suggestedFilename()).toBe('Pfila-2023.pdf')
    expect(pdfProps.numPages).toBe(18)
  })
})
