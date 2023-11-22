import { floor } from 'lodash'

import {
  MAX_TTL_NUMBER,
  MAX_PORT_NUMBER,
  MAX_TIMEOUT_NUMBER,
  MAX_SCORE_DECIMAL_LENGTH,
  MAX_REFRESH_RATE,
} from 'uiSrc/constants'

export const entryIdRegex = /^(\*)$|^(([0-9]+)(-)((\*)$|([0-9]+$)))/
export const consumerGroupIdRegex = /^(\$)$|^0$|^(([0-9]+)(-)([0-9]+$))/

export const validateField = (text: string) => text.replace(/\s/g, '')

export const validateEntryId = (initValue: string) => initValue.replace(/[^0-9-*]+/gi, '')
export const validateConsumerGroupId = (initValue: string) => initValue.replace(/[^0-9-$]+/gi, '')

export const validateCountNumber = (initValue: string) => {
  const value = initValue.replace(/[^0-9]+/gi, '')

  if (+value <= 0) {
    return ''
  }

  return value
}

export const validateTTLNumber = (initValue: string) => {
  const value = +initValue.replace(/[^0-9]+/gi, '')

  if (value > MAX_TTL_NUMBER) {
    return MAX_TTL_NUMBER.toString()
  }

  if (value < 0 || (value === 0 && initValue !== '0')) {
    return ''
  }

  return value.toString()
}

export const validateTTLNumberForAddKey = (iniValue: string) =>
  validateTTLNumber(iniValue).replace(/^(0)?/, '')

export const validateListIndex = (initValue: string) => initValue.replace(/[^0-9]+/gi, '')

export const validateScoreNumber = (initValue: string) => {
  let value = initValue
    .replace(/[^-0-9.]+/gi, '')
    .replace(/^(-?\d*\.?)|(-?\d*)\.?/g, '$1$2')
    .replace(/(?!^)-/g, '')

  if (value.includes('.') && value.split('.')[1].length > MAX_SCORE_DECIMAL_LENGTH) {
    const numberOfExceed = value.split('.')[1].length - MAX_SCORE_DECIMAL_LENGTH
    value = value.slice(0, -numberOfExceed)
  }
  return value.toString()
}

export const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export const validatePortNumber = (initValue: string) => validateNumber(initValue, 0, MAX_PORT_NUMBER)

export const validateTimeoutNumber = (initValue: string) => validateNumber(initValue, 1, MAX_TIMEOUT_NUMBER)

export const validateNumber = (initValue: string, minNumber: number = 0, maxNumber: number = Infinity) => {
  const positiveNumbers = /[^0-9]+/gi
  const negativeNumbers = /[^0-9-]+/gi
  const value = initValue ? initValue.replace(minNumber < 0 ? negativeNumbers : positiveNumbers, '') : ''

  if (+value > maxNumber) {
    return maxNumber.toString()
  }

  if (+value < minNumber) {
    return ''
  }

  return value.toString()
}

export const validateRefreshRateNumber = (initValue: string) => {
  let value = initValue.replace(/[^0-9.]/gi, '')

  if (countDecimals(+value) > 0) {
    value = `${floor(+value, 1)}`
  }

  if (+value > MAX_REFRESH_RATE) {
    return MAX_REFRESH_RATE.toString()
  }

  if (+value < 0) {
    return ''
  }

  return value.toString()
}

export const errorValidateRefreshRateNumber = (value: string) => {
  const decimalsRegexp = /^\d+(\.\d{1})?$/
  return !decimalsRegexp.test(value)
}

export const errorValidateNegativeInteger = (value: string) => {
  const negativeIntegerRegexp = /^-?\d+$/
  return !negativeIntegerRegexp.test(value)
}

export const validateCertName = (initValue: string) =>
  initValue.replace(/[^ a-zA-Z0-9!@#$%^&*\-_()[\]]+/gi, '').toString()

export const isRequiredStringsValid = (...params: string[]) => params.every((p = '') => p.length > 0)

const countDecimals = (value: number) => {
  if (Math.floor(value) === value) return 0
  return value.toString().split('.')?.[1]?.length || 0
}

const getApproximateNumber = (number: number): string => (number < 1 ? '<1' : `${Math.round(number)}`)

export const getApproximatePercentage = (total?: number, part: number = 0): string => {
  const percent = (total ? part / total : 1) * 100
  return `${getApproximateNumber(percent)}%`
}
