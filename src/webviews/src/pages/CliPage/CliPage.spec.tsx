import React from 'react'

import { render } from 'testSrc/helpers'
import { CliPage } from './CliPage'

describe('CliPage', () => {
  it('should render', () => {
    expect(render(<CliPage />)).toBeTruthy()
  })
})
