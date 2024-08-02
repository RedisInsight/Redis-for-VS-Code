import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { Tooltip, Props } from './Tooltip'

const mockedProps = mock<Props>()

describe('Tooltip', () => {
  it('should render', () => {
    expect(render(<Tooltip {...instance(mockedProps)} />)).toBeTruthy()
  })
})
