import React from 'react'

import { render } from 'testSrc/helpers'
import { EulaPage } from './EulaPage'

describe('EulaPage', () => {
  it('should render', () => {
    expect(render(<EulaPage />)).toBeTruthy()
  })
})
