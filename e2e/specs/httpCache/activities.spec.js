import { test, expect } from '@playwright/test'
import {
  bipiUser,
  bruceWayneUser,
  cachedEndpoint,
  felicitySmoakUser,
  grgrCampId,
  grgrPeriodId,
  loremIpsumCampId,
  skilagerCampId,
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
  readFileSync(new URL('./responses/activities_collection.json', import.meta.url))
)

const collectionXKeys =
  '10d8f02ce5b4 ' +
  'a13fadc97610 a13fadc97610#scheduleEntries a13fadc97610#camp a13fadc97610#category a13fadc97610#progressLabel a13fadc97610#activityResponsibles a13fadc97610#rootContentNode ' +
  'af92782262d7 af92782262d7#camp a13fadc97610#embeddedProgressLabel ' +
  '29c9e9a07d82 7fa4564a5d5d 29c9e9a07d82#period 29c9e9a07d82#activity 29c9e9a07d82#day ' +
  'f08d69cae18a f08d69cae18a#period f08d69cae18a#activity f08d69cae18a#day ' +
  '7e8086d94633 7e8086d94633#period 7e8086d94633#activity 7e8086d94633#day ' +
  'a13fadc97610#embeddedScheduleEntries ' +
  '06743ccfeedd 06743ccfeedd#activity 06743ccfeedd#campCollaboration ' +
  '21bc6661c569 21bc6661c569#activity 21bc6661c569#campCollaboration ' +
  'a13fadc97610#embeddedActivityResponsibles a13fadc97610#emptyContentNodesForIriGeneration ' +
  'b29d387cc403 b29d387cc403#scheduleEntries b29d387cc403#camp b29d387cc403#category b29d387cc403#progressLabel b29d387cc403#activityResponsibles ' +
  'b29d387cc403#rootContentNode b29d387cc403#embeddedProgressLabel ' +
  'e68f4e47517a e68f4e47517a#period e68f4e47517a#activity e68f4e47517a#day ' +
  'f0883e931649 f0883e931649#period f0883e931649#activity f0883e931649#day ' +
  'ee85308a97d1 ee85308a97d1#period ee85308a97d1#activity ee85308a97d1#day ' +
  'f89a1501dbb6 f89a1501dbb6#period f89a1501dbb6#activity f89a1501dbb6#day ' +
  'b29d387cc403#embeddedScheduleEntries ' +
  'a9a760e36fd8 a9a760e36fd8#activity a9a760e36fd8#campCollaboration b29d387cc403#embeddedActivityResponsibles ' +
  'b29d387cc403#emptyContentNodesForIriGeneration ' +
  '/api/camps/70ca971c992f/activities'

test.describe('cache test: /camps/{campId}/activities', () => {
  test('caches /camps/{campId}/activities separately for each login', async ({
    browser,
  }) => {
    const uri = `/api/camps/${skilagerCampId}/activities`

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

  test('invalidates /camps/{campId}/activities for all users on activity patch', async ({
    browser,
  }) => {
    const uri = `/api/camps/${loremIpsumCampId}/activities`
    const activityId = '3d1e5c91ceb2'

    const contextBW = await browser.newContext()
    const pageBW = await contextBW.newPage()
    await loginAndSetCookie(pageBW, contextBW.request, bruceWayneUser)
    await apiPatch(contextBW.request, `/api/activities/${activityId}`, {
      title: 'Breakfast',
    })

    await waitForCacheMiss(contextBW.request, uri)
    await expectCacheHit(contextBW.request, uri)

    const contextFS = await browser.newContext()
    const pageFS = await contextFS.newPage()
    await loginAndSetCookie(pageFS, contextFS.request, felicitySmoakUser)
    await expectCacheMiss(contextFS.request, uri)
    await expectCacheHit(contextFS.request, uri)

    await apiPatch(contextBW.request, `/api/activities/${activityId}`, {
      title: 'Frühstück',
    })

    await waitForCacheMiss(contextBW.request, uri)
    await expectCacheHit(contextBW.request, uri)

    await expectCacheMiss(contextBW.request, uri)

    await contextBW.close()
    await contextFS.close()
  })

  test('invalidates /camps/{campId}/activities for new activity', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    const response = await apiPost(request, '/api/activities', {
      title: 'New_activity',
      category: '/api/categories/1a869b162875',
      scheduleEntries: [
        {
          period: '/periods/76be24bce434',
          start: '2026-05-10T08:00:00+00:00',
          end: '2026-05-10T09:00:00+00:00',
        },
      ],
    })
    const body = await response.json()
    const newActivityUri = body._links.self.href

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiDelete(request, newActivityUri)

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when adding a scheduleEntry', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    const response = await apiPost(request, '/api/schedule_entries', {
      activity: '/activities/ffd08c52288c',
      end: '2026-05-11T06:00:00+00:00',
      period: '/periods/76be24bce434',
      start: '2026-05-11T05:00:00+00:00',
    })
    const body = await response.json()
    const newScheduleEntryUri = body._links.self.href

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiDelete(request, newScheduleEntryUri)

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when patching a progress label', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`
    const progressLabelId = '82547049ea38'

    await loginAndSetCookie(page, request, bipiUser)
    await apiPatch(request, `/api/activity_progress_labels/${progressLabelId}`, {
      title: 'Planned',
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiPatch(request, `/api/activity_progress_labels/${progressLabelId}`, {
      title: 'Geplant',
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when adding an activity responsible', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    const response = await apiPost(request, '/api/activity_responsibles', {
      activity: '/activities/ffd08c52288c',
      campCollaboration: '/camp_collaborations/b0bdb7202a9d',
    })
    const body = await response.json()
    const newActivityResponsibleUri = body._links.self.href

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiDelete(request, newActivityResponsibleUri)

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when changing the period dates (moveScheduleEntries: true)', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

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

  test('invalidates /camps/{campId}/activities when changing the period dates (moveScheduleEntries: false)', async ({
    page,
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    await loginAndSetCookie(page, request, bipiUser)

    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiPatch(request, `/api/periods/${grgrPeriodId}`, {
      start: '2026-05-09',
      moveScheduleEntries: false,
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await apiPatch(request, `/api/periods/${grgrPeriodId}`, {
      start: '2026-05-10',
      moveScheduleEntries: false,
    })

    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })
})
