import { test, expect } from '@playwright/test'
import {
  loginViaApi,
  expectCacheHit,
  expectCacheMiss,
  waitForCacheMiss,
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  cachedEndpoint,
} from '../../helpers'
import {
  bipiUser,
  bruceWayneUser,
  castorUser,
  felicitySmoakUser,
  grgrCampId,
  loremIpsumCampId,
} from '../constants'
import collectionResponse from './responses/categories_collection.json'

const grgrLACategoryId = '1a869b162875'

const collectionXKeys =
  'b0bdb7202a9d ebfd46a1c181 ebfd46a1c181#camp ebfd46a1c181#preferredContentTypes ebfd46a1c181#rootContentNode ebfd46a1c181#embeddedPreferredContentTypes ebfd46a1c181#emptyContentNodesForIriGeneration 1a869b162875 1a869b162875#camp 1a869b162875#preferredContentTypes 1a869b162875#rootContentNode f17470519474 1a0f84e322c8 3ef17bd1df72 4f0c657fecef a4211c112939 44dcc7493c65 cfccaecd4bad 318e064ea0c9 1a869b162875#embeddedPreferredContentTypes 1a869b162875#emptyContentNodesForIriGeneration dfa531302823 dfa531302823#camp dfa531302823#preferredContentTypes dfa531302823#rootContentNode dfa531302823#embeddedPreferredContentTypes dfa531302823#emptyContentNodesForIriGeneration a023e85227ac a023e85227ac#camp a023e85227ac#preferredContentTypes a023e85227ac#rootContentNode a023e85227ac#embeddedPreferredContentTypes a023e85227ac#emptyContentNodesForIriGeneration /api/camps/3c79b99ab424/categories'

test.describe('cache test: /camps/{campId}/categories', () => {
  test('caches /camps/{campId}/categories separately for each login', async ({
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/categories`

    await loginViaApi(request, bipiUser)

    const response = await request.get(`${cachedEndpoint}${uri}.jsonhal`)
    {
      const headers = response.headers()
      expect(headers['xkey']).toBe(collectionXKeys)
      expect(headers['x-cache']).toBe('MISS')
      expect(await response.json()).toEqual(collectionResponse)
    }

    await expectCacheHit(request, uri)

    await loginViaApi(request, castorUser)
    await expectCacheMiss(request, uri)
  })

  test('invalidates /camps/{campId}/categories for all users on category patch', async ({
    request,
  }) => {
    const uri = `/api/camps/${loremIpsumCampId}/categories`

    await loginViaApi(request, bruceWayneUser)
    await apiPatch(request, '/api/categories/c5e1bc565094', {
      name: 'old_name',
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await loginViaApi(request, felicitySmoakUser)
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiPatch(request, '/api/categories/c5e1bc565094', {
      name: 'new_name',
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await loginViaApi(request, bruceWayneUser)
    await expectCacheMiss(request, uri)
  })

  test('invalidates /camps/{campId}/categories for new category', async ({ request }) => {
    const uri = `/api/camps/${grgrCampId}/categories`

    await loginViaApi(request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    const response = await apiPost(request, '/api/categories', {
      camp: `/api/camps/${grgrCampId}`,
      short: 'new',
      name: 'new Category',
      color: '#000000',
      numberingStyle: '1',
    })

    const newContentNodeUri = (await response.json())._links.self.href

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiDelete(request, newContentNodeUri)

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test.skip('invalidates cached data when user leaves a camp', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/categories`

    await loginViaApi(request, castorUser)
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await loginViaApi(request, bipiUser)
    await page.goto(`/camps/${grgrCampId}/GRGR/admin/collaborators`)
    await page.locator('.v-list-item__title:has-text("Castor")').click()
    await page.locator('button:has-text("Deaktivieren")').click()
    await page.locator('div[role=alert] button:has-text("Deaktivieren")').click()

    await loginViaApi(request, castorUser)
    const response = await request.post(`${cachedEndpoint}${uri}.jsonhal`, {
      failOnStatusCode: false,
    })
    expect(response.status()).toBe(404)

    await request.delete('/mail/email/all')

    await loginViaApi(request, bipiUser)
    await page.goto(`/camps/${grgrCampId}/GRGR/admin/collaborators`)
    await page.locator('.v-list-item__title:has-text("Castor")').click()
    await page.locator('button:has-text("Erneut einladen")').click()

    await loginViaApi(request, castorUser)

    const response2 = await request.post('/mail/email')
    // eslint-disable-next-line no-unused-vars
    const emailHtmlContent = (await response2.json())[0].html

    await page.locator('a:has-text("Einladung beantworten")').click()
    await page
      .locator('button:has-text("Einladung mit aktuellem Account akzeptieren")')
      .click()
    await page.goto('/camps')
    await expect(page.locator('body')).toContainText('GRGR')
  })

  test.describe('invalidates /camps/{campId}/categories', () => {
    let categoryBefore
    function preferredContentTypeIrisBefore() {
      return categoryBefore._embedded.preferredContentTypes.map(
        (contentType) => contentType._links.self.href
      )
    }

    test.beforeEach(async ({ request }) => {
      await loginViaApi(request, bipiUser)

      const response = await apiGet(request, `/api/categories/${grgrLACategoryId}`)
      categoryBefore = await response.json()
      expect(preferredContentTypeIrisBefore().length).toBeGreaterThan(0)
    })

    test.afterEach(async ({ request }) => {
      await loginViaApi(request, bipiUser)

      const response = await apiPatch(request, `/api/categories/${grgrLACategoryId}`, {
        preferredContentTypes: preferredContentTypeIrisBefore(),
        short: categoryBefore.short,
        name: categoryBefore.name,
        color: categoryBefore.color,
        numberingStyle: categoryBefore.numberingStyle,
      })
      expect(response.status()).toBe(200)
    })

    test('when preferredContentTypes are removed', async ({ request }) => {
      const uri = `/api/camps/${grgrCampId}/categories`

      await loginViaApi(request, bipiUser)

      await expectCacheMiss(request, uri)
      await expectCacheHit(request, uri)

      await apiPatch(request, `/api/categories/${grgrLACategoryId}`, {
        preferredContentTypes: [],
      })
      await waitForCacheMiss(request, uri)
      await expectCacheHit(request, uri)
    })

    test('when preferredContentType is added', async ({ request }) => {
      const uri = `/api/camps/${grgrCampId}/categories`

      await loginViaApi(request, bipiUser)

      await expectCacheMiss(request, uri)
      await expectCacheHit(request, uri)

      await apiPatch(request, `/api/categories/${grgrLACategoryId}`, {
        preferredContentTypes: [
          ...preferredContentTypeIrisBefore(),
          '/api/content_types/a4211c11211c',
        ],
      })
      await waitForCacheMiss(request, uri)
      await expectCacheHit(request, uri)
    })
  })
})
