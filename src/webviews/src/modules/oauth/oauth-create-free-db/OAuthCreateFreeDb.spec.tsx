import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import * as utils from 'uiSrc/utils'
import { OAuthSocialAction, OAuthSocialSource, VscodeMessageAction } from 'uiSrc/constants'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import { vscodeApi } from 'uiSrc/services'
import { cleanup, fireEvent, render } from 'testSrc/helpers'
import OAuthCreateFreeDb from './OAuthCreateFreeDb'

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(vscodeApi, 'postMessage')

beforeEach(() => {
  useOAuthStore.setState({
    ...initialOAuthState,
    source: 'source',
  })
  cleanup()
  vi.resetAllMocks()
})

describe('OAuthConnectFreeDb', () => {
  it('should render if there is a free cloud db', () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={OAuthSocialSource.ListOfDatabases}/>)
    expect(queryByTestId('create-free-db-btn')).toBeInTheDocument()
  })

  it('should send telemetry after click on connect btn', async () => {
    const { queryByTestId } = render(<OAuthCreateFreeDb source={OAuthSocialSource.ListOfDatabases} />)

    fireEvent.click(queryByTestId('create-free-db-btn') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: {
        source: OAuthSocialSource.ListOfDatabases,
      },
    })
  })

  it('should open page and oauth sso modal compressed button is clicked', () => {
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
  })
})
