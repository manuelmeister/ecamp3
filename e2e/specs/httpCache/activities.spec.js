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
import {
  bipiUser,
  bruceWayneUser,
  cachedEndpoint,
  felicitySmoakUser,
  grgrCampId,
  grgrPeriodId,
  loremIpsumCampId,
  skilagerCampId,
} from '../constants'
import collectionResponse from './responses/activities_collection.json'

const collectionXKeys =
  /* campCollaboration for bipiUser */
  '10d8f02ce5b4 ' +
  /**
   * activitiy "Snowboardfahren"
   */
  'a13fadc97610 a13fadc97610#scheduleEntries a13fadc97610#camp a13fadc97610#category a13fadc97610#progressLabel a13fadc97610#activityResponsibles a13fadc97610#rootContentNode ' +
  /* embedded progress labels: */
  'af92782262d7 af92782262d7#camp a13fadc97610#embeddedProgressLabel ' +
  /* embedded schedule entries: */
  /* (the first schedule entry also includes the period id) */
  '29c9e9a07d82 7fa4564a5d5d 29c9e9a07d82#period 29c9e9a07d82#activity 29c9e9a07d82#day ' +
  'f08d69cae18a f08d69cae18a#period f08d69cae18a#activity f08d69cae18a#day ' +
  '7e8086d94633 7e8086d94633#period 7e8086d94633#activity 7e8086d94633#day ' +
  'a13fadc97610#embeddedScheduleEntries ' +
  /* embedded activitiy responsibles: */
  '06743ccfeedd 06743ccfeedd#activity 06743ccfeedd#campCollaboration ' +
  '21bc6661c569 21bc6661c569#activity 21bc6661c569#campCollaboration ' +
  'a13fadc97610#embeddedActivityResponsibles a13fadc97610#emptyContentNodesForIriGeneration ' +
  /**
   * activity "Skifahren"
   */
  'b29d387cc403 b29d387cc403#scheduleEntries b29d387cc403#camp b29d387cc403#category b29d387cc403#progressLabel b29d387cc403#activityResponsibles ' +
  /* embedded progress labels: */
  'b29d387cc403#rootContentNode b29d387cc403#embeddedProgressLabel ' +
  /* embedded schedule entries: */
  'e68f4e47517a e68f4e47517a#period e68f4e47517a#activity e68f4e47517a#day ' +
  'f0883e931649 f0883e931649#period f0883e931649#activity f0883e931649#day ' +
  'ee85308a97d1 ee85308a97d1#period ee85308a97d1#activity ee85308a97d1#day ' +
  'f89a1501dbb6 f89a1501dbb6#period f89a1501dbb6#activity f89a1501dbb6#day ' +
  /* embedded activitiy responsibles: */
  'b29d387cc403#embeddedScheduleEntries ' +
  'a9a760e36fd8 a9a760e36fd8#activity a9a760e36fd8#campCollaboration b29d387cc403#embeddedActivityResponsibles ' +
  'b29d387cc403#emptyContentNodesForIriGeneration ' +
  /* collection URI (for detecting addition of new activities) */
  '/api/camps/70ca971c992f/activities'

test.describe('cache test: /camps/{campId}/activities', () => {
  test('caches /camps/{campId}/activities separately for each login', async ({
    request,
  }) => {
    const uri = `/api/camps/${skilagerCampId}/activities`

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
    await loginViaApi(request, bruceWayneUser)
    await expectCacheMiss(request, uri)
  })

  test('invalidates /camps/{campId}/activities for all users on activity patch', async ({
    request,
  }) => {
    const uri = `/api/camps/${loremIpsumCampId}/activities`
    const activityId = '3d1e5c91ceb2'

    // bring data into defined state
    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bruceWayneUser)
    await apiPatch(request, `/api/activities/${activityId}`, {
      title: 'Breakfast',
    })

    // warm up cache
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await loginViaApi(request, felicitySmoakUser)
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // touch activity
    await apiPatch(request, `/api/activities/${activityId}`, {
      title: 'Frühstück',
    })

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    await loginViaApi(request, bruceWayneUser)
    await expectCacheMiss(request, uri)
  })

  test('invalidates /camps/{campId}/activities for new activity', async ({ request }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // warm up cache
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // add new activity to camp
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

    const newActivityUri = (await response.json())._links.self.href

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // delete newly created contentNode
    await apiDelete(request, newActivityUri)

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when adding a scheduleEntry', async ({
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // warm up cache
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // add new scheduleEntry
    const response = await apiPost(request, '/api/schedule_entries', {
      activity: '/activities/ffd08c52288c',
      end: '2026-05-11T06:00:00+00:00',
      period: '/periods/76be24bce434',
      start: '2026-05-11T05:00:00+00:00',
    })

    const newScheduleEntryUri = (await response.json())._links.self.href

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // delete newly created scheduleEntry
    await apiDelete(request, newScheduleEntryUri)

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when patching a progress label', async ({
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`
    const progressLabelId = '82547049ea38'

    // bring data into defined state
    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)
    await apiPatch(request, `/api/activity_progress_labels/${progressLabelId}`, {
      title: 'Planned',
    })

    // warm up cache
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // touch progress label
    await apiPatch(request, `/api/activity_progress_labels/${progressLabelId}`, {
      title: 'Geplant',
    })

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when adding an activity responsible', async ({
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // warm up cache
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // add new scheduleEntry
    const response = await apiPost(request, '/api/activity_responsibles', {
      activity: '/activities/ffd08c52288c',
      campCollaboration: '/camp_collaborations/b0bdb7202a9d',
    })

    const newActivityResponsibleUri = (await response.json())._links.self.href

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // delete newly created scheduleEntry
    await apiDelete(request, newActivityResponsibleUri)

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when changing the period dates (moveScheduleEntries: true)', async ({
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // warm up cache
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // move period start date
    await apiPatch(request, `/api/periods/${grgrPeriodId}`, {
      start: '2026-05-09',
      end: '2026-05-12',
      moveScheduleEntries: true,
    })

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // move period start date
    await apiPatch(request, `/api/periods/${grgrPeriodId}`, {
      start: '2026-05-10',
      end: '2026-05-13',
      moveScheduleEntries: true,
    })

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })

  test('invalidates /camps/{campId}/activities when changing the period dates (moveScheduleEntries: false)', async ({
    request,
  }) => {
    const uri = `/api/camps/${grgrCampId}/activities`

    // no-op, playwright contexts are isolated by default in test
    await loginViaApi(request, bipiUser)

    // warm up cache
    await expectCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // move period start date
    await apiPatch(request, `/api/periods/${grgrPeriodId}`, {
      start: '2026-05-09',
      moveScheduleEntries: false,
    })

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)

    // move period start date
    await apiPatch(request, `/api/periods/${grgrPeriodId}`, {
      start: '2026-05-10',
      moveScheduleEntries: false,
    })

    // ensure cache was invalidated
    await waitForCacheMiss(request, uri)
    await expectCacheHit(request, uri)
  })
})
