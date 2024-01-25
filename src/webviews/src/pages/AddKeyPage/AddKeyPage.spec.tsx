import React from 'react'

import { render } from 'testSrc/helpers'
import { AddKeyPage } from './AddKeyPage'

describe('AddKeyPage', () => {
  it('should render', () => {
    expect(render(<AddKeyPage />)).toBeTruthy()
  })
})
