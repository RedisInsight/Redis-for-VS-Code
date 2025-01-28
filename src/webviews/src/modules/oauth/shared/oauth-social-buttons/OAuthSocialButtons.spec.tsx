import React from 'react'
import { OAuthStrategy } from 'uiSrc/constants'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store/hooks/use-oauth/useOAuthStore'
import { render, fireEvent, screen, waitForStack } from 'testSrc/helpers'
import OAuthSocialButtons from './OAuthSocialButtons'

beforeEach(() => {
  useOAuthStore.setState({ ...initialOAuthState,
    agreement: true,
  })
})

describe('OAuthSocialButtons', () => {
  it('should render', () => {
    expect(render(<OAuthSocialButtons onClick={vi.fn()} />)).toBeTruthy()
  })

  it('should call proper actions after click on google', () => {
    const onClick = vi.fn()
    render(<OAuthSocialButtons onClick={onClick} />)

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(onClick).toBeCalledWith(OAuthStrategy.Google)
  })

  it('should call proper actions after click on github', async () => {
    const onClick = vi.fn()
    render(<OAuthSocialButtons onClick={onClick} />)

    fireEvent.click(screen.getByTestId('github-oauth'))

    await waitForStack()

    expect(onClick).toBeCalledWith(OAuthStrategy.GitHub)
  })

  it('should call proper actions after click on sso', () => {
    const onClick = vi.fn()
    render(<OAuthSocialButtons onClick={onClick} />)

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(onClick).toBeCalledWith(OAuthStrategy.SSO)
  })
})
