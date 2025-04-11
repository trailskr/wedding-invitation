const onLevel = (res: TextSearchResult, level: number) => {
  return res * getFullTextDeepSearchLevelRatio(level)
}

describe('fullTextSearch', () => {
  it('priorities must be sorted correctly', () => {
    const priorities = Object.values(TextSearchResult).filter(isNumber)

    expect(priorities).to.eql([
      TextSearchResult.NotFound,
      TextSearchResult.Elastic,
      TextSearchResult.PartI,
      TextSearchResult.Part,
      TextSearchResult.BeginningI,
      TextSearchResult.Beginning,
      TextSearchResult.ExactI,
      TextSearchResult.Exact,
    ])
  })

  it('priorities of lower levels is smaller', () => {
    const priorities = Object.values(TextSearchResult)
      .filter(isNumber)
      .filter((res) => res !== TextSearchResult.NotFound)

    const level0 = priorities.map((res) => onLevel(res, 0))
    const level1 = priorities.map((res) => onLevel(res, 1))
    const level2 = priorities.map((res) => onLevel(res, 2))

    expect(level0.every((res1) => level1.every((res2) => res1 > res2))).toBe(true)
    expect(level1.every((res2) => level2.every((res3) => res2 > res3))).toBe(true)
  })

  it('should return proper priorities', () => {
    expect(fullTextSearch('abc', 'abc')).to.eql(TextSearchResult.Exact)
    expect(fullTextSearch('abc', 'ABC')).to.eql(TextSearchResult.ExactI)
    expect(fullTextSearch('ab_123', 'ab')).to.eql(TextSearchResult.Beginning)
    expect(fullTextSearch('AB_123', 'ab')).to.eql(TextSearchResult.BeginningI)
    expect(fullTextSearch('123_abc_321', 'abc')).to.eql(TextSearchResult.Part)
    expect(fullTextSearch('123_abc_321', 'ABC')).to.eql(TextSearchResult.PartI)
    expect(fullTextSearch('_a_b_c_', 'ABC')).to.eql(TextSearchResult.Elastic)
    expect(fullTextSearch('ABC', '123')).to.eql(TextSearchResult.NotFound)
  })

  it('should return proper priorities without elastic search', () => {
    expect(fullTextSearch('abc', 'abc', false)).to.eql(TextSearchResult.Exact)
    expect(fullTextSearch('abc', 'ABC', false)).to.eql(TextSearchResult.ExactI)
    expect(fullTextSearch('ab_123', 'ab', false)).to.eql(TextSearchResult.Beginning)
    expect(fullTextSearch('AB_123', 'ab', false)).to.eql(TextSearchResult.BeginningI)
    expect(fullTextSearch('123_abc_321', 'abc', false)).to.eql(TextSearchResult.Part)
    expect(fullTextSearch('123_abc_321', 'ABC', false)).to.eql(TextSearchResult.PartI)
    expect(fullTextSearch('_a_b_c_', 'ABC', false)).to.eql(TextSearchResult.NotFound)
    expect(fullTextSearch('ABC', '123', false)).to.eql(TextSearchResult.NotFound)
  })
})

describe('fullTextDeepSearch', () => {
  it('string match should return proper priorities', () => {
    expect(fullTextDeepSearch('abc', 'abc')).to.eql(TextSearchResult.Exact)
    expect(fullTextDeepSearch('abc', 'ABC')).to.eql(TextSearchResult.ExactI)
    expect(fullTextDeepSearch('ab_123', 'ab')).to.eql(TextSearchResult.Beginning)
    expect(fullTextDeepSearch('AB_123', 'ab')).to.eql(TextSearchResult.BeginningI)
    expect(fullTextDeepSearch('123_abc_321', 'abc')).to.eql(TextSearchResult.Part)
    expect(fullTextDeepSearch('123_abc_321', 'ABC')).to.eql(TextSearchResult.PartI)
    expect(fullTextDeepSearch('ABC', '123')).to.eql(TextSearchResult.NotFound)
  })

  it('string match should return proper priorities without elastic search', () => {
    expect(fullTextDeepSearch('abc', 'abc', { elasticSearch: true })).to.eql(TextSearchResult.Exact)
    expect(fullTextDeepSearch('abc', 'ABC', { elasticSearch: true })).to.eql(TextSearchResult.ExactI)
    expect(fullTextDeepSearch('ab_123', 'ab', { elasticSearch: true })).to.eql(TextSearchResult.Beginning)
    expect(fullTextDeepSearch('AB_123', 'ab', { elasticSearch: true })).to.eql(TextSearchResult.BeginningI)
    expect(fullTextDeepSearch('123_abc_321', 'abc', { elasticSearch: true })).to.eql(TextSearchResult.Part)
    expect(fullTextDeepSearch('123_abc_321', 'ABC', { elasticSearch: true })).to.eql(TextSearchResult.PartI)
    expect(fullTextDeepSearch('_a_b_c_', 'ABC', { elasticSearch: true })).to.eql(TextSearchResult.Elastic)
    expect(fullTextDeepSearch('ABC', '123', { elasticSearch: true })).to.eql(TextSearchResult.NotFound)
  })

  it('object property match should return proper priorities', () => {
    expect(fullTextDeepSearch('abc', 'abc')).to.eql(TextSearchResult.Exact)
    expect(fullTextDeepSearch('abc', 'ABC')).to.eql(TextSearchResult.ExactI)
    expect(fullTextDeepSearch('ab_123', 'ab')).to.eql(TextSearchResult.Beginning)
    expect(fullTextDeepSearch('AB_123', 'ab')).to.eql(TextSearchResult.BeginningI)
    expect(fullTextDeepSearch('123_abc_321', 'abc')).to.eql(TextSearchResult.Part)
    expect(fullTextDeepSearch('123_abc_321', 'ABC')).to.eql(TextSearchResult.PartI)
    expect(fullTextDeepSearch('ABC', '123')).to.eql(TextSearchResult.NotFound)
  })

  it('object property match should return proper priorities without elastic search', () => {
    expect(fullTextDeepSearch({ field: 'abc' }, 'abc', { elasticSearch: true })).to.eql(TextSearchResult.Exact)
    expect(fullTextDeepSearch({ field: 'abc' }, 'ABC', { elasticSearch: true })).to.eql(TextSearchResult.ExactI)
    expect(fullTextDeepSearch({ field: 'ab_123' }, 'ab', { elasticSearch: true })).to.eql(TextSearchResult.Beginning)
    expect(fullTextDeepSearch({ field: 'AB_123' }, 'ab', { elasticSearch: true })).to.eql(TextSearchResult.BeginningI)
    expect(fullTextDeepSearch({ field: '123_abc_321' }, 'abc', { elasticSearch: true })).to.eql(TextSearchResult.Part)
    expect(fullTextDeepSearch({ field: '123_abc_321' }, 'ABC', { elasticSearch: true })).to.eql(TextSearchResult.PartI)
    expect(fullTextDeepSearch({ field: '_a_b_c_' }, 'ABC', { elasticSearch: true })).to.eql(TextSearchResult.Elastic)
    expect(fullTextDeepSearch({ field: 'ABC' }, '123', { elasticSearch: true })).to.eql(TextSearchResult.NotFound)
  })

  it('object deep property', () => {
    expect(fullTextDeepSearch('abc', 'abc')).to.eql(onLevel(TextSearchResult.Exact, 0))
    expect(fullTextDeepSearch({ field: ['abc'] }, 'abc')).to.eql(onLevel(TextSearchResult.Exact, 1))
    expect(fullTextDeepSearch({ field: [undefined, { field: 'abc' }] }, 'abc')).to.eql(onLevel(TextSearchResult.Exact, 2))
    expect(fullTextDeepSearch({ field: [undefined, { field: { field: 'abc' } }] }, 'ABC')).to.eql(onLevel(TextSearchResult.ExactI, 3))
  })
})
