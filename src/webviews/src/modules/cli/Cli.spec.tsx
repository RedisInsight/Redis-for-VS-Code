import React from 'react'
import { render } from 'testSrc/helpers'
import { Cli } from './Cli'

describe('CLI', () => {
  it('should render', () => {
    expect(render(<Cli />)).toBeTruthy()
  })
})
