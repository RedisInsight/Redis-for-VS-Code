import { RequestHandler } from 'msw'

import string from './stringHandlers'
import selectedKey from './selectedKeyHandlers'

const handlers: RequestHandler[] = [].concat(
  string,
  selectedKey,
)
export default handlers
