import { AuthStrategy } from './auth.interface'
import { ServiceAuthStrategy } from './service.auth.strategy'

export const createAuthStrategy = (): AuthStrategy =>
  ServiceAuthStrategy.getInstance()
