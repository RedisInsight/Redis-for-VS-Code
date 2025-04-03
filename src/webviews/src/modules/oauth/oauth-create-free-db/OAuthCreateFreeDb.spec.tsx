import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import * as utils from 'uiSrc/utils'
import { OAuthSocialAction, OAuthSocialSource, VscodeMessageAction } from 'uiSrc/constants'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import { vscodeApi } from 'uiSrc/services'
import { cleanup, fireEvent, render, screen } from 'testSrc/helpers'
import OAuthCreateFreeDb from './OAuthCreateFreeDb'
import OAuthSsoDialog from '../oauth-sso-dialog'

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(vscodeApi, 'postMessage')

beforeEach(() => {
  useOAuthStore.setState({
    ...initialOAuthState,
    source: null,
    ssoFlow: undefined,
  })
  cleanup()
  vi.resetAllMocks()
})

describe('OAuthCreateFreeDb', () => {
  it('should render if there is a free cloud db', () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={OAuthSocialSource.AddDbForm}/>)
    expect(queryByTestId('create-free-db-btn')).toBeInTheDocument()
  })

  it('should send telemetry after click on connect btn', async () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={OAuthSocialSource.DatabasesList} />)

    fireEvent.click(queryByTestId('create-free-db-btn') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: {
        source: OAuthSocialSource.DatabasesList,
      },
    })
  })

  it('should set the propper state variables when action is triggered with with valid ssoFlow and source', () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={OAuthSocialSource.DatabasesList} compressed={true}/>)
    render(<OAuthSsoDialog />)

    const compressedCreateBtn = queryByTestId('create-free-db-btn')
    expect(compressedCreateBtn).toBeInTheDocument()

    fireEvent.click(compressedCreateBtn as HTMLButtonElement)

    expect(vscodeApi.postMessage).toBeCalledWith({
      action: VscodeMessageAction.OpenAddDatabase,
      data: {
        ssoFlow: OAuthSocialAction.Create,
        source: OAuthSocialSource.DatabasesList,
      },
    })
  })

  it('should set the propper state variables when action is triggered with source null', () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={null} compressed={true}/>)
    render(<OAuthSsoDialog />)

    const compressedCreateBtn = queryByTestId('create-free-db-btn')
    expect(compressedCreateBtn).toBeInTheDocument()

    fireEvent.click(compressedCreateBtn as HTMLButtonElement)

    expect(vscodeApi.postMessage).toBeCalledWith({
      action: VscodeMessageAction.OpenAddDatabase,
      data: {
        ssoFlow: OAuthSocialAction.Create,
        source: null,
      },
    })
  })

  it('should open auth sso dialog when non compressed button is clicked', () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={OAuthSocialSource.DatabasesList} compressed={false}/>)

    // component is initialized in the document, but the state is not updated yet to show the dialog
    render(<OAuthSsoDialog />)
    const oauthDialogId = 'social-oauth-dialog'
    expect(screen.queryByTestId(oauthDialogId)).not.toBeInTheDocument()

    const regularCreateBtn = queryByTestId('create-free-db-btn')
    expect(regularCreateBtn).toBeInTheDocument()

    fireEvent.click(regularCreateBtn as HTMLButtonElement)

    expect(screen.queryByTestId(oauthDialogId)).toBeInTheDocument()
  })
})
