import { RequestHandler } from 'msw'

import certificates from './certificatesHandlers'

const handlers: RequestHandler[] = [].concat(
  certificates,
)
export default handlers
