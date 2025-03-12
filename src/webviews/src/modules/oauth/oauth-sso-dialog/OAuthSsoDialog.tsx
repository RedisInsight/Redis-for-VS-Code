import React, { useCallback } from 'react'
import cx from 'classnames'
import { useShallow } from 'zustand/react/shallow'
import Popup from 'reactjs-popup'
import { VscClose } from 'react-icons/vsc'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { useOAuthStore } from 'uiSrc/store'
import { OAuthSocialAction, OAuthSocialSource, VscodeMessageAction } from 'uiSrc/constants'
import { RiButton } from 'uiSrc/ui'
import { vscodeApi } from 'uiSrc/services'
import { OAuthCreateDb } from '../oauth-sso'
import styles from './styles.module.scss'

const OAuthSsoDialog = () => {
  const {
    isOpenSocialDialog,
    source,
    ssoFlow,
    setSocialDialogState,
  } = useOAuthStore(useShallow((state) => ({
    isOpenSocialDialog: state.isOpenSocialDialog,
    source: state.source,
    ssoFlow: state.ssoFlow,
    setSocialDialogState: state.setSocialDialogState,
  })))

  const handleClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_FORM_CLOSED,
      eventData: {
        action: ssoFlow,
      },
    })

    if (source === OAuthSocialSource.DatabasesList) {
      vscodeApi.postMessage({
        action: VscodeMessageAction.CloseOAuthSso,
      })
    }

    setSocialDialogState(null)
  }, [ssoFlow])

  if (!isOpenSocialDialog || !ssoFlow) {
    return null
  }

  return (
    <Popup
      modal
      open={!!ssoFlow}
      closeOnDocumentClick={false}
      className="oauth-sso-dialog"
     >
      <RiButton className="absolute top-4 right-4" onClick={handleClose} >
        <VscClose />
      </RiButton>
      <div
        className={cx(styles.modal, {
          [styles.createDb]: ssoFlow === OAuthSocialAction.Create,
          [styles.signIn]: ssoFlow === OAuthSocialAction.SignIn,
          [styles.import]: ssoFlow === OAuthSocialAction.Import,
        })}
        data-testid="social-oauth-dialog"
      >
        {ssoFlow === 'create' && <OAuthCreateDb source={source} />}
        {/* TODO: Signin and Import */}
        {/* {ssoFlow === 'signIn' && <OAuthSignIn source={source} />} */}
        {/* {ssoFlow === 'import' && (<OAuthSignIn action="import" source={source} />)} */}
      </div>
    </Popup>
  )
}

export default OAuthSsoDialog
