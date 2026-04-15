# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: zz-createCamp.spec.js >> create new camp >> without prototype
- Location: specs/zz-createCamp.spec.js:13:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { bipiUser } from './constants'
  3  |
  4  | const tomorrow = new Date()
  5  | tomorrow.setDate(tomorrow.getDate() + 1)
  6  |
  7  | const in2Days = new Date()
  8  | in2Days.setDate(in2Days.getDate() + 2)
  9  |
  10 | const campTitle = 'title'
  11 |
  12 | test.describe('create new camp', () => {
  13 |   test('without prototype', async ({ page, browserName }, testInfo) => {
  14 |     if (browserName === 'webkit') {
  15 |       test.skip()
  16 |     }
  17 |     if (browserName === 'chromium' && testInfo.project.name === 'edge') {
  18 |       console.log('edge has problems since the update to vue3.')
  19 |       test.skip()
  20 |     }
  21 |
> 22 |     await page.goto('/')
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  23 |     await page.locator('[type="email"]').fill(bipiUser)
  24 |     await page.locator('[type="password"]').fill('test')
  25 |     await page.locator('[type="submit"]').click()
  26 |     await page.waitForURL('**/camps')
  27 |
  28 |     await page.goto('/camps')
  29 |
  30 |     await page.locator('[data-testid="create-camp-button"]').click()
  31 |
  32 |     await page.locator('[data-testid="create-camp-title-input"] input').fill(campTitle)
  33 |     await page.locator('[data-testid="create-camp-organizer"] input').fill('org')
  34 |     await page.locator('[data-testid="create-camp-motto"] input').fill('motto')
  35 |     await page
  36 |       .locator('[data-testid="start-date-picker"] input')
  37 |       .fill(tomorrow.toLocaleDateString('de-CH'))
  38 |     await page
  39 |       .locator('[data-testid="end-date-picker"] input')
  40 |       .fill(in2Days.toLocaleDateString('de-CH'))
  41 |
  42 |     await page.locator('[data-testid="create-camp-next-step"]').click()
  43 |     await page.locator('div.v-input[data-testid="prototype-select"]').click()
  44 |
  45 |     await expect(page.locator('.v-overlay--active')).toBeVisible({ timeout: 10000 })
  46 |
  47 |     await page.locator('text=Keine Vorlage').click()
  48 |     await expect(
  49 |       page.locator('text=Achtung: Du hast "Keine Vorlage" ausgewählt.')
  50 |     ).toBeVisible()
  51 |     await page.locator('[data-testid="create-camp-button"]').click()
  52 |
  53 |     await expect(page.locator('text=Lagerinfos')).toBeVisible()
  54 |     await expect(page.locator('[data-testid="title"] input')).toHaveValue(campTitle)
  55 |   })
  56 | })
  57 |
```