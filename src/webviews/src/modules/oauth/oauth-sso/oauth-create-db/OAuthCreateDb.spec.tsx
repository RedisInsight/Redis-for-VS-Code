import React from 'react'

import { sendEventTelemetry, showInfinityToast, TelemetryEvent } from 'uiSrc/utils'
import * as utils from 'uiSrc/utils'
import { CloudJobName, CloudJobStatus, CloudJobStep, OAuthSocialAction, OAuthStrategy } from 'uiSrc/constants'
import { MOCK_OAUTH_SSO_EMAIL } from 'uiSrc/mocks/data/oauth'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import { INFINITE_MESSAGES } from 'uiSrc/components'
import { act, cleanup, constants, fireEvent, render, screen } from 'testSrc/helpers'
import OAuthCreateDb from './OAuthCreateDb'
import { LOGIN_EVERY_TIME } from './constants'

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(utils, 'showInfinityToast')

beforeEach(() => {
  useOAuthStore.setState({ ...initialOAuthState,
    agreement: true,
  })
})

beforeEach(() => {
  cleanup()
})

describe('OAuthCreateDb', () => {
  it('should render proper components ', () => {
    expect(render(<OAuthCreateDb />)).toBeTruthy()
  })

  it('should render proper components if user is not logged in', () => {
    render(<OAuthCreateDb />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-container-social-buttons')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-recommended-settings-checkbox')).toBeInTheDocument()
  })

  it('should call proper actions after click on sso sign button', async () => {
    render(<OAuthCreateDb />)

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: OAuthStrategy.SSO,
        action: OAuthSocialAction.Create,
        cloudRecommendedSettings: 'enabled',
      },
    })

    await act(async () => {
      fireEvent.change(screen.getByTestId('sso-email'), { target: { value: MOCK_OAUTH_SSO_EMAIL } })
    })

    expect(screen.getByTestId('btn-submit')).not.toBeDisabled()

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-submit'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_PROCEEDED,
      eventData: {
        action: OAuthSocialAction.Create,
      },
    })
  })

  it('should call proper actions after click on sign button', () => {
    render(<OAuthCreateDb />)

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: OAuthStrategy.Google,
        action: OAuthSocialAction.Create,
        cloudRecommendedSettings: 'enabled',
      },
    })
  })

  it('should call proper actions after click on sign button w/o recommended settings', async () => {
    render(<OAuthCreateDb />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('oauth-recommended-settings-checkbox'))
    })

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: OAuthStrategy.Google,
        action: OAuthSocialAction.Create,
        cloudRecommendedSettings: 'disabled',
      },
    })

    expect(useOAuthStore.getState().isOpenSocialDialog).toEqual(false)
  })

  it.skipIf(LOGIN_EVERY_TIME)('should render proper components when user is logged in', () => {
    useOAuthStore.setState({ ...initialOAuthState,
      agreement: true,
      user: {
        ...initialOAuthState.user,
        data: {},
      },
    })

    render(<OAuthCreateDb />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-recommended-settings-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-create-db')).toBeInTheDocument()

    expect(screen.queryByTestId('oauth-agreement-checkbox')).not.toBeInTheDocument()
    expect(screen.queryByTestId('oauth-container-social-buttons')).not.toBeInTheDocument()
  })

  it.skipIf(!LOGIN_EVERY_TIME)('should render oauth form elements if user logged in', () => {
    useOAuthStore.setState({ ...initialOAuthState,
      agreement: true,
      user: {
        ...initialOAuthState.user,
        data: {},
      },
    })

    render(<OAuthCreateDb />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-recommended-settings-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-container-social-buttons')).toBeInTheDocument()

    expect(screen.queryByTestId('oauth-create-db')).not.toBeInTheDocument()
  })

  it.skipIf(LOGIN_EVERY_TIME)('should call proper actions after click create', async () => {
    const name = CloudJobName.CreateFreeSubscriptionAndDatabase
    useOAuthStore.setState({ ...initialOAuthState,
      agreement: true,
      user: {
        ...initialOAuthState.user,
        data: {},
      },
    })

    render(<OAuthCreateDb />)

    await act(() => {
      fireEvent.click(screen.getByTestId('oauth-create-db'))
    })

    expect(showInfinityToast).toBeCalledWith(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials).Inner)

    expect(useOAuthStore.getState().isOpenSocialDialog).toEqual(false)
    expect(useOAuthStore.getState().job).toEqual(
      { id: constants.USER_JOBS_DATA.id, name, status: CloudJobStatus.Running },
    )
  })

  it.skipIf(LOGIN_EVERY_TIME)('should call proper actions after click create without recommened settings', async () => {
    useOAuthStore.setState({ ...initialOAuthState,
      agreement: true,
      source: 'source',
      user: {
        ...initialOAuthState.user,
        data: {},
      },
    })
    render(<OAuthCreateDb />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('oauth-recommended-settings-checkbox'))
    })

    fireEvent.click(screen.getByTestId('oauth-create-db'))

    expect(showInfinityToast).toBeCalledWith(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials).Inner)
    expect(useOAuthStore.getState().isOpenSocialDialog).toEqual(false)
    expect(useOAuthStore.getState().plan.loading).toEqual(true)
  })
})
