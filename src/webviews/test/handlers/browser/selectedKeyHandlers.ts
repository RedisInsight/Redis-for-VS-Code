import { http, HttpResponse, RequestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { constants, getMWSUrl } from 'testSrc/helpers'

const handlers: RequestHandler[] = [
  // fetchString
  http.post(
    getMWSUrl(getUrl(ApiEndpoints.KEY_INFO)),
    () => HttpResponse.json(constants.KEY_INFO),
  ),
  // editKeyTTL
  http.patch(
    getMWSUrl(getUrl(ApiEndpoints.KEY_TTL)),
    () => HttpResponse.json({ ...constants.KEY_INFO, ttl: constants.KEY_TTL_2 }),
  ),
]

export default handlers
