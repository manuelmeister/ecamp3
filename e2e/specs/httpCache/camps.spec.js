const { test } = require('@playwright/test')
const { loginAndSetCookie, expectCachePass } = require('../../utils/helpers')

test("doesn't cache /camps", async ({ page, request }) => {
  const uri = '/api/camps'
  await loginAndSetCookie(page, request, 'test@example.com')
  await expectCachePass(request, uri)
})
