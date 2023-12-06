import { http, HttpResponse, RequestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { constants, getMWSUrl } from 'testSrc/helpers'

const handlers: RequestHandler[] = [
  // fetchString
  http.post(
    getMWSUrl(getUrl(ApiEndpoints.STRING_VALUE)),
    () => HttpResponse.json({ keyName: constants.KEY_NAME_1, value: constants.KEY_VALUE_1 }),
  ),
]

export default handlers
