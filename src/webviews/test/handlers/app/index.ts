import { RequestHandler } from 'msw'

import telemetry from './telemetry'

const handlers: RequestHandler[] = [].concat(
  telemetry,
)
export default handlers
