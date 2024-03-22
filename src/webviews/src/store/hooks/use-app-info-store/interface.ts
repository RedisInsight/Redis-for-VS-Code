import { Nullable, RedisResponseEncoding } from 'uiSrc/interfaces'

export interface AppInfoStore {
  loading: boolean
  encoding: RedisResponseEncoding
  isShowConceptsPopup: Nullable<boolean>
  config: Nullable<GetAppSettingsResponse>
  spec: Nullable<GetAgreementsSpecResponse>
  server: Nullable<GetServerInfoResponse>
  delimiter: string
}

export interface AppInfoActions {
  setInitialState: () => void
  processAppInfo: () => void
  processAppInfoFinal: () => void
  processAppInfoSuccess: ([config, spec, server]: AppInfoResponses) => void
  setIsShowConceptsPopup: (isShowConceptsPopup: boolean) => void

  updateUserConfigSettingsSuccess: (config: GetAppSettingsResponse) => void
  setDelimiter: (delimiter: string) => void
}

export type AppInfoResponses = [GetServerInfoResponse, GetAppSettingsResponse, GetAgreementsSpecResponse]

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

export interface GetAppSettingsResponse {
  theme: Nullable<string>
  scanThreshold: number
  batchSize: number
  agreements: GetUserAgreementsResponse
}

export interface GetUserAgreementsResponse {
  version: string
  eula?: boolean
  analytics?: boolean
  notifications?: boolean
  encryption?: boolean
}

export interface GetAgreementsSpecResponse {
  version: string
  agreements: IAgreementSpec
}

export interface IAgreement {
  defaultValue: boolean
  displayInSetting: boolean
  required: boolean
  category?: string
  since: string
  editable: boolean
  disabled: boolean
  title: string
  label: string
  description?: string
}

export interface IAgreementSpec {
  [key: string]: IAgreement
}
