import React from 'react'

import { render } from 'testSrc/helpers'
import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
  it('should render', () => {
    expect(render(<NotFoundPage />)).toBeTruthy()
  })
})
