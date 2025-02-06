import React from 'react'

import { OAuthSocialAction } from 'uiSrc/constants'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import { OAuthStore } from 'uiSrc/store/hooks/use-oauth/interface'
import { render, screen } from 'testSrc/helpers'
import OAuthSsoDialog from './OAuthSsoDialog'

const customState: OAuthStore = {
  ...initialOAuthState,
  agreement: true,
  isOpenSocialDialog: true,
  source: 'source',
}

beforeEach(() => {
  useOAuthStore.setState(customState)
})

describe('OAuthSsoDialog', () => {
  it('should render', () => {
    expect(render(<OAuthSsoDialog />)).toBeTruthy()
  })

  it('should render proper modal with ssoFlow = OAuthSocialAction.Create', () => {
    useOAuthStore.setState({
      ...customState,
      ssoFlow: OAuthSocialAction.Create,
    })
    render(<OAuthSsoDialog />)

    expect(screen.getByTestId('oauth-container-create-db')).toBeInTheDocument()
  })

  it.skip('should render proper modal with ssoFlow = OAuthSocialAction.Import', () => {
    useOAuthStore.setState({
      ...customState,
      ssoFlow: OAuthSocialAction.Import,
    })
    render(<OAuthSsoDialog />)

    expect(screen.getByTestId('oauth-container-signIn')).toBeInTheDocument()
  })

  it.skip('should render proper modal with ssoFlow = OAuthSocialAction.SignIn', () => {
    useOAuthStore.setState({
      ...customState,
      ssoFlow: OAuthSocialAction.SignIn,
    })
    render(<OAuthSsoDialog />)

    expect(screen.getByTestId('oauth-container-signIn')).toBeInTheDocument()
  })
})
