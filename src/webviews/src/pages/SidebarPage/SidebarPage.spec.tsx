import React from 'react'

import { render } from 'testSrc/helpers'
import { SidebarPage } from './SidebarPage'

describe('SidebarPage', () => {
  it('should render', () => {
    expect(render(<SidebarPage />)).toBeTruthy()
  })
})
