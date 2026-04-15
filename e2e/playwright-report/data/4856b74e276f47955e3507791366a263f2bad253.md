# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nuxtPrint.spec.js >> Nuxt print test >> shows print preview
- Location: specs/nuxtPrint.spec.js:13:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { getPdfProperties } from '../pdfHelpers'
  3  |
  4  | test.describe('Nuxt print test', () => {
  5  |   test.beforeEach(async ({ page }) => {
> 6  |     await page.goto('/')
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  7  |     await page.locator('[type="email"]').fill('test@example.com')
  8  |     await page.locator('[type="password"]').fill('test')
  9  |     await page.locator('[type="submit"]').click()
  10 |     await page.waitForURL('**/camps')
  11 |   })
  12 |
  13 |   test('shows print preview', async ({ page, request }) => {
  14 |     const campsResponse = await request.get('/api/camps.jsonhal')
  15 |     const campsBody = await campsResponse.json()
  16 |     const camp = campsBody._embedded.items.find((c) => c.motto)
  17 |     const campUri = camp._links.self.href
  18 |     const campPeriodsLink = camp._links.periods.href
  19 |
  20 |     const periodsResponse = await request.get(campPeriodsLink)
  21 |     const periodsBody = await periodsResponse.json()
  22 |     const period = periodsBody._embedded.items[0]
  23 |     const periodUri = period._links.self.href
  24 |
  25 |     const printConfig = {
  26 |       language: 'en',
  27 |       documentName: 'camp',
  28 |       options: { pageNumbers: false },
  29 |       camp: campUri,
  30 |       contents: [
  31 |         { type: 'Cover', options: {} },
  32 |         { type: 'Picasso', options: { periods: [periodUri], orientation: 'L' } },
  33 |         { type: 'Story', options: { periods: [periodUri], contentType: 'Storycontext' } },
  34 |         { type: 'Program', options: { periods: [periodUri], dayOverview: true } },
  35 |         { type: 'Toc', options: {} },
  36 |       ],
  37 |     }
  38 |
  39 |     const PRINT_URL = process.env.PRINT_URL || 'http://localhost:3000/print'
  40 |     await page.goto(
  41 |       `${PRINT_URL}/?config=${encodeURIComponent(JSON.stringify(printConfig))}`
  42 |     )
  43 |
  44 |     await expect(page.locator('body')).toContainText(camp.title)
  45 |     await expect(page.locator('body')).toContainText(camp.motto)
  46 |
  47 |     await expect(page.locator('#content_0_cover')).toHaveCSS('font-size', '50px')
  48 |   })
  49 |
  50 |   test.describe('downloads PDF', () => {
  51 |     test.beforeEach(async ({ page }) => {
  52 |       await page.goto('/camps')
  53 |       await page.locator('a:has-text("GRGR")').click()
  54 |     })
  55 |
  56 |     test('for whole camp', async ({ page }) => {
  57 |       await page.locator('a:has-text("Admin")').click()
  58 |       await page.locator('a:has-text("Drucken")').click()
  59 |
  60 |       const downloadPromise = page.waitForEvent('download')
  61 |       await page.locator('button:has-text("PDF herunterladen (Layout #1)")').click()
  62 |       const download = await downloadPromise
  63 |
  64 |       const path = await download.path()
  65 |       const buffer = require('fs').readFileSync(path)
  66 |       const pdfProps = await getPdfProperties(buffer)
  67 |
  68 |       expect(download.suggestedFilename()).toBe('Pfila-2023.pdf')
  69 |       expect(pdfProps.numPages).toBe(25)
  70 |     })
  71 |
  72 |     test.skip('for picasso', async ({ page }) => {
  73 |       await page.locator('a:has-text("Programm")').click()
  74 |       await page.locator('[data-testid="campprogram-menu"]').click()
  75 |
  76 |       const downloadPromise = page.waitForEvent('download')
  77 |       await page
  78 |         .locator('[role="menuitem"]:has-text("PDF herunterladen (Layout #1)")')
  79 |         .click()
  80 |       const download = await downloadPromise
  81 |
  82 |       const path = await download.path()
  83 |       const buffer = require('fs').readFileSync(path)
  84 |       const pdfProps = await getPdfProperties(buffer)
  85 |
  86 |       expect(download.suggestedFilename()).toBe('Pfila-2023-Hauptlager.pdf')
  87 |       expect(pdfProps.numPages).toBe(1)
  88 |     })
  89 |   })
  90 | })
  91 |
```