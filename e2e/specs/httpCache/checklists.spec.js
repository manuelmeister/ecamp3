import { test, expect } from '@playwright/test'
import {
  loginViaApi,
  expectCacheHit,
  expectCacheMiss,
  waitForCacheMiss,
  apiPost,
  apiPatch,
  apiDelete,
  cachedEndpoint,
} from '../../helpers'
import { bipiUser, castorUser, basiskursCampId } from '../constants'
import collectionResponse from './responses/checklists_collection.json'

const collectionXKeys =
  'ebbd0c61eb85 ebbd0c61eb85#camp 23516cc07afc 23516cc07afc#camp 3a9c97b81f18 3a9c97b81f18#camp /api/camps/5d28f99890bc/checklists'

test.describe('cache test: /camps/checklists', () => {
  test('caches /camp/{campId}/checklists separately for each login', async ({
    request,
  }) => {
    const uri = `/api/camps/${basiskursCampId}/checklists`

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

  test('invalidates /camp/{campId}/checklists on checklist patch', async ({
    request,
  }) => {
    const uri = `/api/camps/${basiskursCampId}/checklists`

    await loginViaApi(request, bipiUser)
    await apiPatch(request, '/api/checklists/ebbd0c61eb85', {
      name: 'Training targets',
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiPatch(request, '/api/checklists/ebbd0c61eb85', {
      name: 'Ausbildungsziele',
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camp/{campId}/checklists for new checklist', async ({ request }) => {
    const uri = `/api/camps/${basiskursCampId}/checklists`

    await loginViaApi(request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    const response = await apiPost(request, '/api/checklists', {
      camp: `/api/camps/${basiskursCampId}`,
      name: 'new_checklist',
    })

    const newChecklistUri = (await response.json())._links.self.href

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiDelete(request, newChecklistUri)

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })
})
