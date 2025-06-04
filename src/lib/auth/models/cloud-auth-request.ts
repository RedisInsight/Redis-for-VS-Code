import { SessionMetadata } from './session'

export enum CloudAuthIdpType {
  Google = 'google',
  GitHub = 'github',
  Sso = 'sso',
}

export interface CloudAuthRequestOptions {
  strategy: CloudAuthIdpType
  action?: string
  data?: Record<string, any>
  callback?: Function
}

export interface CloudAuthRequest extends CloudAuthRequestOptions {
  idpType: CloudAuthIdpType
  sessionMetadata: SessionMetadata
  createdAt: Date
}
