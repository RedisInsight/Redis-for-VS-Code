import { http, HttpResponse, RequestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { constants, getMWSUrl } from 'testSrc/helpers'
import { getMWSResourceUrl } from 'testSrc/helpers/testUtils'

const requests = [
  [ApiEndpoints.REDIS_COMMANDS, constants.REDIS_COMMANDS],
  [ApiEndpoints.INFO, constants.SERVER_INFO],
  [ApiEndpoints.SETTINGS, constants.SETTINGS],
  [ApiEndpoints.SETTINGS_AGREEMENTS_SPEC, constants.SETTINGS_AGREEMENTS_SPEC],
]

const requestsResources = [
  [ApiEndpoints.CONTENT_CREATE_DATABASE, constants.CONTENT_CREATE_DATABASE],
]
const handlers: RequestHandler[] = [
  // fetch redis commands
  ...requests.map(([url, res]) => http.get(
    getMWSUrl(url as ApiEndpoints),
    () => HttpResponse.json(res),
  )),

  ...requestsResources.map(([url, res]) => http.get(
    getMWSResourceUrl(url as ApiEndpoints),
    () => HttpResponse.json(res),
  )),

  http.patch(
    getMWSUrl(ApiEndpoints.SETTINGS),
    async (data) => HttpResponse.json(await data.request.json()),
  ),
]

export default handlers
