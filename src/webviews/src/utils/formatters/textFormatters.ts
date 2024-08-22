// remove line break and encode angular brackets
const parsePastedText = (text: string = '') =>
  text.replace(/(\r?\n)/gi, '').replace(/</gi, '<').replace(/>/gi, '>')

export {
  parsePastedText,
}
