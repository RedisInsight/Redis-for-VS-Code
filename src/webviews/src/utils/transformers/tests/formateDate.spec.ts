import { lastConnectionFormat, millisecondsFormat, truncateMilliseconds } from 'uiSrc/utils'

const dateNow = Date.now()
const lastConnectionFormatTests: any[] = [
  [dateNow - 10, 'less than a minute ago'],
  [dateNow - 10_000, 'less than a minute ago'],
  [dateNow - 100_000, '2 minutes ago'],
  [dateNow - 10_000_000, 'about 3 hours ago'],
  [dateNow - 500_000_000, '6 days ago'],
]

describe('lastConnectionFormat', () => {
  it.each(lastConnectionFormatTests)('for input: %s (i), should be output: %s',
    (date, expected) => {
      const result = lastConnectionFormat(date)
      expect(result).toBe(expected)
    })
})

const millisecondsFormatTests: any[] = [
  [10, '00:00:00.010'],
  [10_000, '00:00:10.000'],
  [100_000, '00:01:40.000'],
  [10_000_000, '02:46:40.000'],
  [500_000_000, '18:53:20.000'],
]

describe('millisecondsFormat', () => {
  it.each(millisecondsFormatTests)('for input: %s (i), should be output: %s',
    (milliseconds, expected) => {
      const result = millisecondsFormat(milliseconds)
      expect(result).toBe(expected)
    })
})

const truncateMillisecondsTests: any[] = [
  [10, '10 msec'],
  [10_000, '10 s'],
  [100_000, '1 min'],
  [10_000_000, '2 h'],
  [500_000_000, '5 d'],
]

describe('truncateMilliseconds', () => {
  it.each(truncateMillisecondsTests)('for input: %s (i), should be output: %s',
    (milliseconds, expected) => {
      const result = truncateMilliseconds(milliseconds)
      expect(result).toBe(expected)
    })
})
