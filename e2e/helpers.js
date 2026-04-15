import { expect } from '@playwright/test'

// Use same env variables conceptually
const API_ROOT_URL = process.env.API_ROOT_URL || 'http://localhost:3000/api'
const API_ROOT_URL_CACHED = process.env.API_ROOT_URL_CACHED || 'http://localhost:3004'

export const cachedEndpoint = API_ROOT_URL_CACHED

export async function loginViaApi(request, identifier, password = 'test') {
  await request.post(`${API_ROOT_URL}/authentication_token`, {
    data: { identifier, password },
  })
}

export async function expectCacheHit(request, uri) {
  const response = await request.get(`${API_ROOT_URL_CACHED}${uri}.jsonhal`)
  const headers = response.headers()
  expect(headers['x-cache']).toBe('HIT')
  return response
}

export async function expectCacheMiss(request, uri) {
  const response = await request.get(`${API_ROOT_URL_CACHED}${uri}.jsonhal`)
  const headers = response.headers()
  expect(headers['x-cache']).toBe('MISS')
  return response
}

export async function expectCachePass(request, uri) {
  const response = await request.get(`${API_ROOT_URL_CACHED}${uri}.jsonhal`)
  const headers = response.headers()
  expect(headers['x-cache']).toBe('PASS')
  return response
}

export async function waitForCacheMiss(request, uri, timeout = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const response = await request.get(`${API_ROOT_URL_CACHED}${uri}.jsonhal`)
    const headers = response.headers()
    if (headers['x-cache'] === 'MISS') {
      return response
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Timeout waiting for cache miss on ${uri}`)
}

export async function apiGet(request, uri) {
  return await request.get(`${API_ROOT_URL_CACHED}${uri}`)
}

export async function apiPatch(request, uri, body) {
  return await request.patch(`${API_ROOT_URL_CACHED}${uri}`, {
    data: body,
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
  })
}

export async function apiPost(request, uri, body) {
  return await request.post(`${API_ROOT_URL_CACHED}${uri}`, {
    data: body,
    headers: {
      'Content-Type': 'application/hal+json',
    },
  })
}

export async function apiDelete(request, uri) {
  return await request.delete(`${API_ROOT_URL_CACHED}${uri}`)
}
