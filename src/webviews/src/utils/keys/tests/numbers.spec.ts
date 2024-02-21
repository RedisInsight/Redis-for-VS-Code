import { isNaNConvertedString, numberWithSpaces, nullableNumberWithSpaces, getPercentage } from "../numbers"

const isNaNConvertedStringTests: any[] = [
  [0, false],
  ['1', false],
  ['0', false],
  [null, false],
  [undefined, true],
  ['', false],
  ['uuoeuoe', true],
]

describe('isNaNConvertedString', () => {
  it.each(isNaNConvertedStringTests)('for input: %s (i) should be output: %s',
    (value , expected) => {
      const result = isNaNConvertedString(value)
      expect(result).toBe(expected)
    })
})

const numberWithSpacesTests: any[] = [
  [null, undefined],
  [0, '0'],
  [1, '1'],
  [2_000, '2 000'],
  [22_000, '22 000'],
  [232, '232'],
  [232_232_433, '232 232 433'],
]

describe('numberWithSpaces', () => {
  it.each(numberWithSpacesTests)('for input: %s (i) should be output: %s',
    (value , expected) => {
      const result = numberWithSpaces(value)
      expect(result).toBe(expected)
    })
})

const nullableNumberWithSpacesTests: any[] = [
  [null, '-'],
  [0, '0'],
  [1, '1'],
  [1.78, '1.78'],
  [2_000, '2 000'],
  [22_000, '22 000'],
  [232, '232'],
  [232_232_433, '232 232 433'],
]

describe('nullableNumberWithSpaces', () => {
  it.each(nullableNumberWithSpacesTests)('for input: %s (i) should be output: %s',
    (value , expected) => {
      const result = nullableNumberWithSpaces(value)
      expect(result).toBe(expected)
    })
})

const getPercentageTests: any[] = [
  [null, 0],
  [0, 0],
  [1, 100],
  [1.78, 178],
  [2_000, 200_000],
  [22_000, 2_200_000],
  [232, 23_200],
  [232_232_433, 23_223_243_300],
]

describe('getPercentage', () => {
  it.each(getPercentageTests)('for input: %s (i) should be output: %s',
    (value , expected) => {
      const result = getPercentage(value)
      expect(result).toBe(expected)
    })
})
