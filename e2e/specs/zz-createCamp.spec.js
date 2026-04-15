import { test, expect } from '@playwright/test'
import { bipiUser } from './constants.js'
import { loginAndSetCookie } from '../utils/helpers.js'

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

const in2Days = new Date()
in2Days.setDate(in2Days.getDate() + 2)

const campTitle = 'title'

test.describe('create new camp', () => {
  test('without prototype', async ({ page, request, browserName }) => {
    if (browserName === 'webkit') {
      console.log('webkit skipped based on prior edge issues, testing via UI')
      test.skip()
    }

    await loginAndSetCookie(page, request, bipiUser)

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
    await expect(page.locator('.v-overlay--active').first()).toBeVisible({
      timeout: 10000,
    })
    await page.locator('text=Keine Vorlage').click()
    await expect(
      page.locator('text=Achtung: Du hast "Keine Vorlage" ausgewählt.')
    ).toBeVisible()
    await page.locator('[data-testid="create-camp-button"]').click()

    await expect(page.locator('text=Lagerinfos')).toBeVisible()
    await expect(page.locator('[data-testid="title"] input')).toHaveValue(campTitle)
  })
})
