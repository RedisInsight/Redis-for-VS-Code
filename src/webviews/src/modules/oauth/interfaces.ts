import { Nullable } from 'uiSrc/interfaces'
import { Database } from 'uiSrc/store'
import { CloudAuthStatus, OAuthProvider, CloudJobName, CloudJobStatus, CloudJobStep } from 'uiSrc/constants'

export interface CloudJobInfo {
  id: string
  name?: CloudJobName
  status: CloudJobStatus
  child?: CloudJobInfo
  error?: string | object
  result?: any
  step?: CloudJobStep
}

export interface CloudJobInfoState extends Omit<CloudJobInfo, 'status'> {
  status: '' | CloudJobStatus
}

export interface CloudUserFreeDbState {
  loading: boolean
  error: string
  data: Nullable<Database>
}

export interface CloudSuccessResult {
  resourceId: string
  provider?: OAuthProvider
  region?: string
}

export interface CloudImportDatabaseResources {
  subscriptionId: number,
  databaseId?: number
  region: string
  provider?: string
}

export interface CloudAuthResponse {
  status: CloudAuthStatus
  message?: string
  error?: object | string
}
