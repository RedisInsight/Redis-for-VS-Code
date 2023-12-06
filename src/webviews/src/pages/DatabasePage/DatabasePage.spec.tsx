import React from 'react'

import { render } from 'testSrc/helpers'
import { DatabasePage } from './DatabasePage'

describe('DatabasePage', () => {
  it('should render', () => {
    expect(render(<DatabasePage />)).toBeTruthy()
  })
})
