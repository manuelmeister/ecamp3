const { test, expect } = require('@playwright/test')
const {
  bipiUser,
  cachedEndpoint,
  castorUser,
  basiskursCampId,
} = require('../../constants')
const {
  loginAndSetCookie,
  expectCacheHit,
  expectCacheMiss,
  waitForCacheMiss,
  apiPatch,
  apiPost,
  apiDelete,
} = require('../../../utils/helpers')
const collectionResponse = require('./responses/checklists_collection.json')

const collectionXKeys =
  '146c0608237f ebbd0c61eb85 ebbd0c61eb85#camp /api/camps/5d28f99890bc/checklists'

test.describe('cache test: /camps/checklists', () => {
  test('caches /camp/{campId}/checklists separately for each login', async ({
    browser,
  }) => {
    const uri = `/api/camps/${basiskursCampId}/checklists`

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

  test('invalidates /camp/{campId}/checklists on checklist patch', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${basiskursCampId}/checklists`

    await loginAndSetCookie(page, request, bipiUser)
    await apiPatch(request, '/api/checklists/ebbd0c61eb85', { name: 'Training targets' })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiPatch(request, '/api/checklists/ebbd0c61eb85', { name: 'Ausbildungsziele' })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camp/{campId}/checklists for new checklist', async ({
    page,
    request,
  }) => {
    test.info().annotations.push({ type: 'retries', description: '3' }) // equivalent to Cypress retries config
    const uri = `/api/camps/${basiskursCampId}/checklists`

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    const response = await apiPost(request, '/api/checklists', {
      camp: `/api/camps/${basiskursCampId}`,
      name: 'new_checklist',
    })
    const body = await response.json()
    const newChecklistUri = body._links.self.href

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiDelete(request, newChecklistUri)

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })
})
