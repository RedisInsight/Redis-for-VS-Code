import React from 'react'
import { render, screen, fireEvent } from 'testSrc/helpers'

import OAuthRecommendedSettings from './OAuthRecommendedSettings'

describe('OAuthRecommendedSettings', () => {
  it('should render', () => {
    expect(render(<OAuthRecommendedSettings value onChange={vi.fn} />)).toBeTruthy()
  })

  it.skip('should call onChange after change value', () => {
    const onChange = vi.fn()
    render(<OAuthRecommendedSettings value onChange={onChange} />)

    fireEvent.click(screen.getByTestId('oauth-recommended-settings-checkbox'))

    expect(onChange).toBeCalledWith(false)
  })

  it('should show feature dependent items when feature flag is on', async () => {
    render(<OAuthRecommendedSettings value onChange={vi.fn} />)
    expect(screen.queryByTestId('oauth-recommended-settings-checkbox')).toBeInTheDocument()
  })
})
