import React from 'react'

import { localStorageService } from 'uiSrc/services'
import { StorageItem } from 'uiSrc/constants'
import { initialOAuthState, useOAuthStore } from 'uiSrc/store'
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from 'testSrc/helpers'
import OAuthAgreement from './OAuthAgreement'

beforeEach(() => {
  cleanup()
  useOAuthStore.setState({ ...initialOAuthState,
    agreement: true,
  })
})

vi.spyOn(localStorageService, 'set')

describe('OAuthAgreement', () => {
  it('should render', () => {
    expect(render(<OAuthAgreement />)).toBeTruthy()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeChecked()
  })

  it('should call setAgreement and set value in local storage', () => {
    localStorageService.set = vi.fn()

    render(<OAuthAgreement />)

    fireEvent.click(screen.getByTestId('oauth-agreement-checkbox'))

    expect(localStorageService.set).toBeCalledWith(
      StorageItem.OAuthAgreement,
      false,
    )
  })
})
