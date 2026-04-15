import { test, expect } from '@playwright/test'
import { getPdfProperties } from '../pdfHelpers'

test.describe('Client print test', () => {
  test('downloads PDF', async ({ page }) => {
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

    const path = await download.path()
    const buffer = require('fs').readFileSync(path)
    const pdfProps = await getPdfProperties(buffer)

    expect(download.suggestedFilename()).toBe('Pfila-2023.pdf')
    expect(pdfProps.numPages).toBe(18)
  })
})
