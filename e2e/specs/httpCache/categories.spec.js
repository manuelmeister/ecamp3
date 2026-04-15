import { test, expect } from '@playwright/test'
import {
  loginViaApi,
  expectCacheHit,
  expectCacheMiss,
  expectCachePass,
  waitForCacheMiss,
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from '../../helpers'
import {
  bipiUser,
  bruceWayneUser,
  cachedEndpoint,
  castorUser,
  felicitySmoakUser,
  grgrCampId,
  loremIpsumCampId,
} from '../constants'
import collectionResponse from './responses/categories_collection.json'

const grgrLACategoryId = '1a869b162875'

const collectionXKeys =
  /* campCollaboration for bipiUser */
  'b0bdb7202a9d ' +
  /* Category ES */
  'ebfd46a1c181 ebfd46a1c181#camp ebfd46a1c181#preferredContentTypes ebfd46a1c181#rootContentNode ebfd46a1c181#embeddedPreferredContentTypes ebfd46a1c181#emptyContentNodesForIriGeneration ' +
  /* Category LA */
  '1a869b162875 1a869b162875#camp 1a869b162875#preferredContentTypes 1a869b162875#rootContentNode f17470519474 1a0f84e322c8 3ef17bd1df72 4f0c657fecef a4211c112939 44dcc7493c65 cfccaecd4bad 318e064ea0c9 1a869b162875#embeddedPreferredContentTypes 1a869b162875#emptyContentNodesForIriGeneration ' +
  /* Category LP */
  'dfa531302823 dfa531302823#camp dfa531302823#preferredContentTypes dfa531302823#rootContentNode dfa531302823#embeddedPreferredContentTypes dfa531302823#emptyContentNodesForIriGeneration ' +
  /* Category LS */
  'a023e85227ac a023e85227ac#camp a023e85227ac#preferredContentTypes a023e85227ac#rootContentNode a023e85227ac#embeddedPreferredContentTypes a023e85227ac#emptyContentNodesForIriGeneration ' +
  /* collection URI (for detecting addition of new categories) */
  '/api/camps/3c79b99ab424/categories'

test.describe('cache test: /camps/{campId}/categories', () => {
  test('caches /camps/{campId}/categories separately for each login', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/categories`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // first request is a cache miss
    const response = await request.get(`${cachedEndpoint}${uri}.jsonhal`)
    {
      const headers = response.headers()
      expect(headers['xkey']).toBe(collectionXKeys)
      expect(headers['x-cache']).toBe('MISS')
      expect(await response.json()).toEqual(collectionResponse)
    }

    // second request is a cache hit
    await expectCacheHit(request, uri)

    // request with a new user is a cache miss
    await loginViaApi(request, castorUser)
    await expectCacheMiss(request, uri)
  })

  test('invalidates /camps/{campId}/categories for all users on category patch', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${loremIpsumCampId}/categories`

    // bring data into defined state
    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bruceWayneUser)
    await apiPatch(request, '/api/categories/c5e1bc565094', {
      name: 'old_name',
    })

    // warm up cache
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await loginViaApi(request, felicitySmoakUser)
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // touch category
    await apiPatch(request, '/api/categories/c5e1bc565094', {
      name: 'new_name',
    })

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await loginViaApi(request, bruceWayneUser)
    await expectCacheMiss(request, uri)
  })

  test('invalidates /camps/{campId}/categories for new category', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/categories`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // warm up cache
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // add new category to camp
    const response = await apiPost(request, '/api/categories', {
      camp: `/api/camps/${grgrCampId}`,
      short: 'new',
      name: 'new Category',
      color: '#000000',
      numberingStyle: '1',
    })

    const newContentNodeUri = (await response.json())._links.self.href

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // delete newly created contentNode
    await apiDelete(request, newContentNodeUri)

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test.skip('invalidates cached data when user leaves a camp', async ({
    page,
    request,
  }) => {
    // no-op, playwright contexts are isolated by default in test
    const uri = `/api/camps/${grgrCampId}/categories`

    // cy.intercept('PATCH', '/api/camp_collaborations/**').as('camp_collaboration')
    // cy.intercept('PATCH', '/api/invitations/**').as('invitations')

    // warm up cache
    await loginViaApi(request, castorUser)
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // deactivate Castor
    await loginViaApi(request, bipiUser)
    await page.goto(`/camps/${grgrCampId}/GRGR/admin/collaborators`)
    await page.locator('.v-list-item__title:has-text("Castor")').click()
    await page.locator('button:has-text("Deaktivieren")').click()
    await page.locator('div[role=alert] button:has-text("Deaktivieren")').click()
    // cy.wait('@camp_collaboration')

    // ensure cache was invalidated
    await loginViaApi(request, castorUser)
    const response = await request.post(`${cachedEndpoint}${uri}.jsonhal`, {
      failOnStatusCode: false,
    })
    expect(response.status()).toBe(404)

    // delete old emails
    await request.delete('/mail/email/all')

    // invite Castor
    await loginViaApi(request, bipiUser)
    await page.goto(`/camps/${grgrCampId}/GRGR/admin/collaborators`)
    await page.locator('.v-list-item__title:has-text("Castor")').click()
    await page.locator('button:has-text("Erneut einladen")').click()
    // cy.wait('@camp_collaboration')

    // accept invitation as Castor
    await loginViaApi(request, castorUser)

    const response2 = await request.post('/mail/email')
    const emailHtmlContent = (await response2.json())[0].html

    await page.locator('a:has-text("Einladung beantworten")').click()

    await page
      .locator('button:has-text("Einladung mit aktuellem Account akzeptieren")')
      .click()
    // cy.wait('@invitations')
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

    test('when preferredContentTypes are removed', async ({ page, request }) => {
      const uri = `/api/camps/${grgrCampId}/categories`

      // no-op, playwright contexts are isolated by default in test
      await loginViaApi(request, bipiUser)

      // warm up cache
      await expectCacheMiss(request, uri)
      await expectCacheHit(request, uri)

      // set the preferredContentTypes to empty
      const response = await apiPatch(request, `/api/categories/${grgrLACategoryId}`, {
        preferredContentTypes: [],
      })
      {
        // ensure cache was invalidated
        await waitForCacheMiss(request, uri)
        await expectCacheHit(request, uri)
      }
    })

    test('when preferredContentType is added', async ({ page, request }) => {
      const uri = `/api/camps/${grgrCampId}/categories`

      // no-op, playwright contexts are isolated by default in test
      await loginViaApi(request, bipiUser)

      // warm up cache
      await expectCacheMiss(request, uri)
      await expectCacheHit(request, uri)

      // add new preferredContentType
      const response = await apiPatch(request, `/api/categories/${grgrLACategoryId}`, {
        preferredContentTypes: [
          ...preferredContentTypeIrisBefore(),
          '/api/content_types/a4211c11211c',
        ],
      })
      {
        // ensure cache was invalidated
        await waitForCacheMiss(request, uri)
        await expectCacheHit(request, uri)
      }
    })
  })
})
