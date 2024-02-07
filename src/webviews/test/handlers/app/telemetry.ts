import { http, HttpResponse, RequestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMWSUrl } from 'testSrc/helpers'

const handlers: RequestHandler[] = [
  // fetch telemetry event
  http.post(
    getMWSUrl(`${ApiEndpoints.ANALYTICS_SEND_EVENT}`),
    () => HttpResponse.json(),
  ),
]

export default handlers
