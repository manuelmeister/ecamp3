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
  cachedEndpoint,
} from '../../helpers'
const user1 = 'test@example.com'
const user2 = 'castor@example.com'

test('caches the root endpoint', async ({ request }) => {
  const uri = '/api/index'

  // no-op, playwright contexts are isolated by default in test
  await loginViaApi(request, user1)

  // first request is a cache miss
  await expectCacheMiss(request, uri)

  // second request is a cache hit
  await expectCacheHit(request, uri)

  await loginViaApi(request, user2)
  await expectCacheMiss(request, uri)
})
