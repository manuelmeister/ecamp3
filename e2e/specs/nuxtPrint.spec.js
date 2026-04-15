import { test, expect } from '@playwright/test'
import { getPdfProperties } from '../pdfHelpers'

test.describe('Nuxt print test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[type="email"]').fill('test@example.com')
    await page.locator('[type="password"]').fill('test')
    await page.locator('[type="submit"]').click()
    await page.waitForURL('**/camps')
  })

  test('shows print preview', async ({ page, request }) => {
    const campsResponse = await request.get('/api/camps.jsonhal')
    const campsBody = await campsResponse.json()
    const camp = campsBody._embedded.items.find((c) => c.motto)
    const campUri = camp._links.self.href
    const campPeriodsLink = camp._links.periods.href

    const periodsResponse = await request.get(campPeriodsLink)
    const periodsBody = await periodsResponse.json()
    const period = periodsBody._embedded.items[0]
    const periodUri = period._links.self.href

    const printConfig = {
      language: 'en',
      documentName: 'camp',
      options: { pageNumbers: false },
      camp: campUri,
      contents: [
        { type: 'Cover', options: {} },
        { type: 'Picasso', options: { periods: [periodUri], orientation: 'L' } },
        { type: 'Story', options: { periods: [periodUri], contentType: 'Storycontext' } },
        { type: 'Program', options: { periods: [periodUri], dayOverview: true } },
        { type: 'Toc', options: {} },
      ],
    }

    const PRINT_URL = process.env.PRINT_URL || 'http://localhost:3000/print'
    await page.goto(
      `${PRINT_URL}/?config=${encodeURIComponent(JSON.stringify(printConfig))}`
    )

    await expect(page.locator('body')).toContainText(camp.title)
    await expect(page.locator('body')).toContainText(camp.motto)

    await expect(page.locator('#content_0_cover')).toHaveCSS('font-size', '50px')
  })

  test.describe('downloads PDF', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/camps')
      await page.locator('a:has-text("GRGR")').click()
    })

    test('for whole camp', async ({ page }) => {
      await page.locator('a:has-text("Admin")').click()
      await page.locator('a:has-text("Drucken")').click()

      const downloadPromise = page.waitForEvent('download')
      await page.locator('button:has-text("PDF herunterladen (Layout #1)")').click()
      const download = await downloadPromise

      const path = await download.path()
      const buffer = require('fs').readFileSync(path)
      const pdfProps = await getPdfProperties(buffer)

      expect(download.suggestedFilename()).toBe('Pfila-2023.pdf')
      expect(pdfProps.numPages).toBe(25)
    })

    test.skip('for picasso', async ({ page }) => {
      await page.locator('a:has-text("Programm")').click()
      await page.locator('[data-testid="campprogram-menu"]').click()

      const downloadPromise = page.waitForEvent('download')
      await page
        .locator('[role="menuitem"]:has-text("PDF herunterladen (Layout #1)")')
        .click()
      const download = await downloadPromise

      const path = await download.path()
      const buffer = require('fs').readFileSync(path)
      const pdfProps = await getPdfProperties(buffer)

      expect(download.suggestedFilename()).toBe('Pfila-2023-Hauptlager.pdf')
      expect(pdfProps.numPages).toBe(1)
    })
  })
})
