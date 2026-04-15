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

test("doesn't cache /camps", async ({ request }) => {
  const uri = '/api/camps'
  // no-op, playwright contexts are isolated by default in test
  await loginViaApi(request, 'test@example.com')
  await expectCachePass(request, uri)
})
