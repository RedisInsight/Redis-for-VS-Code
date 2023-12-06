import React from 'react'

import { render } from 'testSrc/helpers'
import { KeyDetailsPage } from './KeyDetailsPage'

describe('KeyDetailsPage', () => {
  it('should render', () => {
    expect(render(<KeyDetailsPage />)).toBeTruthy()
  })
})
