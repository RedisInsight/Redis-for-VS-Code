import { Nullable, RedisResponseEncoding } from 'uiSrc/interfaces'

export interface StateAppInfo {
  loading: boolean
  error: string
  server: Nullable<GetServerInfoResponse>
  encoding: RedisResponseEncoding
}

export interface GetServerInfoResponse {
  id: string
  createDateTime: string
  appVersion: string
  osPlatform: string
  buildType: string
  fixedDatabaseId?: string
  encryptionStrategies: string[]
  sessionId: number
  controlNumber: number
  controlGroup: string
}
