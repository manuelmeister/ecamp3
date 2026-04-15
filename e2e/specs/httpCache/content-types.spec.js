const { test, expect } = require('@playwright/test')
const { bipiUser, cachedEndpoint, castorUser } = require('../../constants')
const {
  loginAndSetCookie,
  expectCacheHit,
  expectCacheMiss,
} = require('../../../utils/helpers')
const collectionResponse = require('./responses/content_types_collection.json')
const itemResponse = require('./responses/content_types_entity.json')

const collectionXKeys =
  'a4211c11211c f17470519474 1a0f84e322c8 c462edd869f3 5e2028c55ee4 3ef17bd1df72 4f0c657fecef a4211c112939 44dcc7493c65 cfccaecd4bad 318e064ea0c9 /api/content_types'

test.describe('cache test: /content-types', () => {
  test('caches collection separately for each login', async ({ browser }) => {
    const uri = '/api/content_types'

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

  test('caches item', async ({ page, request }) => {
    const contentTypeId = '318e064ea0c9'
    const uri = `/api/content_types/${contentTypeId}`

    await loginAndSetCookie(page, request, bipiUser)

    const response = await request.get(`${cachedEndpoint}${uri}.jsonhal`)
    const headers = response.headers()
    expect(headers['xkey']).toBe(contentTypeId)
    expect(headers['x-cache']).toBe('MISS')
    const body = await response.json()
    expect(body).toEqual(itemResponse)

    await expectCacheHit(request, uri)
  })
})
