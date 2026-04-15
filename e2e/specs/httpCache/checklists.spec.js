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
import { bipiUser, cachedEndpoint, castorUser, basiskursCampId } from '../constants'
import collectionResponse from './responses/checklists_collection.json'

const collectionXKeys =
  /* campCollaboration for bipiUser */
  '146c0608237f ' +
  /* checklist entry */
  'ebbd0c61eb85 ebbd0c61eb85#camp ' +
  /* collection URI (for detecting addition of new checklists) */
  '/api/camps/5d28f99890bc/checklists'

test.describe('cache test: /camps/checklists', () => {
  test('caches /camp/{campId}/checklists separately for each login', async ({
    request,
  }) => {
    const uri = `/api/camps/${basiskursCampId}/checklists`

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

  test('invalidates /camp/{campId}/checklists on checklist patch', async ({
    request,
  }) => {
    const uri = `/api/camps/${basiskursCampId}/checklists`

    // bring data into defined state
    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)
    await apiPatch(request, '/api/checklists/ebbd0c61eb85', {
      name: 'Training targets',
    })

    // warm up cache
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // touch checklist
    await apiPatch(request, '/api/checklists/ebbd0c61eb85', {
      name: 'Ausbildungsziele',
    })

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camp/{campId}/checklists for new checklist', async ({ request }) => {
    const uri = `/api/camps/${basiskursCampId}/checklists`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // warm up cache
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // add new checklist to camp
    const response = await apiPost(request, '/api/checklists', {
      camp: `/api/camps/${basiskursCampId}`,
      name: 'new_checklist',
    })

    const newChecklistUri = (await response.json())._links.self.href

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // delete newly created contentNode
    await apiDelete(request, newChecklistUri)

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })
})
