import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import * as utils from 'uiSrc/utils'
import { OAuthSocialAction, OAuthSocialSource, VscodeMessageAction } from 'uiSrc/constants'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import { vscodeApi } from 'uiSrc/services'
import { cleanup, fireEvent, render, waitFor } from 'testSrc/helpers'
import OAuthCreateFreeDb from './OAuthCreateFreeDb'

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

describe('OAuthConnectFreeDb', () => {
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

  it('should open add database page and oauth sso modal when compressed button is clicked', () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={OAuthSocialSource.DatabasesList} compressed={true}/>)

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

    const state = useOAuthStore.getState()
    const socialDialog = queryByTestId('social-oauth-dialog')
    waitFor(() => {
      expect(state.ssoFlow).toEqual(OAuthSocialAction.Create)
      expect(state.isOpenSocialDialog).toEqual(true)
      expect(socialDialog).toBeInTheDocument()
    })
  })

  it('should open auth sso modal when non compressed button is clicked', () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={OAuthSocialSource.DatabasesList} compressed={false}/>)

    const regularCreateBtn = queryByTestId('create-free-db-btn')
    expect(regularCreateBtn).toBeInTheDocument()

    fireEvent.click(regularCreateBtn as HTMLButtonElement)

    const state = useOAuthStore.getState()
    expect(state.ssoFlow).toEqual(OAuthSocialAction.Create)
    expect(state.isOpenSocialDialog).toEqual(true)

    const socialDialog = queryByTestId('social-oauth-dialog')
    waitFor(() => expect(socialDialog).toBeInTheDocument())
  })
})
