import { useEffect } from 'react'
import { get } from 'lodash'
import { useShallow } from 'zustand/react/shallow'

import { CloudJobStatus, CloudJobName, ApiStatusCode, StorageItem, CustomErrorCodes, CloudJobStep, VscodeMessageAction, OAuthSocialSource } from 'uiSrc/constants'
import { parseCustomError, TelemetryEvent, sendEventTelemetry, getApiErrorMessage } from 'uiSrc/utils'
import { showInfinityToast, removeInfinityToast, showErrorInfinityToast } from 'uiSrc/utils/notifications/toasts'
import { localStorageService, vscodeApi } from 'uiSrc/services'
import { createFreeDbJob, useOAuthStore } from 'uiSrc/store'
import { INFINITE_MESSAGES } from 'uiSrc/components'
import { CloudImportDatabaseResources } from '../interfaces'

const OAuthJobs = () => {
  const {
    status,
    jobName,
    error,
    step,
    result,
    showProgress,
    setSSOFlow,
    setJob,
    setSocialDialogState,
    source,
  } = useOAuthStore(useShallow((state) => ({
    status: state.job?.status,
    jobName: state.job?.name,
    error: state.job?.error,
    step: state.job?.step,
    result: state.job?.result,
    showProgress: state.showProgress,
    setSSOFlow: state.setSSOFlow,
    setJob: state.setJob,
    setSocialDialogState: state.setSocialDialogState,
    source: state.source,
  })))

  const onConnect = () => {
    if (source === OAuthSocialSource.AddDbForm) {
      vscodeApi.postMessage({
        action: VscodeMessageAction.CloseAddDatabase,
      })
    } else if (source === OAuthSocialSource.DatabasesList) {
      vscodeApi.postMessage({
        action: VscodeMessageAction.CloseOAuthSso,
      })
    }
  }

  useEffect(() => {
    switch (status) {
      case CloudJobStatus.Running:
        if (!showProgress) return

        showInfinityToast(INFINITE_MESSAGES.PENDING_CREATE_DB(step as CloudJobStep)?.Inner)
        break

      case CloudJobStatus.Finished:
        showInfinityToast(INFINITE_MESSAGES.SUCCESS_CREATE_DB(jobName, onConnect)?.Inner)

        setJob({
          id: '',
          name: CloudJobName.CreateFreeSubscriptionAndDatabase,
          status: '',
        })

        localStorageService.remove(StorageItem.OAuthJobId)

        vscodeApi.postMessage({ action: VscodeMessageAction.RefreshDatabases })

        onConnect()
        break

      case CloudJobStatus.Failed:
        const errorCode = get(error, 'errorCode', 0) as CustomErrorCodes
        const subscriptionId = get(error, 'resource.subscriptionId', 0)
        const resources = get(error, 'resource', {}) as CloudImportDatabaseResources
        const statusCode = get(error, 'statusCode', 0) as number

        if (statusCode === ApiStatusCode.Unauthorized) {
          // dispatch(logoutUserAction())
        }

        switch (errorCode) {
          case CustomErrorCodes.CloudDatabaseAlreadyExistsFree:
            showInfinityToast(
              INFINITE_MESSAGES.DATABASE_EXISTS(
                () => importDatabase(resources),
                closeImportDatabase,
              ).Inner)
            break

          case CustomErrorCodes.CloudSubscriptionAlreadyExistsFree:
            showInfinityToast(INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(
              () => createFreeDatabase(subscriptionId),
              closeCreateFreeDatabase,
            ).Inner)
            break

          default:
            const err = parseCustomError(error || '' as any)
            showErrorInfinityToast(getApiErrorMessage(err))
            break
        }

        setSSOFlow()
        setSocialDialogState(null)
        break

      default:
        break
    }
  }, [status, error, step, result, showProgress])

  const importDatabase = (resources: CloudImportDatabaseResources) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE,
    })
    createFreeDbJob({
      name: CloudJobName.ImportFreeDatabase,
      resources,
      onSuccessAction: () => {
        showInfinityToast(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)?.Inner)
      },
    })
  }

  const createFreeDatabase = (subscriptionId: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION,
    })
    createFreeDbJob({
      name: CloudJobName.CreateFreeDatabase,
      resources: { subscriptionId },
      onSuccessAction: () => {
        showInfinityToast(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)?.Inner)
      },
    })
  }

  const closeImportDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE_FORM_CLOSED,
    })
    removeInfinityToast()
    setSSOFlow()
  }

  const closeCreateFreeDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION_FORM_CLOSED,
    })
    removeInfinityToast()
    setSSOFlow()
  }

  return null
}

export default OAuthJobs
