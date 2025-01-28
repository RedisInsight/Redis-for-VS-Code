import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, CloudJobName, CloudJobStatus, OAuthSocialAction, StorageItem } from 'uiSrc/constants'
import { CloudJobInfo } from 'uiSrc/modules/oauth/interfaces'
import { getApiErrorMessage, getCloudSsoUtmParams, isStatusSuccessful, showErrorMessage } from 'uiSrc/utils'
import { EnhancedAxiosError } from 'uiSrc/interfaces'
import { CloudUser, OauthActions, OAuthStore } from './interface'

export const initialOAuthState: OAuthStore = {
  job: {
    id: localStorageService.get(StorageItem.OAuthJobId) ?? '',
    name: undefined,
    status: '',
  },
  source: null,
  ssoFlow: undefined,
  isOpenSocialDialog: false,

  agreement: localStorageService.get(StorageItem.OAuthAgreement) ?? false,
  showProgress: true,
  isRecommendedSettings: true,
  user: {
    initialLoading: true,
    loading: false,
    data: null,
    freeDb: {
      loading: false,
      data: null,
    },
  },
}

export const useOAuthStore = create<OAuthStore & OauthActions>()(
  immer(devtools((set, get) => ({
    ...initialOAuthState,
    // actions
    setSSOFlow: (ssoFlow) => set({ ssoFlow }),
    setJob: (job) => set({ job }),
    setAgreement: (agreement) => set({ agreement }),
    setOAuthCloudSource: (source) => set({ source }),
    showOAuthProgress: (showProgress) => set({ showProgress }),
    setSocialDialogState: (source) => set({
      source: source || get().source,
      isOpenSocialDialog: !!source,
    }),

    getUserInfo: () => set((state) => {
      state.user.loading = true
    }),
    getUserInfoSuccess: (data) => set((state) => {
      state.user.data = data
    }),
    getUserInfoFinal: () => set((state) => {
      state.user.loading = false
    }),
  }))),
)

// Asynchronous thunk action
export function createFreeDbJob({
  name,
  resources = {},
  onSuccessAction,
  onFailAction,
}: {
  name: CloudJobName,
  resources?: {
    planId?: number,
    databaseId?: number,
    subscriptionId?: number,
    region?: string,
    provider?: string,
    isRecommendedSettings?: boolean
  }
  onSuccessAction?: () => void,
  onFailAction?: () => void
}) {
  useOAuthStore.setState(async (state) => {
    try {
      const { data, status } = await apiService.post<CloudJobInfo>(
        ApiEndpoints.CLOUD_ME_JOBS,
        {
          name,
          runMode: 'async',
          data: resources,
        },
      )

      if (isStatusSuccessful(status)) {
        localStorageService.set(StorageItem.OAuthJobId, data.id)
        state.setJob(
          { id: data.id, name, status: CloudJobStatus.Running },
        )
        onSuccessAction?.()
      }
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as EnhancedAxiosError))
      state.setOAuthCloudSource(null)

      onFailAction?.()
    }
  })
}

// Asynchronous thunk action
export function fetchUserInfo(onSuccessAction?: (isSelectAccount: boolean) => void, onFailAction?: () => void) {
  useOAuthStore.setState(async (state) => {
    state.getUserInfo()

    try {
      const { data, status } = await apiService.get<CloudUser>(
        ApiEndpoints.CLOUD_ME,
        {
          params: getCloudSsoUtmParams(state.source),
        },
      )

      if (isStatusSuccessful(status)) {
        const isSignInFlow = state.ssoFlow === OAuthSocialAction.SignIn
        const isSelectAccount = !isSignInFlow && (data?.accounts?.length ?? 0) > 1

        if (isSelectAccount) {
          throw new Error('Multi account is not supported yet')
          // TODO: select account for SSO
          // state.setSelectAccountDialogState(true)
          // state.removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress)
        }

        state.getUserInfoSuccess(data)
        state.setSocialDialogState(null)

        onSuccessAction?.(isSelectAccount)
      }
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error as EnhancedAxiosError))
      state.setOAuthCloudSource(null)

      onFailAction?.()
    } finally {
      state.getUserInfoFinal()
    }
  })
}
