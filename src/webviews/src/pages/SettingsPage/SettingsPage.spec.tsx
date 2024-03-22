import React from 'react'

import { render } from 'testSrc/helpers'
import { SettingsPage } from './SettingsPage'

describe('SettingsPage', () => {
  it('should render', () => {
    expect(render(<SettingsPage />)).toBeTruthy()
  })
})
