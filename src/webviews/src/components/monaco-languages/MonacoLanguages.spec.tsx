import React from 'react'
import { render } from 'testSrc/helpers'

import { MonacoLanguages } from './MonacoLanguages'

describe('MonacoLanguages', () => {
  it('should render', () => {
    expect(render(<MonacoLanguages />)).toBeTruthy()
  })
})
