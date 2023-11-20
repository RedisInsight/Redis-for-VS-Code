// remove line break and encode angular brackets
const parsePastedText = (text: string = '') =>
  text.replace(/\n/gi, '').replace(/</gi, '<').replace(/>/gi, '>')

export {
  parsePastedText,
}
