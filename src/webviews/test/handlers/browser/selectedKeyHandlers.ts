import { http, HttpResponse, RequestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { KeyInfo } from 'uiSrc/interfaces'
import { constants, getMWSUrl } from 'testSrc/helpers'

export const KEY_INFO: KeyInfo = {
  name: constants.KEY_NAME_1,
  type: constants.KEY_TYPE_1,
  length: constants.KEY_LENGTH_1,
  size: constants.KEY_SIZE_1,
  ttl: constants.KEY_TTL_1,
}

const handlers: RequestHandler[] = [
  // fetchString
  http.post(
    getMWSUrl(getUrl(ApiEndpoints.KEY_INFO)),
    () => HttpResponse.json(KEY_INFO),
  ),
  // editKeyTTL
  http.patch(
    getMWSUrl(getUrl(ApiEndpoints.KEY_TTL)),
    () => HttpResponse.json({ ...KEY_INFO, ttl: constants.KEY_TTL_2 }),
  ),
]

export default handlers
