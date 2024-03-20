import { getUtmExternalLink, UTMParams } from 'uiSrc/utils'

const addUtmToLinkTests: Array<{
  input: [string, UTMParams]
  expected: string
}> = [
  {
    input: ['http://www.google.com', { campaign: 'name' }],
    expected: 'http://www.google.com/?utm_source=RedisinsightVSCode&utm_medium=app&utm_campaign=name'
  },
  {
    input: ['http://www.google.com', { campaign: 'name', medium: 'main' }],
    expected: 'http://www.google.com/?utm_source=RedisinsightVSCode&utm_medium=main&utm_campaign=name'
  },
  {
    input: ['http://www.google.com', { campaign: 'name', medium: 'main', source: 'source' }],
    expected: 'http://www.google.com/?utm_source=source&utm_medium=main&utm_campaign=name'
  },
]

describe('getUtmExternalLink', () => {
  test.each(addUtmToLinkTests)(
    'for input: %s should be output: %s',
    ({ input, expected }) => {
      const result = getUtmExternalLink(...input)
      expect(result).toEqual(expected)
    }
  )
})
