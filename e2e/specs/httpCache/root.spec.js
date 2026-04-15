import { test } from '@playwright/test'
import { loginViaApi, expectCacheHit, expectCacheMiss } from '../../helpers'

const user1 = 'test@example.com'
const user2 = 'castor@example.com'

test('caches the root endpoint', async ({ request }) => {
  const uri = '/api/index'

  await loginViaApi(request, user1)

  await expectCacheMiss(request, uri)

  await expectCacheHit(request, uri)

  await loginViaApi(request, user2)
  await expectCacheMiss(request, uri)
})
