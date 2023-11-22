import { HttpResponse, http } from 'msw'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/constants'

export const errorHandlers = [
  http.all(
    '*',
    () => HttpResponse.json(DEFAULT_ERROR_MESSAGE, { status: 500 }),
  ),
]
