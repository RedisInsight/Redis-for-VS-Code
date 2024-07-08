import React from 'react'

import { render } from 'testSrc/helpers'
import { MainPage } from './MainPage'

describe('DatabasePage', () => {
  it('should render', () => {
    expect(render(<MainPage />)).toBeTruthy()
  })
})
