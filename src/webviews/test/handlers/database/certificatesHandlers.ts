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
  http.delete(
    getMWSUrl(`${ApiEndpoints.CA_CERTIFICATES}/${constants.CA_CERTS[0]?.id}`),
    () => HttpResponse.json(null),
  ),

]

export default handlers
