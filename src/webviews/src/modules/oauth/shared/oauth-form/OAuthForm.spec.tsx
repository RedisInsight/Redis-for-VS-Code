import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { OAuthSocialAction, OAuthStrategy } from 'uiSrc/constants'
import { MOCK_OAUTH_SSO_EMAIL } from 'uiSrc/mocks/data/oauth'
import * as utils from 'uiSrc/utils'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store/hooks/use-oauth/useOAuthStore'
import { render, cleanup, fireEvent, screen, act, waitFor } from 'testSrc/helpers'
import { OAuthForm } from './OAuthForm'

vi.spyOn(utils, 'sendEventTelemetry')

beforeEach(() => {
  useOAuthStore.setState({ ...initialOAuthState,
    agreement: true,
    source: 'source',
  })
})
beforeEach(() => {
  cleanup()
  vi.resetAllMocks()
})

describe('OAuthForm', () => {
  it('should render', () => {
    expect(render(
      <OAuthForm
        action={OAuthSocialAction.Create}
        onClick={() => {}}
       >
        {(children) => (<>{children}</>)}</OAuthForm>),
    ).toBeTruthy()
  })

  it('should call proper actions after click on google', () => {
    const onClick = vi.fn()
    render(<OAuthForm action={OAuthSocialAction.Create} onClick={onClick}>{(children) => (<>{children}</>)}</OAuthForm>)

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(onClick).toBeCalledWith(OAuthStrategy.Google)
  })

  it('should call proper actions after click on sso', async () => {
    const onClick = vi.fn()
    render(<OAuthForm action={OAuthSocialAction.Create} onClick={onClick}>{(children) => (<>{children}</>)}</OAuthForm>)

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()

    await act(async () => {
      fireEvent.change(screen.getByTestId('sso-email'), { target: { value: MOCK_OAUTH_SSO_EMAIL } })
    })

    expect(screen.getByTestId('btn-submit')).not.toBeDisabled()

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-submit'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_PROCEEDED,
      eventData: { action: OAuthSocialAction.Create },
    })

    expect(onClick).toBeCalledWith(OAuthStrategy.SSO)
  })

  it('should go back to main oauth form by clicking to back button', async () => {
    const onClick = vi.fn()
    render(<OAuthForm action={OAuthSocialAction.Create} onClick={onClick}>{(children) => (<>{children}</>)}</OAuthForm>)

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()
    expect(screen.getByTestId('btn-back')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('btn-back'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_CANCELED,
      eventData: { action: OAuthSocialAction.Create },
    })

    expect(screen.getByTestId('sso-oauth')).toBeInTheDocument()
  })

  it('should disable submit button id incorrect email provided', async () => {
    const onClick = vi.fn()
    render(<OAuthForm action={OAuthSocialAction.Create} onClick={onClick}>{(children) => (<>{children}</>)}</OAuthForm>)

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(screen.getByTestId('sso-email')).toBeInTheDocument()

    await act(async () => {
      fireEvent.input(screen.getByTestId('sso-email'), { target: { value: 'bad-email' } })
    })

    const submitBtn = screen.getByTestId('btn-submit') as HTMLButtonElement
    expect(submitBtn?.disabled).toBe(true)

    await act(async () => {
      fireEvent.mouseOver(submitBtn)
    })

    await act(async () => {
      fireEvent.click(submitBtn)
    })
  })
})
