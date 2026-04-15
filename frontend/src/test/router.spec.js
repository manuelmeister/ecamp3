import { describe, it, expect } from 'vitest'
import { materialListRoute } from '../router'

describe('materialListRoute', () => {
  const camp = {
    id: '123',
    shortTitle: 'camp-title',
    _meta: { loading: false },
  }

  it('returns empty object if camp is loading', () => {
    const loadingCamp = { ...camp, _meta: { loading: true } }
    expect(materialListRoute(loadingCamp)).toEqual({})
  })

  it('returns route for default string argument "/all"', () => {
    const result = materialListRoute(camp)
    expect(result).toEqual({
      name: 'camp/material/all',
      params: {
        campId: '123',
        campShortTitle: 'camp-title',
      },
      query: {},
    })
  })

  it('returns route for specific string argument "/unassigned"', () => {
    const result = materialListRoute(camp, '/unassigned')
    expect(result).toEqual({
      name: 'camp/material/unassigned',
      params: {
        campId: '123',
        campShortTitle: 'camp-title',
      },
      query: {},
    })
  })

  it('returns route for a material list object', () => {
    const materialList = {
      id: '456',
      name: 'My List',
      _meta: { loading: false },
    }
    const result = materialListRoute(camp, materialList)
    expect(result).toEqual({
      name: 'camp/material/detail',
      params: {
        campId: '123',
        campShortTitle: 'camp-title',
        materialId: '456',
        materialName: 'My-List',
      },
      query: {},
    })
  })

  it('returns empty object if material list object is missing _meta', () => {
    const materialList = {
      id: '456',
      name: 'My List',
    }
    expect(materialListRoute(camp, materialList)).toEqual({})
  })

  it('returns empty object if material list is loading', () => {
    const materialList = {
      id: '456',
      name: 'My List',
      _meta: { loading: true },
    }
    expect(materialListRoute(camp, materialList)).toEqual({})
  })

  it('correctly includes query parameters', () => {
    const query = { search: 'test' }
    const result = materialListRoute(camp, '/all', query)
    expect(result.query).toEqual(query)

    const materialList = {
      id: '456',
      name: 'My List',
      _meta: { loading: false },
    }
    const resultWithObject = materialListRoute(camp, materialList, query)
    expect(resultWithObject.query).toEqual(query)
  })
})
