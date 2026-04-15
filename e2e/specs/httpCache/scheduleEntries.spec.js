import { test, expect } from '@playwright/test'
import {
  bipiUser,
  bruceWayneUser,
  cachedEndpoint,
  castorUser,
  skilagerPeriodId,
  grgrPeriodId,
  harryMainPeriodId,
  harrySecondPeriodId,
} from './../constants.js'
import {
  loginAndSetCookie,
  expectCacheHit,
  expectCacheMiss,
  waitForCacheMiss,
  apiPatch,
  apiPost,
  apiDelete,
} from './../../utils/helpers.js'
import { readFileSync } from 'fs'
const collectionResponse = JSON.parse(
  readFileSync(new URL('./responses/schedule_entries_collection.json', import.meta.url))
)

const collectionXKeys =
  '10d8f02ce5b4 ' +
  'e68f4e47517a 7fa4564a5d5d e68f4e47517a#period e68f4e47517a#activity e68f4e47517a#day ' +
  'f0883e931649 f0883e931649#period f0883e931649#activity f0883e931649#day ' +
  '29c9e9a07d82 29c9e9a07d82#period 29c9e9a07d82#activity 29c9e9a07d82#day ' +
  'ee85308a97d1 ee85308a97d1#period ee85308a97d1#activity ee85308a97d1#day ' +
  'f08d69cae18a f08d69cae18a#period f08d69cae18a#activity f08d69cae18a#day ' +
  '7e8086d94633 7e8086d94633#period 7e8086d94633#activity 7e8086d94633#day ' +
  'f89a1501dbb6 f89a1501dbb6#period f89a1501dbb6#activity f89a1501dbb6#day ' +
  '/api/periods/7fa4564a5d5d/schedule_entries'

test.describe('cache test: /periods/{periodId}/scheduleEntries', () => {
  test('caches /periods/{periodId}/schedule_entries separately for each login', async ({
    browser,
  }) => {
    const uri = `/api/periods/${skilagerPeriodId}/schedule_entries`

    const context1 = await browser.newContext()
    const page1 = await context1.newPage()
    await loginAndSetCookie(page1, context1.request, bipiUser)

    const response = await context1.request.get(`${cachedEndpoint}${uri}.jsonhal`)
    const headers = response.headers()
    expect(headers['xkey']).toBe(collectionXKeys)
    expect(headers['x-cache']).toBe('MISS')
    const body = await response.json()
    expect(body).toEqual(collectionResponse)

    await expectCacheHit(context1.request, uri)
    await context1.close()

    const context2 = await browser.newContext()
    const page2 = await context2.newPage()
    await loginAndSetCookie(page2, context2.request, bruceWayneUser)
    await expectCacheMiss(context2.request, uri)
    await context2.close()
  })

  test('invalidates /periods/{periodId}/schedule_entries for all users on scheduleEntry patch', async ({
    browser,
  }) => {
    const uri = `/api/periods/${grgrPeriodId}/schedule_entries`
    const scheduleEntryId = '12f34c89ce11'

    const contextBipi = await browser.newContext()
    const pageBipi = await contextBipi.newPage()
    await loginAndSetCookie(pageBipi, contextBipi.request, bipiUser)
    await apiPatch(contextBipi.request, `/api/schedule_entries/${scheduleEntryId}`, {
      start: '2026-05-10T16:00:00+00:00',
    })

    await waitForCacheMiss(contextBipi.request, uri)
    await expectCacheHit(contextBipi.request, uri)

    const contextCastor = await browser.newContext()
    const pageCastor = await contextCastor.newPage()
    await loginAndSetCookie(pageCastor, contextCastor.request, castorUser)
    await expectCacheMiss(contextCastor.request, uri)
    await expectCacheHit(contextCastor.request, uri)

    await apiPatch(contextBipi.request, `/api/schedule_entries/${scheduleEntryId}`, {
      start: '2026-05-10T17:00:00+00:00',
    })

    await waitForCacheMiss(contextBipi.request, uri)
    await expectCacheHit(contextBipi.request, uri)

    await expectCacheMiss(contextBipi.request, uri)

    await contextBipi.close()
    await contextCastor.close()
  })

  test('invalidates /periods/{periodId}/schedule_entries for new scheduleEntry', async ({
    page,
    request,
  }) => {
    const uri = `/api/periods/${grgrPeriodId}/schedule_entries`

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    const response = await apiPost(request, '/api/schedule_entries', {
      start: '2026-05-10T10:00:00+00:00',
      end: '2026-05-10T11:00:00+00:00',
      period: `/api/periods/${grgrPeriodId}`,
      activity: `/api/activities/ffd08c52288c`,
    })
    const body = await response.json()
    const newScheduleEntryUri = body._links.self.href

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiDelete(request, newScheduleEntryUri)

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /periods/{periodId}/schedule_entries when moving a schedule entry to another period', async ({
    page,
    request,
  }) => {
    const uri1 = `/api/periods/${harryMainPeriodId}/schedule_entries`
    const uri2 = `/api/periods/${harrySecondPeriodId}/schedule_entries`
    const scheduleEntryId = '9a4173c9bb73'

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri1)
    await expectCacheMiss(request, uri2)
    await expectCacheHit(request, uri1)
    await expectCacheHit(request, uri2)

    await apiPatch(request, `/api/schedule_entries/${scheduleEntryId}`, {
      start: '2026-08-09T15:00:00+00:00',
      end: '2026-08-09T17:00:00+00:00',
      period: `/periods/${harrySecondPeriodId}`,
    })

    await waitForCacheMiss(request, uri1)
    await waitForCacheMiss(request, uri2)
    await expectCacheHit(request, uri1)
    await expectCacheHit(request, uri2)

    await apiPatch(request, `/api/schedule_entries/${scheduleEntryId}`, {
      start: '2026-07-20T15:00:00+00:00',
      end: '2026-07-20T17:00:00+00:00',
      period: `/periods/${harryMainPeriodId}`,
    })

    await waitForCacheMiss(request, uri1)
    await waitForCacheMiss(request, uri2)
    await expectCacheHit(request, uri1)
    await expectCacheHit(request, uri2)
  })

  test('invalidates /periods/{periodId}/schedule_entries when changing the period dates', async ({
    page,
    request,
  }) => {
    const uri = `/api/periods/${grgrPeriodId}/schedule_entries`

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiPatch(request, `/api/periods/${grgrPeriodId}`, {
      start: '2026-05-09',
      end: '2026-05-12',
      moveScheduleEntries: true,
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiPatch(request, `/api/periods/${grgrPeriodId}`, {
      start: '2026-05-10',
      end: '2026-05-13',
      moveScheduleEntries: true,
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })
})
