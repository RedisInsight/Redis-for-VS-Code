import React from 'react'

import { render } from 'uiSrc/utils/tests'
import { KeysTreeHeader } from './KeysTreeHeader'

describe('KeysTreeHeaders', () => {
  it('should render', () => {
    expect(render(<KeysTreeHeader />)).toBeTruthy()
  })
})
