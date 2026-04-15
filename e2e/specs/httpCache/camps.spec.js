import { test } from '@playwright/test'
import { loginViaApi, expectCachePass } from '../../helpers'

test("doesn't cache /camps", async ({ request }) => {
  const uri = '/api/camps'
  await loginViaApi(request, 'test@example.com')
  await expectCachePass(request, uri)
})
