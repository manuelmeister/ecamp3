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
import collectionResponse from './responses/content_types_collection.json'
import itemResponse from './responses/content_types_entity.json'
import { bipiUser, cachedEndpoint, castorUser } from '../constants'

const collectionXKeys =
  'a4211c11211c f17470519474 1a0f84e322c8 c462edd869f3 5e2028c55ee4 3ef17bd1df72 4f0c657fecef a4211c112939 44dcc7493c65 cfccaecd4bad 318e064ea0c9 /api/content_types'

test.describe('cache test: /content-types', () => {
  test('caches collection separately for each login', async ({ request }) => {
    const uri = '/api/content_types'

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

  test('caches item', async ({ request }) => {
    const contentTypeId = '318e064ea0c9'
    const uri = `/api/content_types/${contentTypeId}`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // first request is a cache miss
    const response = await request.get(`${cachedEndpoint}${uri}.jsonhal`)
    {
      const headers = response.headers()
      expect(headers['xkey']).toBe(contentTypeId)
      expect(headers['x-cache']).toBe('MISS')
      expect(await response.json()).toEqual(itemResponse)
    }

    // second request is a cache hit
    await expectCacheHit(request, uri)
  })
})
