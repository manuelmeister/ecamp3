import { test, expect } from '@playwright/test'
import { bipiUser } from './constants'

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

const in2Days = new Date()
in2Days.setDate(in2Days.getDate() + 2)

const campTitle = 'title'

test.describe('create new camp', () => {
  test('without prototype', async ({ page, browserName }, testInfo) => {
    if (browserName === 'webkit') {
      test.skip()
    }
    if (browserName === 'chromium' && testInfo.project.name === 'edge') {
      console.log('edge has problems since the update to vue3.')
      test.skip()
    }

    await page.goto('/')
    await page.locator('[type="email"]').fill(bipiUser)
    await page.locator('[type="password"]').fill('test')
    await page.locator('[type="submit"]').click()
    await page.waitForURL('**/camps')

    await page.goto('/camps')

    await page.locator('[data-testid="create-camp-button"]').click()

    await page.locator('[data-testid="create-camp-title-input"] input').fill(campTitle)
    await page.locator('[data-testid="create-camp-organizer"] input').fill('org')
    await page.locator('[data-testid="create-camp-motto"] input').fill('motto')
    await page
      .locator('[data-testid="start-date-picker"] input')
      .fill(tomorrow.toLocaleDateString('de-CH'))
    await page
      .locator('[data-testid="end-date-picker"] input')
      .fill(in2Days.toLocaleDateString('de-CH'))

    await page.locator('[data-testid="create-camp-next-step"]').click()
    await page.locator('div.v-input[data-testid="prototype-select"]').click()

    await expect(page.locator('.v-overlay--active')).toBeVisible({ timeout: 10000 })

    await page.locator('text=Keine Vorlage').click()
    await expect(
      page.locator('text=Achtung: Du hast "Keine Vorlage" ausgewählt.')
    ).toBeVisible()
    await page.locator('[data-testid="create-camp-button"]').click()

    await expect(page.locator('text=Lagerinfos')).toBeVisible()
    await expect(page.locator('[data-testid="title"] input')).toHaveValue(campTitle)
  })
})
