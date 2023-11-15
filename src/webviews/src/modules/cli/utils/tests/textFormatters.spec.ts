import {
  parseContentEditableChangeHtml,
  parseMultilineContentEditableChangeHtml,
  parseContentEditableHtml,
} from '../textFormatters'

const parseContentEditableChangeHtmlCases = [
  { input: 'test&nbsp;test', expected: 'test test' },
]

const parseMultilineContentEditableChangeHtmlCases = [
  { input: 'test&nbsp;test<br>test', expected: 'test test test' },
]

const parseContentEditableHtmlCases = [
  { input: '&nbsp;test', expected: ' test' },
  { input: '&lt;test', expected: '<test' },
  { input: '&gt;test', expected: '>test' },
  { input: '&amp;test', expected: '&test' },
]

describe('Parse content editable change HTML', () => {
  test.each(parseContentEditableChangeHtmlCases)('%j', ({ input, expected }) => {
    expect(parseContentEditableChangeHtml(input)).toBe(expected)
  })
})

describe('Parse multiline content editable change HTML', () => {
  test.each(parseMultilineContentEditableChangeHtmlCases)('%j', ({ input, expected }) => {
    expect(parseMultilineContentEditableChangeHtml(input)).toBe(expected)
  })
})

describe('Parse content editable HTML', () => {
  test.each(parseContentEditableHtmlCases)('%j', ({ input, expected }) => {
    expect(parseContentEditableHtml(input)).toBe(expected)
  })
})
