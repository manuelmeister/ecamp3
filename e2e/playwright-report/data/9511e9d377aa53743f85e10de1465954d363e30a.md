# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientPrint.spec.js >> Client print test >> downloads PDF
- Location: specs/clientPrint.spec.js:5:7

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
  4  | test.describe('Client print test', () => {
  5  |   test('downloads PDF', async ({ page }) => {
> 6  |     await page.goto('/')
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  7  |     await page.locator('[type="email"]').fill('test@example.com')
  8  |     await page.locator('[type="password"]').fill('test')
  9  |     await page.locator('[type="submit"]').click()
  10 |     await page.waitForURL('**/camps')
  11 |
  12 |     await page.locator('a:has-text("GRGR")').click()
  13 |     await page.locator('a:has-text("Admin")').click()
  14 |     await page.locator('a:has-text("Drucken")').click()
  15 |
  16 |     const downloadPromise = page.waitForEvent('download')
  17 |     await page.locator('button:has-text("PDF herunterladen (Layout #2)")').click()
  18 |     const download = await downloadPromise
  19 |
  20 |     const path = await download.path()
  21 |     const buffer = require('fs').readFileSync(path)
  22 |     const pdfProps = await getPdfProperties(buffer)
  23 |
  24 |     expect(download.suggestedFilename()).toBe('Pfila-2023.pdf')
  25 |     expect(pdfProps.numPages).toBe(18)
  26 |   })
  27 | })
  28 |
```