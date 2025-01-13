import { multiSelectToArray } from 'uiSrc/utils'

const getOutputForFormatToTextTests: any[] = [
  [[], []],
  [[{ label: '123', value: '123' }, { label: 'test', value: 'test1' }], ['123', 'test']],
  [[{ label1: '123' }], []],
  [[{ label: '123', value: 'test' }, { label: 'test', value: 'test' }], ['123', 'test']],
]

describe('formatToText', () => {
  it.each(getOutputForFormatToTextTests)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = multiSelectToArray(reply)
      expect(result).toEqual(expected)
    })
})
