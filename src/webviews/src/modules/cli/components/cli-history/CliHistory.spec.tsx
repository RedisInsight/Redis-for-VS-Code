import React from 'react'

import { render } from 'testSrc/helpers'
import { CliHistory } from './CliHistory'

describe('CliHistory', () => {
  it('should render', () => {
    expect(render(<CliHistory />)).toBeTruthy()
  })
})
