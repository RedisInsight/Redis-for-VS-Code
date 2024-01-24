import React from 'react'

import { render } from 'testSrc/helpers'
import { AddDatabasePage } from './AddDatabasePage'

describe('AddDatabasePage', () => {
  it('should render', () => {
    expect(render(<AddDatabasePage />)).toBeTruthy()
  })
})
