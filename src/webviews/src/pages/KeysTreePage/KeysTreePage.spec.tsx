import React from 'react'

import { render } from 'testSrc/helpers'
import { KeysTreePage } from './KeysTreePage'

describe('KeysTreePage', () => {
  it('should render', () => {
    expect(render(<KeysTreePage />)).toBeTruthy()
  })
})
