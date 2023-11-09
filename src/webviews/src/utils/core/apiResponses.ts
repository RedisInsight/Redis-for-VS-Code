import { AxiosError } from 'axios'
import { first, get, isArray } from 'lodash'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'

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
