import React from 'react'

import { render } from 'testSrc/helpers'
import { WelcomePage } from './WelcomePage'

describe('WelcomePage', () => {
  it('should render', () => {
    expect(render(<WelcomePage />)).toBeTruthy()
  })
})
