import { CloudSubscriptionType, OAuthSocialAction, OAuthSocialSource } from 'uiSrc/constants'
import { Maybe, Nullable } from 'uiSrc/interfaces'
import { CloudJobInfoState } from 'uiSrc/modules/oauth/interfaces'
import { Database } from 'uiSrc/store'

export interface Certificate {
  id: string
  name: string
}

export interface OAuthStore {
  ssoFlow: Maybe<OAuthSocialAction>
  source: Nullable<OAuthSocialSource>
  job: Nullable<CloudJobInfoState>
  isOpenSocialDialog: boolean
  agreement: boolean
  showProgress: boolean
  isRecommendedSettings: boolean
  plan: {
    loading: boolean,
    isOpenDialog: boolean,
    data: CloudSubscriptionPlanResponse[],
  }
  isOpenSelectAccountDialog: boolean,
  user: {
    initialLoading: boolean
    loading: boolean
    data: Nullable<CloudUser>
    freeDb: CloudUserFreeDbState
  }
}

export interface OauthActions {
  setSSOFlow: (ssoFlow?: OAuthSocialAction) => void
  setOAuthCloudSource: (source: Nullable<OAuthSocialSource>) => void
  showOAuthProgress: (showProgress: boolean) => void
  setSocialDialogState: (source: Nullable<OAuthSocialSource>) => void
  setJob: (job: CloudJobInfoState) => void
  setAgreement: (agreement: boolean) => void

  getUserInfo: () => void
  getUserInfoSuccess: (data: CloudUser) => void
  getUserInfoFinal: () => void

  setIsOpenSelectPlanDialog: (isOpen: boolean) => void
  getPlans(): void
  getPlansSuccess(data: CloudSubscriptionPlanResponse[]): void
  getPlansFailure(): void
  setSelectAccountDialogState: (isOpen: boolean) => void
}

export interface CloudUser {
  id?: number
  name?: string
  currentAccountId?: number
  capiKey?: CloudCapiKey
  accounts?: CloudUserAccount[]
}

export interface CloudCapiKey {
  id: string
  userId: string
  name: string
  cloudAccountId: number
  cloudUserId: number
  capiKey: string
  capiSecret: string
  valid?: boolean
  createdAt?: Date
  lastUsed?: Date
}

export interface CloudUserAccount {
  id: number
  name: string
  capiKey?: string // api_access_key
  capiSecret?: string
}

export interface CloudUserFreeDbState {
  loading: boolean
  data: Nullable<Database>
}

export interface CloudSubscriptionPlanResponse extends CloudSubscriptionPlan {
  details: CloudSubscriptionRegion
}

export interface CloudSubscriptionPlan {
  id: number
  regionId: number
  type: CloudSubscriptionType
  name: string
  provider: string
  region?: string
  price?: number
}

export interface CloudSubscriptionRegion {
  id: string
  regionId: number
  name: string
  displayOrder: number
  region?: string
  provider?: string
  cloud?: string
  countryName?: string
  cityName?: string
  flag?: string
}

export interface Region {
  provider: string
  regions: string[]
}
