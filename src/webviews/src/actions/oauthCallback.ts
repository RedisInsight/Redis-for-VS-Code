import { INFINITE_MESSAGES } from 'uiSrc/components'
import { CloudAuthStatus, CloudJobName, CloudJobStep, OAuthSocialAction, StorageItem } from 'uiSrc/constants'
import { CustomError } from 'uiSrc/interfaces'
import { CloudAuthResponse } from 'uiSrc/modules/oauth/interfaces'
import { localStorageService } from 'uiSrc/services'
import { createFreeDbJob, fetchCloudSubscriptionPlans, fetchUserInfo, useOAuthStore } from 'uiSrc/store'
import { getApiErrorMessage, parseCustomError, removeInfinityToast, showErrorInfinityToast, showInfinityToast } from 'uiSrc/utils'

let isFlowInProgress = false

export const processOauthCallback = ({ status, message = '', error }: CloudAuthResponse) => {
  const {
    ssoFlow,
    isRecommendedSettings,
    setSSOFlow,
    setJob,
    showOAuthProgress,
    setSocialDialogState,
    setOAuthCloudSource,
  } = useOAuthStore.getState()

  const fetchUserInfoSuccess = (isSelectAccount: boolean) => {
    if (isSelectAccount) return

    if (ssoFlow === OAuthSocialAction.SignIn) {
      setSSOFlow(undefined)
      removeInfinityToast()
      return
    }

    if (isRecommendedSettings) {
      createFreeDbJob({
        name: CloudJobName.CreateFreeSubscriptionAndDatabase,
        resources: {
          isRecommendedSettings,
        },
        onSuccessAction: () => {
          showInfinityToast(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials).Inner)
        },
        onFailAction: () => {
          removeInfinityToast()
        },
      })

      return
    }

    showInfinityToast(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials).Inner)

    // TODO: SSO Autodiscovery import
    // if (ssoFlowRef.current === OAuthSocialAction.Import) {
    //   dispatch(fetchSubscriptionsRedisCloud(
    //     null,
    //     true,
    //     () => {
    //       closeInfinityNotification()
    //       history.push(Pages.redisCloudSubscriptions)
    //     },
    //     closeInfinityNotification,
    //   ))
    //   return
    // }

    fetchCloudSubscriptionPlans()
  }

  setJob({ id: '', name: CloudJobName.CreateFreeSubscriptionAndDatabase, status: '' })

  if (status === CloudAuthStatus.Succeed) {
    localStorageService.remove(StorageItem.OAuthJobId)
    showOAuthProgress(true)
    showInfinityToast(INFINITE_MESSAGES.AUTHENTICATING()?.Inner)
    setSocialDialogState(null)

    fetchUserInfo(fetchUserInfoSuccess)
    isFlowInProgress = true
  }

  if (status === CloudAuthStatus.Failed) {
    // don't do anything, because we are processing something
    // covers situation when were made several clicks on the same time
    if (isFlowInProgress) {
      return
    }

    const err = parseCustomError((error as CustomError) || message || '')
    setOAuthCloudSource(null)
    showErrorInfinityToast(getApiErrorMessage(err))
  }
}
