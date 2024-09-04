import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'testSrc/helpers'
import { RiButton, Props } from './RiButton'

const mockedProps = mock<Props>()

describe('RiButton', () => {
  it('should render', () => {
    expect(render(<RiButton {...instance(mockedProps)} />)).toBeTruthy()
  })
})
