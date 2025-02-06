import { UrlWithStringQuery } from 'url'
import { AuthStrategy } from './auth.interface'
import { CloudAuthResponse, CloudAuthStatus } from './models/cloud-auth-response'
import { CustomLogger, logger } from '../../logger'

export class ServiceAuthStrategy implements AuthStrategy {
  private static instance: ServiceAuthStrategy

  private cloudAuthService!: any

  private initialized = false

  private logger: CustomLogger = logger

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() { }

  public static getInstance(): ServiceAuthStrategy {
    if (!ServiceAuthStrategy.instance) {
      ServiceAuthStrategy.instance = new ServiceAuthStrategy()
    }

    return ServiceAuthStrategy.instance
  }

  async initialize(cloudAuthService: any): Promise<void> {
    if (this.initialized) {
      this.logger.logOAuth('Already initialized')
      return
    }

    this.logger.logOAuth('Initializing service auth')
    try {
      this.cloudAuthService = cloudAuthService
      this.initialized = true
      this.logger.logOAuth('Service auth initialized')
    } catch (err) {
      this.logger.logOAuth(`Initialization failed: ${err}`)
      throw err
    }
  }

  async getAuthUrl(options: any): Promise<{ url: string }> {
    this.logger.logOAuth('Getting auth URL')
    const url = await this.cloudAuthService.getAuthorizationUrl(
      options.sessionMetadata,
      options.authOptions,
    )
    this.logger.logOAuth('Auth URL obtained')
    return { url }
  }

  async handleCallback(query: UrlWithStringQuery): Promise<CloudAuthResponse> {
    this.logger.logOAuth('Handling callback')
    if (this.cloudAuthService.isRequestInProgress(query)) {
      this.logger.logOAuth('Request already in progress, skipping')
      return { status: CloudAuthStatus.Succeed }
    }
    const result: CloudAuthResponse = await this.cloudAuthService.handleCallback(query)
    this.logger.logOAuth('Callback handled query')
    return result
  }

  async shutdown(): Promise<void> {
    this.logger.logOAuth('Shutting down service auth')
  }
}
