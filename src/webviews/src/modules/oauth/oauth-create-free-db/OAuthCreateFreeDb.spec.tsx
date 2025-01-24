import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import * as utils from 'uiSrc/utils'
import { OAuthSocialSource } from 'uiSrc/constants'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import { cleanup, fireEvent, render } from 'testSrc/helpers'
import OAuthCreateFreeDb from './OAuthCreateFreeDb'

vi.spyOn(utils, 'sendEventTelemetry')

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
})
