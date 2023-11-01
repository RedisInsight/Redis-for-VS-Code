import { Nullable } from 'uiSrc/interfaces'

export interface StateUserSettings {
  loading: boolean
  error: string
  isShowConceptsPopup: Nullable<boolean>
  config: Nullable<GetAppSettingsResponse>
  spec: Nullable<GetAgreementsSpecResponse>
}

export interface GetAppSettingsResponse {
  theme: string
  scanThreshold: number
  batchSize: number
  agreements: GetUserAgreementsResponse;
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
  defaultValue: boolean;
  displayInSetting: boolean;
  required: boolean;
  category?: string;
  since: string;
  editable: boolean;
  disabled: boolean;
  title: string;
  label: string;
  description?: string;
}

export interface IAgreementSpec {
  [key: string]: IAgreement;
}
