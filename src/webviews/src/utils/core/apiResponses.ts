import { AxiosError } from 'axios'
import { first, get, isArray } from 'lodash'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/constants'
import { EnhancedAxiosError, Nullable } from 'uiSrc/interfaces'
import { parseCustomError } from './errors'

export function getApiErrorMessage(error: Nullable<AxiosError>): string {
  const errorMessage = get(error, 'response.data.message', '')

  if (!error || !error.response) {
    return DEFAULT_ERROR_MESSAGE
  }
  if (isArray(errorMessage)) {
    return first(errorMessage)
  }
  return errorMessage
}

export function getApiErrorName(error: AxiosError): string {
  return get(error, 'response.data.name', 'Error') ?? ''
}

export const getAxiosError = (error: EnhancedAxiosError): AxiosError => {
  if (error?.response?.data.errorCode) {
    return parseCustomError(error.response.data)
  }
  return error
}

export const createAxiosError = (options: ErrorOptions): AxiosError => ({
  response: {
    data: options,
  },
}) as AxiosError

export const getApiErrorCode = (error: AxiosError) => error?.response?.status
