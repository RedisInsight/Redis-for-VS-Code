const parseContentEditableChangeHtml = (text: string = '') => text.replace(/&nbsp;/gi, ' ')

const parseMultilineContentEditableChangeHtml = (text: string = '') =>
  parseContentEditableChangeHtml(text).replace(/<br>/gi, ' ')

const parseContentEditableHtml = (text: string = '') =>
  text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')

export {
  parseContentEditableChangeHtml,
  parseMultilineContentEditableChangeHtml,
  parseContentEditableHtml,
}
