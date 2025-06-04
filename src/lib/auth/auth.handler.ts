import * as vscode from 'vscode'
import { createAuthStrategy } from './auth.factory'
import { CloudAuthRequestOptions } from './models/cloud-auth-request'
import { CloudAuthStatus } from './models/cloud-auth-response'
import { logger } from '../../logger'
import { getBackendCloudAuthService } from '../../server/bootstrapBackend'
import { DEFAULT_SESSION_ID, DEFAULT_USER_ID, ViewId } from '../../constants'
import { wrapErrorMessageSensitiveData } from '../../utils/wrapErrorSensitiveData'
import { WebviewPanel } from '../../Webview'

const authStrategy = createAuthStrategy()

export const signInCloudOauth = async (options: CloudAuthRequestOptions) => {
  try {
    await authStrategy.initialize(getBackendCloudAuthService())
    const { url } = await authStrategy.getAuthUrl({
      sessionMetadata: {
        sessionId: DEFAULT_SESSION_ID,
        userId: DEFAULT_USER_ID,
      },
      authOptions: {
        ...options,
        callback: getTokenCallbackFunction,
      },
    })

    await vscode.env.openExternal(vscode.Uri.parse(url))

    return {
      status: CloudAuthStatus.Succeed,
    }
  } catch (e) {
    const error = wrapErrorMessageSensitiveData(e as Error)
    getTokenCallbackFunction({ status: CloudAuthStatus.Failed, error })
    logger.logOAuth(error?.message)
    return error
  }
}

export const getTokenCallbackFunction = (response: any) => {
  WebviewPanel.getInstance({ viewId: ViewId.AddDatabase })?.postMessage({
    action: 'OAuthCallback',
    data: response,
  })
}

export const cloudOauthCallback = async (query: any) => {
  try {
    const result = await authStrategy.handleCallback(query)

    if (result.status === CloudAuthStatus.Failed) {
      logger.logOAuth(result?.error?.message)
      getTokenCallbackFunction(result)
    }
  } catch (e) {
    const error = wrapErrorMessageSensitiveData(e as Error)
    logger.logOAuth(error?.message)
    getTokenCallbackFunction({ status: CloudAuthStatus.Failed, error })
  }
}
