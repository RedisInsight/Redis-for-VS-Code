import React from 'react'

import { render } from 'testSrc/helpers'
import { EditDatabasePage } from './EditDatabasePage'

describe('EditDatabasePage', () => {
  it('should render', () => {
    expect(render(<EditDatabasePage />)).toBeTruthy()
  })
})
