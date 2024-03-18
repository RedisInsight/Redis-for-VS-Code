import { http, HttpResponse, RequestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { constants, getMWSUrl } from 'testSrc/helpers'

const requests = [
  [ApiEndpoints.REDIS_COMMANDS, constants.REDIS_COMMANDS],
  [ApiEndpoints.INFO, constants.SERVER_INFO],
  [ApiEndpoints.SETTINGS, constants.SETTINGS],
  [ApiEndpoints.SETTINGS_AGREEMENTS_SPEC, constants.SETTINGS_AGREEMENTS_SPEC],
]
const handlers: RequestHandler[] = [
  // fetch redis commands
  ...requests.map(([url, res]) => http.get(
    getMWSUrl(url as ApiEndpoints),
    () => HttpResponse.json(res),
  )),

  http.patch(
    getMWSUrl(ApiEndpoints.SETTINGS),
    (data) => HttpResponse.json(data.request.body),
  ),
]

export default handlers
