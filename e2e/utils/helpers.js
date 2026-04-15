const { expect } = require('@playwright/test')

const API_ROOT_URL = process.env.API_ROOT_URL || 'http://localhost:3000/api'
const API_ROOT_URL_CACHED = process.env.API_ROOT_URL_CACHED || 'http://localhost:3004'

async function login(request, identifier, password = 'test') {
  const response = await request.post(`${API_ROOT_URL}/authentication_token`, {
    data: { identifier, password },
  })
  expect(response.status()).toBe(200)
  const body = await response.json()
  const token = body.token
  return token
}

async function loginAndSetCookie(page, request, identifier, password = 'test') {
  const token = await login(request, identifier, password)
  // In the Vue frontend, auth might be stored in localStorage or handled via cookies.
  // We'll navigate to the root to initialize the domain, then inject localStorage.
  await page.goto('/')
  await page.evaluate((token) => {
    localStorage.setItem('auth._token.local', `Bearer ${token}`)
    localStorage.setItem('auth.strategy', 'local')
  }, token)
  // Reload to apply the token
  await page.reload()
}

async function expectCacheHeader(request, uri, expectedHeader) {
  const response = await request.get(`${API_ROOT_URL_CACHED}${uri}.jsonhal`)
  expect(response.headers()['x-cache']).toBe(expectedHeader)
}

async function expectCacheHit(request, uri) {
  await expectCacheHeader(request, uri, 'HIT')
}

async function expectCacheMiss(request, uri) {
  await expectCacheHeader(request, uri, 'MISS')
}

async function expectCachePass(request, uri) {
  await expectCacheHeader(request, uri, 'PASS')
}

async function waitForCacheMiss(request, uri) {
  await expect
    .poll(
      async () => {
        const response = await request.get(`${API_ROOT_URL_CACHED}${uri}.jsonhal`)
        return response.headers()['x-cache']
      },
      { timeout: 10000 }
    )
    .toBe('MISS')
}

async function apiGet(request, uri) {
  return await request.get(`${API_ROOT_URL_CACHED}${uri}.jsonhal`)
}

async function apiPatch(request, uri, data) {
  return await request.patch(`${API_ROOT_URL_CACHED}${uri}.jsonhal`, {
    data,
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
  })
}

async function apiPost(request, uri, data) {
  return await request.post(`${API_ROOT_URL_CACHED}${uri}.jsonhal`, {
    data,
    headers: {
      'Content-Type': 'application/hal+json',
    },
  })
}

async function apiDelete(request, uri) {
  return await request.delete(`${API_ROOT_URL_CACHED}${uri}.jsonhal`)
}

module.exports = {
  login,
  loginAndSetCookie,
  expectCacheHit,
  expectCacheMiss,
  expectCachePass,
  waitForCacheMiss,
  apiGet,
  apiPatch,
  apiPost,
  apiDelete,
  API_ROOT_URL,
  API_ROOT_URL_CACHED,
}
