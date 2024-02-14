import {
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToRange,
  truncateTTLToSeconds,
} from 'uiSrc/utils'


const truncateTTLToRangeTests: any[] = [
  [-1, 'No limit'],
  [10, '10'],
  [612, '612'],
  [999, '999'],
  [100_000, '100 K'],
  [612_000, '612 K'],
  [100_000_000, '100 M'],
  [2_120_042_300, '2 B'],
]

describe.only('truncateTTLToRange', () => {
  it.each(truncateTTLToRangeTests)('for input: %s (i), should be output: %s',
    (ttl, expected) => {
      const result = truncateTTLToRange(ttl)
      expect(result).toBe(expected)
    })
})

const truncateNumberToDurationTests: any[] = [
  [100, '1 min, 40 s'],
  [1_534, '25 min, 34 s'],
  [54_334, '15 h, 5 min, 34 s'],
  [4_325_634, '1 mo, 19 d, 1 h, 33 min, 54 s'],
  [112_012_330, '3 yr, 6 mo, 19 d, 10 h, 32 min, 10 s'],
  [2_120_042_300, '67 yr, 2 mo, 6 d, 12 h, 38 min, 20 s'],
]

describe.only('truncateNumberToDuration', () => {
  it.each(truncateNumberToDurationTests)('for input: %s (i), should be output: %s',
    (milliseconds, expected) => {
      const result = truncateNumberToDuration(milliseconds)
      expect(result).toBe(expected)
    })
})

const truncateTTLToSecondsTests: any[] = [
  [100, '100'],
  [10_000, '10 000'],
  [1_231_231, '1 231 231'],
  [122_331_231, '122 331 231'],
]

describe.only('truncateTTLToSeconds', () => {
  it.each(truncateTTLToSecondsTests)('for input: %s (i), should be output: %s',
    (milliseconds, expected) => {
      const result = truncateTTLToSeconds(milliseconds)
      expect(result).toBe(expected)
    })
})

const truncateNumberToFirstUnitTests: any[] = [
  [100, '1 min'], // '1 min, 40 s'
  [1_534, '25 min'], // '25 min, 34 s'
  [54_334, '15 h'], // '15 h, 5 min, 34 s'
  [4_325_634, '1 mo'], // '1 mo, 19 d, 1 h, 33 min, 54 s'
  [112_012_330, '3 yr'], // '3 yr, 6 mo, 19 d, 10 h, 32 min, 10 s'
  [2_120_042_300, '67 yr'], // '67 yr, 2 mo, 6 d, 12 h, 38 min, 20 s'
]

describe.only('truncateNumberToFirstUnit', () => {
  it.each(truncateNumberToFirstUnitTests)('for input: %s (i), should be output: %s',
    (milliseconds, expected) => {
      const result = truncateNumberToFirstUnit(milliseconds)
      expect(result).toBe(expected)
    })
})
