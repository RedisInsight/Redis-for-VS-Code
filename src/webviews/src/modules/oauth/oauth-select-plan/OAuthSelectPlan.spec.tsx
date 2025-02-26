import React from 'react'

import { Mock } from 'vitest'
import { CloudSubscriptionPlanResponse, OAuthStore } from 'uiSrc/store/hooks/use-oauth/interface'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import * as utils from 'uiSrc/utils'
import { sendEventTelemetry } from 'uiSrc/utils'
import { MOCK_CUSTOM_REGIONS, MOCK_REGIONS } from 'uiSrc/constants/mocks/mock-sso'
import { fireEvent, render, screen } from 'testSrc/helpers'
import OAuthSelectPlan from './OAuthSelectPlan'

const customState: OAuthStore = {
  ...initialOAuthState,
  plan: {
    ...initialOAuthState.plan,
    isOpenDialog: true,
    data: [],
  },
}

beforeEach(() => {
  useOAuthStore.setState(customState)
})

vi.spyOn(utils, 'sendEventTelemetry')

describe('OAuthSelectPlan', () => {
  beforeEach(() => {
    useOAuthStore.setState({
      ...customState,
      plan: {
        ...customState.plan,
        isOpenDialog: true,
        data: MOCK_REGIONS as CloudSubscriptionPlanResponse[],
      },
    })
  })

  it('should render', () => {
    expect(render(<OAuthSelectPlan />)).toBeTruthy()
  })

  it('should not render if isOpenDialog=false', () => {
    useOAuthStore.setState({
      ...customState,
      plan: {
        ...customState.plan,
        isOpenDialog: false,
      },
    })

    const { queryByTestId } = render(<OAuthSelectPlan />)

    expect(queryByTestId('oauth-select-plan-dialog')).not.toBeInTheDocument()
  })

  it('should send telemetry after close modal', async () => {
    const sendEventTelemetryMock = vi.fn();
    (sendEventTelemetry as Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<OAuthSelectPlan />)

    fireEvent.click(screen.getByTestId('close-icon-oauth-select-plan-dialog'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: utils.TelemetryEvent.CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED,
    })
  })

  it('should be selected first region by default', async () => {
    useOAuthStore.setState({
      ...customState,
      plan: {
        ...customState.plan,
        isOpenDialog: true,
        data: MOCK_CUSTOM_REGIONS as CloudSubscriptionPlanResponse[],
      },
    })

    const { queryByTestId } = render(<OAuthSelectPlan />)

    const selectedElement = queryByTestId('option-custom-1')

    expect(selectedElement).toBeInTheDocument()
  })

  it('should display text if regions is no available on this vendor', async () => {
    useOAuthStore.setState({
      ...customState,
      plan: {
        ...customState.plan,
        isOpenDialog: true,
        data: [],
      },
    })

    const { queryByTestId } = render(<OAuthSelectPlan />)

    const selectDescriptionElement = queryByTestId('select-region-select-description')

    expect(selectDescriptionElement).toBeInTheDocument()
    expect(selectDescriptionElement).toHaveTextContent('No regions available, try another vendor.')
  })
})
