import React, { useState } from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { OAuthSocialAction, OAuthStrategy, VscodeMessageAction } from 'uiSrc/constants'
import { enableUserAnalyticsAction } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { vscodeApi } from 'uiSrc/services'
import OAuthSsoForm from './components/oauth-sso-form'
import OAuthSocialButtons from '../oauth-social-buttons'
import { Props as OAuthSocialButtonsProps } from '../oauth-social-buttons/OAuthSocialButtons'

export interface Props extends OAuthSocialButtonsProps {
  action: OAuthSocialAction
  children: (
    form: React.ReactNode,
  ) => JSX.Element
}

export const OAuthForm = ({
  children,
  action,
  onClick,
  ...rest
}: Props) => {
  const [authStrategy, setAuthStrategy] = useState('')
  const [disabled, setDisabled] = useState(false)

  const initOAuthProcess = (strategy: OAuthStrategy, action: string) => {
    // TODO: signIn
    // dispatch(signIn())

    vscodeApi.postMessage({
      action: VscodeMessageAction.CloudOAuth,
      data: { action, strategy },
    })
  }

  const onSocialButtonClick = (authStrategy: OAuthStrategy) => {
    setDisabled(true)
    setTimeout(() => { setDisabled(false) }, 3_000)
    enableUserAnalyticsAction()
    setAuthStrategy(authStrategy)
    onClick?.(authStrategy)

    switch (authStrategy) {
      case OAuthStrategy.Google:
      case OAuthStrategy.GitHub:
        initOAuthProcess(authStrategy, action)
        break
      case OAuthStrategy.SSO:
        // ignore. sso email form will be shown
        break
      default:
        break
    }
  }

  const onSsoBackButtonClick = () => {
    setAuthStrategy('')
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_CANCELED,
      eventData: {
        action,
      },
    })
  }

  const onSsoLoginButtonClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_PROCEEDED,
      eventData: {
        action,
      },
    })
    initOAuthProcess(OAuthStrategy.SSO, action)
  }

  if (authStrategy === OAuthStrategy.SSO) {
    return (
      <OAuthSsoForm
        onBack={onSsoBackButtonClick}
        onSubmit={onSsoLoginButtonClick}
      />
    )
  }

  return (
    children(
      <OAuthSocialButtons
        onClick={onSocialButtonClick}
        {...rest}
        disabled={disabled}
      />,
    )
  )
}
