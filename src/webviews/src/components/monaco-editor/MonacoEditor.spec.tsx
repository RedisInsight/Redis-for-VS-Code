import React from 'react'
import { render } from 'testSrc/helpers'

import MonacoEditor from './MonacoEditor'

describe('MonacoEditor', () => {
  it('should render', () => {
    expect(render(<MonacoEditor value="val" onChange={vi.fn()} language="val" />)).toBeTruthy()
  })
})
