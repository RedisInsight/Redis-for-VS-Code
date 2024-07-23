import React from 'react'
import { render } from 'testSrc/helpers'

import { MonacoJson } from './MonacoJson'

describe('MonacoJson', () => {
  it('should render', () => {
    expect(render(<MonacoJson value="val" onChange={vi.fn()} />)).toBeTruthy()
  })
})
