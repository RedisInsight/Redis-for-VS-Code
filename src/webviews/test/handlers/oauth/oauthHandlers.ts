import { http, HttpResponse, RequestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { constants, getMWSUrl } from 'testSrc/helpers'

const handlers: RequestHandler[] = [
  // fetchCerts
  http.get(
    getMWSUrl(`${ApiEndpoints.CLOUD_ME}`),
    () => HttpResponse.json(constants.USER_DATA),
  ),
  http.post(
    getMWSUrl(`${ApiEndpoints.CLOUD_ME_JOBS}`),
    () => HttpResponse.json(constants.USER_JOBS_DATA),
  ),
]

export default handlers
