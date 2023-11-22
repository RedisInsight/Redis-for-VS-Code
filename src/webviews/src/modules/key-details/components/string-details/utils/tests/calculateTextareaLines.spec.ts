import { calculateTextareaLines } from '../calculateTextareaLines'

const calculateTextareaLinesTests: any[] = [
  ['123', 22],
  ['123\n123', 44],
  ['123\n123\n\n1\n2\n', 60],
]

describe('calculateTextareaLines', () => {
  it.each(calculateTextareaLinesTests)('for input: %s (text), %s (width), %s (signWidth) should be output: %s (expected)',
    (text, expected, width, signWidth) => {
      const result = calculateTextareaLines(text, width, signWidth)
      expect(result).toBe(expected)
    })
})
