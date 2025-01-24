import React from 'react'
import { render } from 'testSrc/helpers'

import OAuthAdvantages from './OAuthAdvantages'

describe('OAuthAdvantages', () => {
  it('should render', () => {
    expect(render(<OAuthAdvantages />)).toBeTruthy()
  })
})
