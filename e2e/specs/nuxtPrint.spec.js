import { test, expect } from '@playwright/test'
import path from 'path'
import { loginAndSetCookie, apiGet } from '../utils/helpers.js'
import { deleteDownloads, moveDownloads, getPdfProperties } from '../utils/tasks.js'
import fs from 'fs'

test.describe('Nuxt print test', () => {
  test('shows print preview', async ({ page, request }) => {
    await loginAndSetCookie(page, request, 'test@example.com')

    const campsResponse = await apiGet(request, '/api/camps')
    const campsBody = await campsResponse.json()
    const camp = campsBody._embedded.items.filter((c) => c.motto)[0]
    const campUri = camp._links.self.href
    const campPeriodsLink = camp._links.periods.href

    // Use full URL or reconstruct URL since apiGet uses cached root.
    const API_BASE = process.env.API_ROOT_URL_CACHED || 'http://localhost:3004'
    const periodsResponse = await request.get(`${API_BASE}${campPeriodsLink}`)
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

    await expect(page.locator(`text=${camp.title}`).first()).toBeVisible()
    await expect(page.locator(`text=${camp.motto}`).first()).toBeVisible()

    const coverElement = page.locator('#content_0_cover')
    await expect(coverElement).toHaveCSS('font-size', '50px')
  })

  test.describe('downloads PDF', () => {
    const downloadsFolder = 'data/downloads'

    test.beforeEach(async ({ page, request }) => {
      deleteDownloads(downloadsFolder)
      await loginAndSetCookie(page, request, 'test@example.com')
      await page.goto('/camps')
      await page.locator('a:has-text("GRGR")').click()
    })

    test.afterEach(async ({}, testInfo) => {
      moveDownloads(testInfo, downloadsFolder)
    })

    test('for whole camp', async ({ page }) => {
      await page.locator('a:has-text("Admin")').click()
      await page.locator('a:has-text("Drucken")').click()

      const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
      await page.locator('button:has-text("PDF herunterladen (Layout #1)")').click()
      const download = await downloadPromise

      const pdfPath = path.join(downloadsFolder, 'Pfila-2023.pdf')
      if (!fs.existsSync(downloadsFolder)) {
        fs.mkdirSync(downloadsFolder, { recursive: true })
      }
      await download.saveAs(pdfPath)

      const props = await getPdfProperties(pdfPath)
      expect(props.numPages).toBe(25)
    })

    test.skip('for picasso', async ({ page, browserName }) => {
      if (browserName === 'firefox') {
        console.log('Firefox makes problems, skipping.')
        return
      }

      await page.locator('a:has-text("Programm")').click()
      await page.locator('[data-testid="campprogram-menu"]').click()

      const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
      await page
        .locator('[role="menuitem"]:has-text("PDF herunterladen (Layout #1)")')
        .click()
      const download = await downloadPromise

      const pdfPath = path.join(downloadsFolder, 'Pfila-2023-Hauptlager.pdf')
      if (!fs.existsSync(downloadsFolder)) {
        fs.mkdirSync(downloadsFolder, { recursive: true })
      }
      await download.saveAs(pdfPath)

      const props = await getPdfProperties(pdfPath)
      expect(props.numPages).toBe(1)
    })
  })
})
