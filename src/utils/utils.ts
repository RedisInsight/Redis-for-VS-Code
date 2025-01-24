import { MAX_TITLE_KEY_LENGTH } from '../constants'

export const getNonce = () => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const truncateText = (text = '', maxLength = 0, separator = '...') =>
  (text.length >= maxLength ? text.slice(0, maxLength) + separator : text)

export const getTitleForKey = (keyType: string, keyString: string): string =>
  `${keyType?.toLowerCase()}:${truncateText(keyString, MAX_TITLE_KEY_LENGTH)}`
