import { RequestHandler } from 'msw'

import telemetry from './telemetry'
import info from './info'

const handlers: RequestHandler[] = [].concat(
  telemetry,
  info,
)
export default handlers
