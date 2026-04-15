import { test, expect } from '@playwright/test'

test.describe.skip('The filters in the dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[type="email"]').fill('test@example.com')
    await page.locator('[type="password"]').fill('test')
    await page.locator('[type="submit"]').click()
    await page.waitForURL('**/camps')

    await page.goto('/camps')
    await page.locator('a:has-text("GRGR")').click()
    await expect(page.locator('body')).toContainText('Hauptlager')
  })

  test.afterEach(async ({ page }) => {
    await expect(page.locator('body')).toContainText('Hauptlager')
  })

  async function clickOnItemWithLabel(page, label) {
    await page
      .locator(`div.v-list-item:has-text("${label}")`)
      .locator('.v-input--selection-controls__ripple')
      .click()
  }

  test('can be shared via url', async ({ page }) => {
    await page.locator('span.v-chip:has-text("Kategorie")').click()
    await clickOnItemWithLabel(page, 'Essen')
    await clickOnItemWithLabel(page, 'Lagersport')

    await expect(
      page.locator('span.v-chip:has-text("Kategorie: ES oder LS")')
    ).toBeVisible()

    await page.locator('span.v-chip:has-text("Status")').click()
    await clickOnItemWithLabel(page, 'Geplant')
    await clickOnItemWithLabel(page, 'Coach OK')

    await expect(
      page.locator('span.v-chip:has-text("Status: Geplant oder Coach OK")')
    ).toBeVisible()

    const url = page.url()
    await page.goto(url)

    await expect(
      page.locator('span.v-chip:has-text("Kategorie: ES oder LS")')
    ).toBeVisible()
    await expect(
      page.locator('span.v-chip:has-text("Status: Geplant oder Coach OK")')
    ).toBeVisible()
  })

  test('are removed from the url when removed in the gui', async ({ page }) => {
    await page.locator('span.v-chip:has-text("Kategorie")').click()
    await clickOnItemWithLabel(page, 'Essen')
    await clickOnItemWithLabel(page, 'Lagersport')

    await expect(
      page.locator('span.v-chip:has-text("Kategorie: ES oder LS")')
    ).toBeVisible()

    let url = page.url()
    await page.goto(url)

    await expect(
      page.locator('span.v-chip:has-text("Kategorie: ES oder LS")')
    ).toBeVisible()

    await page
      .locator('span.v-chip:has-text("Kategorie: ES oder LS")')
      .locator('.v-chip__close')
      .click()

    await clickOnItemWithLabel(page, 'Essen')
    await clickOnItemWithLabel(page, 'Lagersport')

    await expect(
      page.locator('span.v-chip:has-text("Kategorie: ES oder LS")')
    ).toBeHidden()
    await expect(page.locator('span.v-chip:has-text("Kategorie")')).toBeVisible()

    url = page.url()
    await page.goto(url)

    await expect(
      page.locator('span.v-chip:has-text("Kategorie: ES oder LS")')
    ).toBeHidden()
    await expect(page.locator('span.v-chip:has-text("Kategorie")')).toBeVisible()
  })

  test('support selecting activities without responsibles', async ({ page }) => {
    await page.locator('span.v-chip:has-text("Verantwortlich")').click()
    await clickOnItemWithLabel(page, 'Keine Verantwortlichen')

    await expect(
      page.locator('span.v-chip:has-text("Verantwortlich: Keine Verantwortlichen")')
    ).toBeVisible()

    const url = page.url()
    await page.goto(url)

    await expect(
      page.locator('span.v-chip:has-text("Verantwortlich: Keine Verantwortlichen")')
    ).toBeVisible()
  })
})
