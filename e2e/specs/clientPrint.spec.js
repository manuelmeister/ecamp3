import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { loginAndSetCookie } from '../utils/helpers.js'
import { deleteDownloads, moveDownloads, getPdfProperties } from '../utils/tasks.js'

test.describe('Client print test', () => {
  const downloadsFolder = 'data/downloads'

  test.afterEach(async ({}, testInfo) => {
    moveDownloads(testInfo, downloadsFolder)
  })

  test('downloads PDF', async ({ page, request }) => {
    deleteDownloads(downloadsFolder)
    await loginAndSetCookie(page, request, 'test@example.com')

    await page.goto('/camps')
    await page.locator('a:has-text("GRGR")').click()
    await page.locator('a:has-text("Admin")').click()
    await page.locator('a:has-text("Drucken")').click()

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
    await page.locator('button:has-text("PDF herunterladen (Layout #2)")').click()
    const download = await downloadPromise

    const filePath = path.join(downloadsFolder, 'Pfila-2023.pdf')
    if (!fs.existsSync(downloadsFolder)) {
      fs.mkdirSync(downloadsFolder, { recursive: true })
    }
    await download.saveAs(filePath)

    const props = await getPdfProperties(filePath)
    expect(props.numPages).toBe(18)
  })
})
