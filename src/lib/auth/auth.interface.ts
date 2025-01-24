import { UrlWithStringQuery } from 'url'
import { CloudAuthResponse } from './models/cloud-auth-response'

export interface AuthStrategy {
  initialize(cloudAuthService: any): Promise<void>
  shutdown(): Promise<void>
  getAuthUrl(options: any): Promise<{ url: string }>
  handleCallback(query: UrlWithStringQuery): Promise<CloudAuthResponse>
  getBackendApp?(): any
}
