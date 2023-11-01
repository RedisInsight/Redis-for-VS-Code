import React from 'react'
import { RedisString } from 'uiSrc/interfaces'
import { bufferToString } from '../formatters'

export function formatLongName(
  name = '',
  maxNameLength = 500,
  endPartLength = 50,
  separator = '  ...  ',
) {
  // replace whitespace characters to no-break spaces - to prevent collapse spaces
  const currentName = replaceSpaces(name)
  if (currentName.length <= maxNameLength) {
    return currentName
  }
  const startPart = currentName.substring(0, maxNameLength - endPartLength - separator.length)
  const endPart = currentName.substring(currentName.length - endPartLength)
  return `${startPart}${separator}${endPart}`
}

export function formatNameShort(name = '') {
  return formatLongName(name, 68, 15, '...')
}

export function getDbIndex(db: number = 0) {
  return db ? `[db${db}]` : ''
}

export const truncateText = (text = '', maxLength = 0, separator = '...') =>
  (text.length >= maxLength ? text.slice(0, maxLength) + separator : text)

export const createDeleteFieldHeader = (keyName: RedisString) => formatNameShort(bufferToString((keyName)))

export const createDeleteFieldMessage = (field: RedisString) => (
  <>
    will be removed from
    {' '}
    <b>{formatNameShort(bufferToString(field))}</b>
  </>
)

export function replaceSpaces(text: string | number = '') {
  if (text === ' ') {
    return '\u00a0'
  }
  return text?.toString().replace(/\s\s/g, '\u00a0\u00a0') ?? ''
}
