import { setupServer } from 'msw/node'
import './init'

import { handlers } from './handlers'

// Setup requests interception using the given handlers.
export const mswServer = setupServer(...handlers)
