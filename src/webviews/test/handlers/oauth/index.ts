import { RequestHandler } from 'msw'

import oauth from './oauthHandlers'

const handlers: RequestHandler[] = [].concat(
  oauth,
)
export default handlers
