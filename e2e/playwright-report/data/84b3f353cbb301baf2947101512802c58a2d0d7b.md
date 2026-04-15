# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Login test >> displays the login page
- Location: specs/login.spec.js:4:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  |
  3  | test.describe('Login test', () => {
  4  |   test('displays the login page', async ({ page }) => {
> 5  |     await page.goto('/')
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  6  |     await expect(page.locator('body')).toContainText('Login')
  7  |     await expect(page.locator('body')).toContainText(
  8  |       'This is the development version of eCamp v3.'
  9  |     )
  10 |     await expect(page.locator('body')).toContainText('Register now')
  11 |   })
  12 |
  13 |   test('can login with default user', async ({ page }) => {
  14 |     await page.goto('/')
  15 |
  16 |     await page.locator('[type="email"]').fill('test@example.com')
  17 |     await page.locator('[type="password"]').fill('test')
  18 |     await page.locator('[type="submit"]').click()
  19 |
  20 |     await page.waitForURL('**/camps', { timeout: 60000 })
  21 |
  22 |     await expect(page.locator('body')).toContainText('Meine Lager')
  23 |     await expect(page.locator('body')).toContainText('GRGR')
  24 |     await expect(page.locator('body')).toContainText('Harry Potter Lager')
  25 |   })
  26 | })
  27 |
```