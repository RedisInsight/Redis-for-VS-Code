import React from 'react'
import { render } from 'testSrc/helpers'

import { UnsupportedTypeDetails } from './UnsupportedTypeDetails'

describe('UnsupportedTypeDetails', () => {
  it('should render', () => {
    expect(render(<UnsupportedTypeDetails />)).toBeTruthy()
  })
})
