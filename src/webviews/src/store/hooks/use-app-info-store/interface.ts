import { ICommands } from 'uiSrc/constants'
import { Nullable, RedisResponseEncoding } from 'uiSrc/interfaces'

export interface AppInfoStore {
  loading: boolean
  encoding: RedisResponseEncoding
  isShowConcepts: Nullable<boolean>
  config: Nullable<GetAppSettingsResponse>
  spec: Nullable<GetAgreementsSpecResponse>
  server: Nullable<GetServerInfoResponse>
  createDbContent: Nullable<Record<string, ContentCreateRedis>>
  delimiter: string
  commandsSpec: ICommands
  commandsArray: string[]
  commandGroups: string[]
}

export interface AppInfoActions {
  setInitialState: () => void
  processAppInfo: () => void
  processAppInfoFinal: () => void
  processAppInfoSuccess: ({
    server,
    config,
    spec,
    createDbContent,
    commandsSpec,
    commandsArray,
    commandGroups,
  }: Partial<AppInfoStore>) => void
  setIsShowConcepts: (isShowConcepts: boolean) => void

  updateUserConfigSettingsSuccess: (config: GetAppSettingsResponse) => void
  setDelimiter: (delimiter: string) => void
}

export type AppInfoResponses = [
  GetServerInfoResponse,
  GetAppSettingsResponse,
  GetAgreementsSpecResponse,
  ICommands,
]
export type AppResourcesResponses = [
  Record<string, ContentCreateRedis>,
]

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
  requiredText?: string
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

export interface ContentFeatureCreateRedis {
  title: string
  url: string
  description?: string
  links: Record<string, {
    altText: string
    url: string
    event?: string
  }>
}
