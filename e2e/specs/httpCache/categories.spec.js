const { test, expect } = require('@playwright/test')
const {
  bipiUser,
  bruceWayneUser,
  cachedEndpoint,
  castorUser,
  felicitySmoakUser,
  grgrCampId,
  loremIpsumCampId,
} = require('../../constants')
const {
  loginAndSetCookie,
  expectCacheHit,
  expectCacheMiss,
  waitForCacheMiss,
  apiGet,
  apiPatch,
  apiPost,
  apiDelete,
} = require('../../../utils/helpers')
const collectionResponse = require('./responses/categories_collection.json')

const grgrLACategoryId = '1a869b162875'

const collectionXKeys =
  'b0bdb7202a9d ' +
  'ebfd46a1c181 ebfd46a1c181#camp ebfd46a1c181#preferredContentTypes ebfd46a1c181#rootContentNode ebfd46a1c181#embeddedPreferredContentTypes ebfd46a1c181#emptyContentNodesForIriGeneration ' +
  '1a869b162875 1a869b162875#camp 1a869b162875#preferredContentTypes 1a869b162875#rootContentNode f17470519474 1a0f84e322c8 3ef17bd1df72 4f0c657fecef a4211c112939 44dcc7493c65 cfccaecd4bad 318e064ea0c9 1a869b162875#embeddedPreferredContentTypes 1a869b162875#emptyContentNodesForIriGeneration ' +
  'dfa531302823 dfa531302823#camp dfa531302823#preferredContentTypes dfa531302823#rootContentNode dfa531302823#embeddedPreferredContentTypes dfa531302823#emptyContentNodesForIriGeneration ' +
  'a023e85227ac a023e85227ac#camp a023e85227ac#preferredContentTypes a023e85227ac#rootContentNode a023e85227ac#embeddedPreferredContentTypes a023e85227ac#emptyContentNodesForIriGeneration ' +
  '/api/camps/3c79b99ab424/categories'

test.describe('cache test: /camps/{campId}/categories', () => {
  test('caches /camps/{campId}/categories separately for each login', async ({
    browser,
  }) => {
    const uri = `/api/camps/${grgrCampId}/categories`

    const context1 = await browser.newContext()
    const page1 = await context1.newPage()
    await loginAndSetCookie(page1, context1.request, bipiUser)

    const response = await context1.request.get(`${cachedEndpoint}${uri}.jsonhal`)
    const headers = response.headers()
    expect(headers['xkey']).toBe(collectionXKeys)
    expect(headers['x-cache']).toBe('MISS')
    const body = await response.json()
    expect(body).toEqual(collectionResponse)

    await expectCacheHit(context1.request, uri)
    await context1.close()

    const context2 = await browser.newContext()
    const page2 = await context2.newPage()
    await loginAndSetCookie(page2, context2.request, castorUser)
    await expectCacheMiss(context2.request, uri)
    await context2.close()
  })

  test('invalidates /camps/{campId}/categories for all users on category patch', async ({
    browser,
  }) => {
    const uri = `/api/camps/${loremIpsumCampId}/categories`

    const contextBW = await browser.newContext()
    const pageBW = await contextBW.newPage()
    await loginAndSetCookie(pageBW, contextBW.request, bruceWayneUser)
    await apiPatch(contextBW.request, '/api/categories/c5e1bc565094', {
      name: 'old_name',
    })

    await waitForCacheMiss(contextBW.request, uri)
    await expectCacheHit(contextBW.request, uri)

    const contextFS = await browser.newContext()
    const pageFS = await contextFS.newPage()
    await loginAndSetCookie(pageFS, contextFS.request, felicitySmoakUser)
    await expectCacheMiss(contextFS.request, uri)
    await expectCacheHit(contextFS.request, uri)

    await apiPatch(contextBW.request, '/api/categories/c5e1bc565094', {
      name: 'new_name',
    })

    await waitForCacheMiss(contextBW.request, uri)
    await expectCacheHit(contextBW.request, uri)

    await expectCacheMiss(contextBW.request, uri)

    await contextBW.close()
    await contextFS.close()
  })

  test('invalidates /camps/{campId}/categories for new category', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/categories`

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    const response = await apiPost(request, '/api/categories', {
      camp: `/api/camps/${grgrCampId}`,
      short: 'new',
      name: 'new Category',
      color: '#000000',
      numberingStyle: '1',
    })
    const body = await response.json()
    const newContentNodeUri = body._links.self.href

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiDelete(request, newContentNodeUri)

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test.describe('invalidates /camps/{campId}/categories', () => {
    let categoryBefore
    function preferredContentTypeIrisBefore() {
      return categoryBefore._embedded.preferredContentTypes.map(
        (contentType) => contentType._links.self.href
      )
    }

    test.beforeEach(async ({ page, request }) => {
      await loginAndSetCookie(page, request, bipiUser)
      const response = await apiGet(request, `/api/categories/${grgrLACategoryId}`)
      categoryBefore = await response.json()
      expect(preferredContentTypeIrisBefore().length).toBeGreaterThan(0)
    })

    test.afterEach(async ({ page, request }) => {
      // Assuming context isn't closed yet
      await loginAndSetCookie(page, request, bipiUser)
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

      await loginAndSetCookie(page, request, bipiUser)

      await expectCacheMiss(request, uri)
      await expectCacheHit(request, uri)

      await apiPatch(request, `/api/categories/${grgrLACategoryId}`, {
        preferredContentTypes: [],
      })

      await waitForCacheMiss(request, uri)
      await expectCacheHit(request, uri)
    })

    test('when preferredContentType is added', async ({ page, request }) => {
      const uri = `/api/camps/${grgrCampId}/categories`

      await loginAndSetCookie(page, request, bipiUser)

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
