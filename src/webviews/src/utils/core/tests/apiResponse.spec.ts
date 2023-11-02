import { AxiosError } from 'axios'
import { DEFAULT_ERROR_MESSAGE, getApiErrorMessage } from 'uiSrc/utils'

const error = { response: { data: { message: 'error' } } } as AxiosError
const errors = { response: { data: { message: ['error1', 'error2'] } } } as AxiosError

describe('getApiErrorMessage', () => {
  it('should return proper message', () => {
    expect(getApiErrorMessage(error)).toEqual('error')
    expect(getApiErrorMessage(null)).toEqual(DEFAULT_ERROR_MESSAGE)
    expect(getApiErrorMessage(errors)).toEqual('error1')
  })
})
