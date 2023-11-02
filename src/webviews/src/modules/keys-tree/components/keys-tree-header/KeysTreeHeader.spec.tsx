import React from 'react'

import { render } from 'testSrc/helpers'
import { KeysTreeHeader } from './KeysTreeHeader'

describe('KeysTreeHeaders', () => {
  it('should render', () => {
    expect(render(<KeysTreeHeader />)).toBeTruthy()
  })
})
