import { http, HttpResponse, RequestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { constants, getMWSUrl } from 'testSrc/helpers'

const handlers: RequestHandler[] = [
  // fetchCerts
  http.get(
    getMWSUrl(`${ApiEndpoints.CA_CERTIFICATES}`),
    () => HttpResponse.json(constants.CA_CERTS),
  ),
  http.get(
    getMWSUrl(`${ApiEndpoints.CLIENT_CERTIFICATES}`),
    () => HttpResponse.json(constants.CLIENT_CERTS),
  ),

]

export default handlers
