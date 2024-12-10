import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { DatabaseIcon, Props } from './DatabaseIcon'

const mockedProps = mock<Props>()

describe('DatabaseIcon', () => {
  it('should render', async () => {
    expect(render(<DatabaseIcon {...instance(mockedProps)} />)).toBeTruthy()
  })
})
